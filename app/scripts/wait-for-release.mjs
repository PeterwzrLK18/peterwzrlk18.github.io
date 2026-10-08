import { readFile } from 'node:fs/promises';

const expected = JSON.parse(await readFile(new URL('../dist/build-info.json', import.meta.url), 'utf8'));
const baseURL = process.env.SITE_URL;
if (!baseURL) throw new Error('SITE_URL is required');
const deadline = Date.now() + 5 * 60 * 1000;
let ready = false;
while (Date.now() < deadline) {
  try {
    const response = await fetch(new URL(`build-info.json?build=${expected.buildId}&t=${Date.now()}`, baseURL + '/'), {
      cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (response.ok) {
      const actual = await response.json();
      if (actual.revision === expected.revision && actual.buildId === expected.buildId) {
        ready = true;
        break;
      }
    }
  } catch { /* Deployment or CDN may still be updating. Retry within the deadline. */ }
  console.log('Waiting for the expected release to become available...');
  await new Promise(resolve => setTimeout(resolve, 10000));
}
if (!ready) throw new Error(`Expected release ${expected.revision} did not become available within 5 minutes`);
console.log(`Verified online release ${expected.revision} (${expected.buildId.slice(0, 12)})`);
