// app/scripts/convert-gifs.mjs
//
// Step 2 of image optimisation pass.
// Convert large GIFs (currently the SONDER set, ~23 MB total) to MP4 and
// WebM, which the page then loads via <video autoPlay muted loop playsInline>.
//
// Workflow per GIF:
//   1. Move original .gif into _fullres-img-backup/gif-backup/<path>.gif
//      (gitignored, stays local).
//   2. Encode WebM (VP9, CRF 28) — ~30% smaller than MP4.
//   3. Encode MP4 (H.264, CRF 24, faststart) — universal fallback.
//   4. Print before/after sizes.
//
// Requires: ffmpeg and ffprobe on PATH (the repo's dev machine has them
// under FFmpeg/...; on CI the gif set is checked in already converted, so
// this script only needs to run locally when a new GIF is added).

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, mkdirSync, existsSync, copyFileSync, unlinkSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname as pathDirname } from 'node:path';

const __dirname = pathDirname(fileURLToPath(import.meta.url));
const IMG_ROOT = join(__dirname, '..', 'public', 'img');
const FULLRES_ROOT = join(__dirname, '..', '..', '_fullres-img-backup', 'gif-backup');

const MAX_EDGE = 1920;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === '_fullres') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.gif$/i.test(name)) out.push(p);
  }
  return out;
}

function ff(args) {
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'pipe' });
}
function ffprobeArg(file, name) {
  return execFileSync('ffprobe', ['-v', 'error', '-select_streams', name === 'v:0' ? 'v:0' : '0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file])
    .toString().trim();
}

function probeSize(file) {
  const s = ffprobeArg(file, 'v:0').split(',');
  return { w: parseInt(s[0], 10), h: parseInt(s[1], 10) };
}

// ffmpeg scale filter that doesn't enlarge; max long edge = MAX_EDGE
const scaleFilter = `scale='if(gt(iw,ih),min(${MAX_EDGE},iw),-2)':'if(gt(iw,ih),-2,min(${MAX_EDGE},ih))':force_original_aspect_ratio=decrease`;

function convertOne(file) {
  const rel = relative(IMG_ROOT, file);
  const relNoExt = rel.replace(/\.gif$/i, '');
  const dir = dirname(file);

  // Probe once for size info (helps logging, not strictly needed).
  const { w, h } = probeSize(file);

  // Back up the original GIF (don't reuse backup if exists).
  const backupDir = join(FULLRES_ROOT, dirname(rel));
  mkdirSync(backupDir, { recursive: true });
  const backupPath = join(backupDir, basename(file));
  if (!existsSync(backupPath)) copyFileSync(file, backupPath);

  const outWebm = join(dir, basename(file, '.gif') + '.webm');
  const outMp4  = join(dir, basename(file, '.gif') + '.mp4');

  // 1. WebM (VP9 + Opus, CRF 28)
  ff(['-i', file, '-vf', scaleFilter, '-c:v', 'libvpx-vp9', '-b:v', '0',
      '-crf', '28', '-an', outWebm]);

  // 2. MP4 (H.264 baseline + yuv420p, CRF 27 — visually-lossless for animations, smaller than GIF was)
  ff(['-i', file, '-vf', `scale='if(gt(iw,ih),min(${MAX_EDGE},iw),-2)':'if(gt(iw,ih),-2,min(${MAX_EDGE},ih))',format=yuv420p`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '27',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', outMp4]);

  // 3. Remove the in-tree GIF (backup already preserved).
  unlinkSync(file);

  return {
    rel, w, h,
    beforeKB: statSync(backupPath).size / 1024,
    afterWebmKB: statSync(outWebm).size / 1024,
    afterMp4KB:  statSync(outMp4).size / 1024,
  };
}

const files = walk(IMG_ROOT);
console.log(`Found ${files.length} GIF(s) to convert`);
let totalBefore = 0, totalAfterW = 0, totalAfterM = 0;
for (const f of files) {
  try {
    const s = convertOne(f);
    totalBefore += s.beforeKB;
    totalAfterW += s.afterWebmKB;
    totalAfterM += s.afterMp4KB;
    console.log(`  ${s.rel}  ${s.w}x${s.h}  ${(s.beforeKB).toFixed(0)} KB -> webm ${(s.afterWebmKB).toFixed(0)} + mp4 ${(s.afterMp4KB).toFixed(0)} KB`);
  } catch (e) {
    console.error(`  ! ${f}: ${e.message}`);
  }
}
console.log('---');
console.log(`GIF total:   ${(totalBefore/1024).toFixed(2)} MB`);
console.log(`WebM total:  ${(totalAfterW/1024).toFixed(2)} MB`);
console.log(`MP4  total:  ${(totalAfterM/1024).toFixed(2)} MB`);
console.log(`Net saving:  ${((1 - (totalAfterM / totalBefore)) * 100).toFixed(1)}% (MP4)`);
console.log(`Backup at:   ${FULLRES_ROOT}`);