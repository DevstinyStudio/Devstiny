import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const chapters = await prisma.pathChapter.findMany({
  include: { acts: { orderBy: { order: 'asc' } } },
  orderBy: { order: 'asc' },
});

const out = chapters.map((ch) => ({
  slug: ch.slug,
  acts: ch.acts.map((act) => ({
    slug:        act.slug,
    title:       act.title,
    order:       act.order,
    description: act.description,
    isFinalAct:  act.isFinalAct,
    isLocked:    act.isLocked,
    content:     act.content,
  })),
}));

const outPath = path.resolve(__dirname, 'acts-export.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Exported ${out.reduce((n, c) => n + c.acts.length, 0)} acts from ${out.length} chapters → acts-export.json`);

await prisma.$disconnect();
