import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

interface ActData {
  slug: string; title: string; order: number; description: string;
  isFinalAct: boolean; isLocked: boolean; content: unknown;
}
interface ChapterData { slug: string; acts: ActData[] }

const data: ChapterData[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'acts-export.json'), 'utf-8'),
);

let imported = 0;
let skipped = 0;

for (const ch of data) {
  const chapter = await prisma.pathChapter.findUnique({ where: { slug: ch.slug } });
  if (!chapter) {
    console.log(`[SKIP] Chapter not found: ${ch.slug}`);
    skipped++;
    continue;
  }

  for (const act of ch.acts) {
    await prisma.pathAct.upsert({
      where: { chapterId_slug: { chapterId: chapter.id, slug: act.slug } },
      create: { chapterId: chapter.id, ...act },
      update: act,
    });
    console.log(`  ✓ ${ch.slug}/${act.slug}`);
    imported++;
  }
}

console.log(`\nDone. ${imported} acts imported, ${skipped} chapters skipped.`);
await prisma.$disconnect();
