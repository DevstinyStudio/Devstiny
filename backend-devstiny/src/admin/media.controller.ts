import {
  Controller, Get, Post, Delete, Query, Body,
  UploadedFile, UseInterceptors, UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { AdminGuard } from '../auth/admin.guard.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_EXT = /\.(png|jpg|jpeg|gif|svg|webp)$/i;
const FOLDER_PREFIX = 'devstiny';

function validFolder(folder: string): string {
  if (!folder || /[./\\]/.test(folder)) throw new BadRequestException('Invalid folder name');
  return folder;
}

@Controller('admin/media')
@UseGuards(AdminGuard)
export class MediaController {
  @Get('files')
  async listFiles(@Query('folder') folder: string) {
    validFolder(folder);
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: `${FOLDER_PREFIX}/${folder}/`,
        max_results: 500,
        resource_type: 'image',
      });
      const files = (result.resources as { public_id: string; secure_url: string; format: string }[]).map((r) => ({
        name: r.public_id.split('/').pop() + '.' + r.format,
        path: r.secure_url,
      }));
      return { files };
    } catch {
      return { files: [] };
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    @Body('folder') folder: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!IMAGE_EXT.test(file.originalname)) throw new BadRequestException('Only image files allowed');
    validFolder(folder);

    const publicId = `${FOLDER_PREFIX}/${folder}/${file.originalname.replace(/\.[^/.]+$/, '')}`;

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { public_id: publicId, overwrite: true, resource_type: 'image' },
        (error, res) => (error ? reject(error) : resolve(res!)),
      ).end(file.buffer);
    });

    return { name: file.originalname, path: result.secure_url };
  }

  @Delete('files')
  async deleteFile(
    @Query('folder') folder: string,
    @Query('name') name: string,
  ) {
    if (!name || !IMAGE_EXT.test(name)) throw new BadRequestException('Invalid file name');
    validFolder(folder);

    const publicId = `${FOLDER_PREFIX}/${folder}/${name.replace(/\.[^/.]+$/, '')}`;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return { success: true };
  }
}
