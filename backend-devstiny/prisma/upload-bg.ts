import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const result = await cloudinary.uploader.upload(
  path.resolve(__dirname, '../../frontend-devstiny/public/bg-image4.png'),
  { public_id: 'devstiny/ui/bg-image4', overwrite: true },
);
console.log(result.secure_url);
