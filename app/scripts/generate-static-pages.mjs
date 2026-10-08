import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';
import { pageMetadata } from '../src/data/page-metadata.js';
import { absoluteUrl } from '../src/lib/url.js';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const dist = join(appRoot, 'dist');
const template = await readFile(join(dist, 'index.html'), 'utf8');
const pages = [];
for (const [path, meta] of Object.entries(pageMetadata)) {
  const { width, height } = await sharp(join(dist, meta.image.slice(1))).metadata();
  if (width !== meta.imageWidth || height !== meta.imageHeight) {
    throw new Error(`Update share image dimensions in page-metadata.js: ${meta.image} is ${width}x${height}`);
  }
  const dom = new JSDOM(template);
  const doc = dom.window.document;
  doc.querySelectorAll('title, meta[name="description"], meta[name^="twitter:"], meta[property^="og:"], link[rel="canonical"]').forEach(el => el.remove());
  const add = (tag, attributes, text) => {
    const element = doc.createElement(tag);
    element.setAttribute('data-page-meta', '');
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    if (text) element.textContent = text;
    doc.head.append(element);
  };
  add('title', {}, meta.title);
  add('link', { rel: 'canonical', href: absoluteUrl(path) });
  const description = meta.description || '';
  add('meta', { name: 'description', content: description });
  const og = { title: meta.title, description, type: meta.type || 'website', url: absoluteUrl(path),
    image: absoluteUrl(meta.image), 'image:alt': meta.imageAlt, 'image:width': width, 'image:height': height,
    site_name: 'Likai Wang — Portfolio' };
  for (const [key, content] of Object.entries(og)) add('meta', { property: `og:${key}`, content });
  const twitter = { card: 'summary_large_image', title: meta.title, description,
    image: absoluteUrl(meta.image), 'image:alt': meta.imageAlt };
  for (const [key, content] of Object.entries(twitter)) add('meta', { name: `twitter:${key}`, content });
  const output = path === '/' ? join(dist, 'index.html') : join(dist, path.slice(1), 'index.html');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, dom.serialize());
  dom.window.close();
  pages.push({ path, ...meta });
}

const assets = (await readdir(dist, { recursive: true }))
  .filter(file => /\.(js|css|webp|webm|mp4|woff2|ttf|pdf|png|ico|svg)$/.test(file))
  .map(file => '/' + file.replaceAll('\\', '/')).sort();
const hash = createHash('sha256').update(JSON.stringify(pages));
for (const page of pages) {
  const entry = page.path === '/' ? 'index.html' : join(page.path.slice(1), 'index.html');
  hash.update(page.path).update(await readFile(join(dist, entry)));
}
for (const asset of assets) hash.update(asset).update(await readFile(join(dist, asset.slice(1))));
const revision = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: appRoot }).toString().trim();
await writeFile(join(dist, 'build-info.json'), JSON.stringify({ revision, buildId: hash.digest('hex'), pages, assets }, null, 2));
console.log(`Generated ${pages.length} static share entries and a release manifest for ${assets.length} assets.`);
