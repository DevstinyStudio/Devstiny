import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service.js';

const resend = new Resend(process.env.RESEND_API_KEY);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const player = await this.prisma.player.findUnique({
      where: { email },
      include: { progress: { select: { costume: true } } },
    });
    if (!player) throw new UnauthorizedException('Invalid credentials.');

    const valid = await bcrypt.compare(password, player.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials.');

    if (!player.emailVerified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
    }

    return {
      access_token: this.jwt.sign({ sub: player.id, email: player.email, role: player.role }),
      user: {
        id: player.id, email: player.email,
        username: player.username, role: player.role,
        costume: player.progress?.costume ?? '1',
      },
    };
  }

  async register(username: string, email: string, password: string) {
    const existing = await this.prisma.player.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === email ? 'Email already in use.' : 'Username already taken.',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const player = await this.prisma.player.create({
      data: {
        username, email, passwordHash,
        emailVerified: false,
        progress: { create: { xp: 0, currentChapter: 'prologue' } },
      },
    });

    try {
      await this.sendVerificationEmail(player.id, email);
    } catch (err) {
      console.error('[Auth] Failed to send verification email to', email, err);
    }

    return { message: 'Account created! Check your email to verify your account before logging in.' };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerificationToken.findUnique({ where: { token } });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification link.');
    }

    const player = await this.prisma.player.update({
      where: { id: record.playerId },
      data: { emailVerified: true },
      include: { progress: { select: { costume: true } } },
    });

    await this.prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    return {
      message: 'Email verified! Welcome to Devstiny.',
      access_token: this.jwt.sign({ sub: player.id, email: player.email, role: player.role }),
      user: {
        id: player.id, email: player.email,
        username: player.username, role: player.role,
        costume: player.progress?.costume ?? '1',
      },
    };
  }

  async resendVerification(email: string) {
    const successMsg = { message: 'If that email is registered and unverified, a new link has been sent.' };

    const player = await this.prisma.player.findUnique({ where: { email } });
    if (!player || player.emailVerified) return successMsg;

    await this.prisma.emailVerificationToken.updateMany({
      where: { playerId: player.id, used: false },
      data: { used: true },
    });

    await this.sendVerificationEmail(player.id, email);
    return successMsg;
  }

  async forgotPassword(email: string) {
    const player = await this.prisma.player.findUnique({ where: { email } });

    const successMsg = { message: 'If that email is registered, you will receive a reset link shortly.' };
    if (!player) return successMsg;

    await this.prisma.passwordResetToken.updateMany({
      where: { playerId: player.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { token, playerId: player.id, expiresAt },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4001';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'Devstiny <noreply@devstiny.com>',
      to: email,
      subject: '🔑 Reset Your Password — Devstiny',
      html: buildEmailHtml({
        heading: 'PASSWORD RECOVERY',
        body: `A password reset was requested for your Devstiny account. Click the button below to choose a new password. This link expires in <strong style="color:#FFE66D">1 hour</strong>.`,
        btnText: '▶ RESET PASSWORD',
        btnHref: resetUrl,
        linkUrl: resetUrl,
        note: "If you didn't request a password reset, you can safely ignore this email.",
      }),
    });

    return successMsg;
  }

  async resetPassword(token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await Promise.all([
      this.prisma.player.update({
        where: { id: record.playerId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Password updated successfully. You can now log in.' };
  }

  private async sendVerificationEmail(playerId: string, email: string) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.emailVerificationToken.create({
      data: { token, playerId, expiresAt },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4001';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    await resend.emails.send({
      from: 'Devstiny <noreply@devstiny.com>',
      to: email,
      subject: '✉️ Verify Your Email — Devstiny',
      html: buildEmailHtml({
        heading: 'VERIFY YOUR EMAIL',
        body: `Welcome to Devstiny! Click the button below to verify your email address and begin your adventure. This link expires in <strong style="color:#FFE66D">24 hours</strong>.`,
        btnText: '▶ VERIFY EMAIL',
        btnHref: verifyUrl,
        linkUrl: verifyUrl,
        note: "If you didn't create a Devstiny account, you can safely ignore this email.",
      }),
    });
  }
}

function buildEmailHtml(opts: {
  heading: string;
  body: string;
  btnText: string;
  btnHref: string;
  linkUrl: string;
  note: string;
}) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { background:#0F172A;color:#CBD5E1;font-family:Inter,sans-serif;margin:0;padding:0 }
      .container { max-width:480px;margin:40px auto;padding:32px;border:2px solid #334155;background:#1E293B }
      .title { color:#FFE66D;font-size:18px;letter-spacing:4px;margin:0 0 6px;font-family:monospace;text-align:center }
      .sub { color:#94A3B8;font-size:11px;letter-spacing:2px;font-family:monospace;text-align:center;margin:0 0 20px }
      .divider { border:none;border-top:2px solid #FFE66D;margin:20px 0 }
      .body { font-size:14px;line-height:1.7;color:#94A3B8 }
      .btn { display:block;width:fit-content;margin:24px auto;padding:14px 32px;background:#FFE66D;color:#0F172A;text-decoration:none;font-family:monospace;font-size:11px;letter-spacing:3px;font-weight:bold }
      .link { word-break:break-all;font-size:12px;color:#4ECDC4 }
      .note { font-size:12px;color:#475569;margin-top:20px;text-align:center }
      .footer { text-align:center;font-size:11px;color:#334155;margin-top:32px;letter-spacing:2px;font-family:monospace }
    </style>
  </head>
  <body>
    <div class="container">
      <p class="title">◈ DEVSTINY ◈</p>
      <p class="sub">${opts.heading}</p>
      <hr class="divider" />
      <div class="body">
        <p>${opts.body}</p>
        <a href="${opts.btnHref}" class="btn">${opts.btnText}</a>
        <p>If the button doesn't work, copy and paste this link:</p>
        <p class="link">${opts.linkUrl}</p>
      </div>
      <p class="note">${opts.note}</p>
      <hr class="divider" />
      <p class="footer">◆ DEVSTINY — THE DEVELOPER'S REALM ◆</p>
    </div>
  </body>
</html>`;
}
