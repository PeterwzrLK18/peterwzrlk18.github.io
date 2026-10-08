// Generate website WebP files from repository PNG backups. Never modify PNGs.
import sharp from 'sharp';
import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const backupRoot = fileURLToPath(new URL('../../assets/png-backups/', import.meta.url));
const imageRoot = fileURLToPath(new URL('../public/img/', import.meta.url));
const files = (await readdir(backupRoot, { recursive: true })).filter(file => /\.png$/i.test(file));
for (const file of files) {
  const source = join(backupRoot, file);
  const output = join(imageRoot, file.replace(/\.png$/i, '.webp'));
  const temporary = output + '.tmp';
  await mkdir(dirname(output), { recursive: true });
  try {
    await sharp(source).resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 72 }).toFile(temporary);
    await rename(temporary, output);
    console.log(relative(imageRoot, output));
  } finally {
    await rm(temporary, { force: true });
  }
}
console.log(`Generated ${files.length} WebP files; PNG backups were not modified.`);
