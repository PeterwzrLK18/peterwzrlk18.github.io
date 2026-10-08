import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const expected = JSON.parse(readFileSync(new URL('../dist/build-info.json', import.meta.url), 'utf8'));

test('the served release matches this build', async ({ request }) => {
  const response = await request.get(`/build-info.json?build=${expected.buildId}`);
  expect(response.ok()).toBe(true);
  const actual = await response.json();
  expect(actual.revision).toBe(expected.revision);
  expect(actual.buildId).toBe(expected.buildId);
});

test('all deployed assets exist and are not fallback HTML', async ({ request }) => {
  const failures = [];
  let next = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (next < expected.assets.length) {
      const asset = expected.assets[next++];
      const response = await request.head(encodeURI(asset));
      if (!response.ok() || (response.headers()['content-type'] || '').includes('text/html')) {
        failures.push(`${asset}: HTTP ${response.status()}`);
      }
    }
  }));
  expect(failures).toEqual([]);
});

for (const meta of expected.pages) {
  test(`${meta.path}: static share tags, rendered images and lightbox`, async ({ page, request }) => {
    // Read HTML without JavaScript: crawlers must receive route-specific tags directly.
    const response = await request.get(meta.path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    // DOMParser inspects an inert HTML string, independent of the live page's React head.
    await page.goto(meta.path);
    const raw = await page.evaluate(markup => {
      const doc = new DOMParser().parseFromString(markup, 'text/html');
      return { title: doc.title, image: doc.querySelector('meta[property="og:image"]')?.content,
        description: doc.querySelector('meta[property="og:description"]')?.content,
        searchDescription: doc.querySelector('meta[name="description"]')?.content,
        canonical: doc.querySelector('link[rel="canonical"]')?.href };
    }, html);
    expect(raw.title).toBe(meta.title);
    expect(raw.description).toBe(meta.description || '');
    expect(raw.searchDescription).toBe(meta.description || '');
    expect(raw.image).toBe(encodeURI('https://peterwzrlk18.github.io' + meta.image));
    expect(raw.canonical).toBe('https://peterwzrlk18.github.io' + meta.path);
    await expect(page).toHaveTitle(meta.title);
    // Scroll each lazy image into view before verifying actual decoding.
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    const interLoaded = await page.evaluate(async () => {
      const faces = await document.fonts.load('600 24px Inter');
      return faces.length > 0 && faces.every(face => face.status === 'loaded');
    });
    expect(interLoaded).toBe(true);
    if (meta.path.startsWith('/work/')) {
      const trigger = page.getByRole('button', { name: /^Enlarge image:/ }).first();
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect.poll(() => dialog.locator('img').evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
      const firstSource = await dialog.locator('img').getAttribute('src');
      await page.keyboard.press('ArrowRight');
      await expect(dialog.locator('img')).not.toHaveAttribute('src', firstSource);
      await expect.poll(() => dialog.locator('img').evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
  });
}

test('mobile layout and client navigation preserve the correct share metadata', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('a[href="/work/italian-cookbook"]').click();
  await expect(page).toHaveTitle('Italian cookbook - Likai Wang');
  await expect(page.locator('head meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute('content', 'Italian cookbook - Likai Wang');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'ABOUT', exact: true }).click();
  await expect(page.locator('head meta[property="og:image:width"]')).toHaveAttribute('content', '1358');
});
