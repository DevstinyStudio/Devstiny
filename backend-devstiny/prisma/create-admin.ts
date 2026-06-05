/**
 * Creates the production admin account.
 * Run ONCE after deploying to a fresh database.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourStrongPassword npx ts-node --esm prisma/create-admin.ts
 *
 * Or set them in .env temporarily before running.
 */

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME ?? "admin";

  if (!email || !password) {
    console.error("❌ Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.");
    console.error("   Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=MyStr0ngPass npx ts-node --esm prisma/create-admin.ts");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("❌ ADMIN_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }

  const existing = await prisma.player.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    // If already exists, just ensure role is ADMIN and emailVerified
    await prisma.player.update({
      where: { id: existing.id },
      data: { role: "ADMIN", emailVerified: true },
    });
    console.log(`✅ Existing account "${existing.username}" promoted to ADMIN.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.player.create({
    data: {
      email,
      username,
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
      progress: { create: { xp: 0 } },
    },
  });

  console.log(`✅ Admin account created:`);
  console.log(`   Username : ${admin.username}`);
  console.log(`   Email    : ${admin.email}`);
  console.log(`   Role     : ADMIN`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
