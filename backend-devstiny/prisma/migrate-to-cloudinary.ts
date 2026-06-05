import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../../frontend-devstiny/public');
const FOLDER_PREFIX = 'devstiny';

// Map: local folder → Cloudinary folder
const FOLDER_MAP: Record<string, string> = {
  'base-char': 'base-char',
  'book':      'book',
  'costume':   'costume',
  'equip':     'equip',
  'gem':       'gem',
  'NPC':       'NPC',
  'scroll':    'scroll',
  'ui':        'ui',
};

const IMAGE_EXT = /\.(png|jpg|jpeg|gif|svg|webp)$/i;

interface UploadResult {
  localPath: string;
  cloudFolder: string;
  fileName: string;
  status: 'ok' | 'skip' | 'error';
  url?: string;
  error?: string;
}

function collectFiles(dir: string, cloudFolder: string): { localPath: string; cloudFolder: string; fileName: string }[] {
  const results: { localPath: string; cloudFolder: string; fileName: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Flatten subfolders into the same Cloudinary folder
      results.push(...collectFiles(fullPath, cloudFolder));
    } else if (entry.isFile() && IMAGE_EXT.test(entry.name)) {
      results.push({ localPath: fullPath, cloudFolder, fileName: entry.name });
    }
  }
  return results;
}

async function uploadFile(localPath: string, cloudFolder: string, fileName: string): Promise<UploadResult> {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const publicId = `${FOLDER_PREFIX}/${cloudFolder}/${nameWithoutExt}`;
  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, overwrite: true, resource_type: 'image' },
        (error, res) => (error ? reject(error) : resolve(res!)),
      );
      fs.createReadStream(localPath).pipe(stream);
    });
    return { localPath, cloudFolder, fileName, status: 'ok', url: result.secure_url };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { localPath, cloudFolder, fileName, status: 'error', error: msg };
  }
}

async function main() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('ERROR: CLOUDINARY_CLOUD_NAME is not set. Add it to your environment.');
    process.exit(1);
  }

  // Collect all files
  const allFiles: { localPath: string; cloudFolder: string; fileName: string }[] = [];
  for (const [localFolder, cloudFolder] of Object.entries(FOLDER_MAP)) {
    const dir = path.join(PUBLIC_DIR, localFolder);
    if (!fs.existsSync(dir)) {
      console.log(`[SKIP] ${localFolder}/ not found`);
      continue;
    }
    const files = collectFiles(dir, cloudFolder);
    allFiles.push(...files);
  }

  console.log(`\nFound ${allFiles.length} files to upload.\n`);

  const results: UploadResult[] = [];
  let done = 0;

  // Upload with concurrency limit of 5
  const BATCH = 5;
  for (let i = 0; i < allFiles.length; i += BATCH) {
    const batch = allFiles.slice(i, i + BATCH);
    const batchResults = await Promise.all(
      batch.map(({ localPath, cloudFolder, fileName }) =>
        uploadFile(localPath, cloudFolder, fileName),
      ),
    );
    for (const r of batchResults) {
      done++;
      if (r.status === 'ok') {
        console.log(`[${done}/${allFiles.length}] ✓ ${r.cloudFolder}/${r.fileName}`);
      } else {
        console.log(`[${done}/${allFiles.length}] ✗ ${r.cloudFolder}/${r.fileName} — ${r.error}`);
      }
      results.push(r);
    }
  }

  const ok = results.filter((r) => r.status === 'ok').length;
  const errors = results.filter((r) => r.status === 'error');
  console.log(`\nDone. ${ok} uploaded, ${errors.length} errors.`);
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach((r) => console.log(`  ${r.cloudFolder}/${r.fileName}: ${r.error}`));
  }
}

main().catch(console.error);
