// app/scripts/optimize-images.mjs
//
// Step 1 of image optimisation pass.
// Resharp every PNG/WEBP in app/public/img/ so the production bundle stays
// small while the print-grade masters stay safe in a `_fullres/` backup.
//
// Pipeline per image:
//   1. Move the existing master PNG into `app/public/img/_fullres/<project>/<file>.png`
//      (prints-grade original preserved for future re-export at higher res).
//   2. Render a max-1920 long-edge, q=72 WEBP into the original place
//      (replacing the existing WEBP — the one currently in use).
//   3. Render a max-1920 long-edge, q=85 PNG into the original place
//      (replacing the now-moved master with a lighter fallback that's
//      visually identical at screen size, dramatically smaller).
//
// GIFs and existing non-PNG assets are left untouched.
// Running twice is safe: the second run reprocesses the already-light PNGs
// (net effect ~0, since max-1920 won't downscale further).

import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync, renameSync, existsSync, copyFileSync, unlinkSync } from 'node:fs';
import { join, extname, basename, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname as pathDirname } from 'node:path';

// Replace a target file with a freshly-rendered tmp file, handling the
// Windows quirk where rename can fail if a handle is still open. Falls
// back to copy+unlink so no .tmp files get stranded in the repo.
function commitTmp(tmpPath, finalPath) {
  if (existsSync(finalPath)) unlinkSync(finalPath);
  try {
    renameSync(tmpPath, finalPath);
  } catch {
    copyFileSync(tmpPath, finalPath);
    unlinkSync(tmpPath);
  }
}

const __dirname = pathDirname(fileURLToPath(import.meta.url));
const IMG_ROOT = join(__dirname, '..', 'public', 'img');
const FULLRES_ROOT = join(IMG_ROOT, '_fullres');
const MAX_EDGE = 1920;
const WEBP_Q = 72;
const PNG_Q = 85;

const PATTERN = /\.(png|webp)$/i;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === '_fullres' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (PATTERN.test(name)) out.push(p);
  }
  return out;
}

async function processOne(file) {
  const rel = relative(IMG_ROOT, file);
  const dir = dirname(file);
  const name = basename(file);
  const ext = extname(name).toLowerCase();
  const newWebp = join(dir, name.replace(/\.(png|webp)$/i, '.webp'));
  const pngFallback = join(dir, name.replace(/\.(png|webp)$/i, '.png'));

  // Source for re-render: existing PNG if present, else the existing WEBP.
  let masterPng = join(dir, basename(name).replace(/\.(png|webp)$/i, '.png'));
  let master = existsSync(masterPng) ? masterPng : file;

  // The relative path inside _fullres/ preserves the project subdir so multiple
  // `Cover.png` (one per project) don't collide.
  const fullresDir = join(FULLRES_ROOT, dirname(rel));
  const fullresPath = join(fullresDir, basename(master, extname(master)));

  const stats = { rel,
    beforeWebp: existsSync(newWebp) ? statSync(newWebp).size : 0,
    beforePng:  existsSync(pngFallback) ? statSync(pngFallback).size : 0,
  };

  // 1. Move master PNG into _fullres/ (first-run only; idempotent later).
if (master === masterPng && existsSync(masterPng) && !existsSync(join(fullresDir, basename(masterPng)))) {
    mkdirSync(fullresDir, { recursive: true });
    // Take a backup copy rather than move, so re-running the script is safe.
    copyFileSync(masterPng, join(fullresDir, basename(masterPng)));
  }

  // 2. Render max-1920 q=72 WEBP.
  const img = sharp(master, { failOn: 'none' });
  const meta = await img.metadata();
  const resize = meta.width > MAX_EDGE || meta.height > MAX_EDGE
    ? { width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true }
    : null;
  const pipeline = sharp(master, { failOn: 'none' });
  if (resize) pipeline.resize(resize);
  await pipeline.webp({ quality: WEBP_Q }).toFile(newWebp + '.tmp');
  // sharp.toFile refuses to overwrite the input; rename.
  commitTmp(newWebp + '.tmp', newWebp);

  // 3. Render max-1920 q=85 PNG fallback (only if source was PNG or PNG exists).
  //    Skip if there's no PNG fallback (e.g. pure-webp assets) — keeps behaviour.
  if (ext === '.png' || existsSync(pngFallback)) {
    const pipeline2 = sharp(master, { failOn: 'none' });
    if (resize) pipeline2.resize(resize);
    await pipeline2.png({ quality: PNG_Q, compressionLevel: 9, palette: true })
                   .toFile(pngFallback + '.tmp');
    commitTmp(pngFallback + '.tmp', pngFallback);
  }

  stats.afterWebp = statSync(newWebp).size;
  stats.afterPng = existsSync(pngFallback) ? statSync(pngFallback).size : 0;
  return stats;
}

(async () => {
  const files = walk(IMG_ROOT);
  console.log(`Found ${files.length} PNG/WEBP files`);
  let totalBeforeW = 0, totalAfterW = 0;
  let totalBeforeP = 0, totalAfterP = 0;
  for (const f of files) {
    try {
      const s = await processOne(f);
      totalBeforeW += s.beforeWebp;
      totalAfterW  += s.afterWebp;
      totalBeforeP += s.beforePng;
      totalAfterP  += s.afterPng;
      const dW = ((s.afterWebp - s.beforeWebp) / 1024).toFixed(0);
      const dP = ((s.afterPng  - s.beforePng ) / 1024).toFixed(0);
      console.log(`  ${s.rel}  webp ${(s.beforeWebp/1024).toFixed(0)}→${(s.afterWebp/1024).toFixed(0)} KB (${dW})  png ${(s.beforePng/1024).toFixed(0)}→${(s.afterPng/1024).toFixed(0)} KB (${dP})`);
    } catch (e) {
      console.error(`  ! ${f}: ${e.message}`);
    }
  }
  console.log('---');
  console.log(`Total WebP ${(totalBeforeW/1024/1024).toFixed(2)} → ${(totalAfterW/1024/1024).toFixed(2)} MB (${(((totalAfterW-totalBeforeW)/totalBeforeW)*100).toFixed(1)}%)`);
  console.log(`Total PNG  ${(totalBeforeP/1024/1024).toFixed(2)} → ${(totalAfterP/1024/1024).toFixed(2)} MB (${(((totalAfterP-totalBeforeP)/totalBeforeP)*100).toFixed(1)}%)`);
  console.log(`Backups synced to ${FULLRES_ROOT}`);
})();