import {
  Controller, Get, Post, Delete, Query, Body,
  UploadedFile, UseInterceptors, UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, readdirSync, unlinkSync, mkdirSync } from 'fs';
import { join, resolve, normalize } from 'path';
import { AdminGuard } from '../auth/admin.guard.js';

const PUBLIC_DIR = resolve(process.cwd(), '..', 'frontend-devstiny', 'public');

const IMAGE_EXT = /\.(png|jpg|jpeg|gif|svg|webp)$/i;

function safeFolder(folder: string): string {
  if (!folder || /[./\\]/.test(folder)) throw new BadRequestException('Invalid folder name');
  const abs = normalize(join(PUBLIC_DIR, folder));
  if (!abs.startsWith(PUBLIC_DIR)) throw new BadRequestException('Invalid folder name');
  return abs;
}

@Controller('admin/media')
@UseGuards(AdminGuard)
export class MediaController {
  @Get('files')
  listFiles(@Query('folder') folder: string) {
    const dir = safeFolder(folder);
    if (!existsSync(dir)) return { files: [] };
    const files = readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort()
      .map((name) => ({ name, path: `/${folder}/${name}` }));
    return { files };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const folder = req.body?.folder as string | undefined;
          if (!folder || /[./\\]/.test(folder)) return cb(new Error('Invalid folder'), '');
          const dir = join(PUBLIC_DIR, folder);
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => cb(null, file.originalname),
      }),
      fileFilter: (_req, file, cb) => {
        IMAGE_EXT.test(file.originalname) ? cb(null, true) : cb(new Error('Only image files allowed'), false);
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: { originalname: string; filename: string; path: string; size: number },
    @Body('folder') folder: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return { name: file.originalname, path: `/${folder}/${file.originalname}` };
  }

  @Delete('files')
  deleteFile(
    @Query('folder') folder: string,
    @Query('name') name: string,
  ) {
    if (!name || IMAGE_EXT.test(name) === false) throw new BadRequestException('Invalid file name');
    const dir  = safeFolder(folder);
    const path = join(dir, name);
    if (!existsSync(path)) throw new BadRequestException('File not found');
    unlinkSync(path);
    return { success: true };
  }
}
