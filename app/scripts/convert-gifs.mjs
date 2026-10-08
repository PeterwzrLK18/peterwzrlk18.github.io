// app/scripts/convert-gifs.mjs
//
// Convert GIFs in public/img to WebM and MP4 for muted inline playback.
//
// Workflow per GIF:
//   1. Copy the GIF to _fullres-img-backup/gif-backup/<path>.gif (local only).
//   2. Encode WebM (VP9, CRF 28) and MP4 (H.264, CRF 27, faststart).
//   3. Delete the public GIF after both conversions succeed and report sizes.
//
// Requires ffmpeg and ffprobe on PATH; not part of the normal build.

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, mkdirSync, existsSync, copyFileSync, unlinkSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
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
function probeSize(file) {
  const s = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file])
    .toString().trim().split(',');
  return { w: parseInt(s[0], 10), h: parseInt(s[1], 10) };
}

// ffmpeg scale filter that doesn't enlarge; max long edge = MAX_EDGE
const scaleFilter = `scale='if(gt(iw,ih),min(${MAX_EDGE},iw),-2)':'if(gt(iw,ih),-2,min(${MAX_EDGE},ih))':force_original_aspect_ratio=decrease`;

function convertOne(file) {
  const rel = relative(IMG_ROOT, file);
  const dir = dirname(file);

  // Probe once for size info (helps logging, not strictly needed).
  const { w, h } = probeSize(file);

  // Preserve any existing backup; refuse to delete a different source GIF.
  const backupDir = join(FULLRES_ROOT, dirname(rel));
  mkdirSync(backupDir, { recursive: true });
  const backupPath = join(backupDir, basename(file));
  if (!existsSync(backupPath)) copyFileSync(file, backupPath);
  else if (!readFileSync(file).equals(readFileSync(backupPath))) {
    throw new Error(`A different GIF backup already exists: ${backupPath}`);
  }

  const outWebm = join(dir, basename(file, '.gif') + '.webm');
  const outMp4  = join(dir, basename(file, '.gif') + '.mp4');

  // 1. WebM (VP9, no audio, CRF 28)
  ff(['-i', file, '-vf', scaleFilter, '-c:v', 'libvpx-vp9', '-b:v', '0',
      '-crf', '28', '-an', outWebm]);

  // 2. MP4 (H.264 + yuv420p, CRF 27, no audio)
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
if (!files.length) process.exit(0);
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
    process.exitCode = 1;
  }
}
console.log('---');
console.log(`GIF total:   ${(totalBefore/1024).toFixed(2)} MB`);
console.log(`WebM total:  ${(totalAfterW/1024).toFixed(2)} MB`);
console.log(`MP4  total:  ${(totalAfterM/1024).toFixed(2)} MB`);
if (totalBefore) console.log(`Net saving:  ${((1 - (totalAfterM / totalBefore)) * 100).toFixed(1)}% (MP4)`);
console.log(`Backup at:   ${FULLRES_ROOT}`);
