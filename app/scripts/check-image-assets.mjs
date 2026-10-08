// Validate artwork references before Vite copies public assets into dist.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const imageRoot = join(appRoot, 'public', 'img');
const artwork = readdirSync(imageRoot, { recursive: true });
const unexpected = artwork.filter(file => /\.(png|jpe?g)$/i.test(file));
if (unexpected.length) throw new Error(`Keep PNG backups outside public/img: ${unexpected.join(', ')}`);
const srcRoot = join(appRoot, 'src');
const files = readdirSync(srcRoot, { recursive: true })
  .filter(file => /\.(jsx?|mdx)$/.test(file) && !file.endsWith('.test.jsx'))
  .map(file => join(srcRoot, file));
files.push(join(appRoot, 'index.html'));
const references = new Set();
for (const file of files) {
  for (const match of readFileSync(file, 'utf8').matchAll(/\/img\/[^"'`\r\n]+\.(?:png|webp|webm|mp4)/g)) {
    references.add(match[0]);
  }
}
for (const url of references) {
  if (url.endsWith('.png')) throw new Error(`Artwork must reference WebP: ${url}`);
  if (!existsSync(join(appRoot, 'public', url.slice(1)))) throw new Error(`Missing image asset: ${url}`);
  if (url.endsWith('.webm') && !existsSync(join(appRoot, 'public', url.slice(1).replace(/\.webm$/, '.mp4')))) {
    throw new Error(`Missing MP4 fallback for ${url}`);
  }
}
console.log(`Validated ${references.size} artwork references; no PNG backups will be deployed.`);
