import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';

const OUT = join(process.cwd(), 'docs', 'images');
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

async function shot(name) {
  const path = join(OUT, name);
  await page.screenshot({ path, type: 'png' });
  console.log('wrote', path);
}

await page.goto('http://127.0.0.1:3400/docs/intro', {
  waitUntil: 'networkidle0',
});

async function shotModal(name) {
  const path = join(OUT, name);
  const modal = await page.$('.docsense-modal');
  if (!modal) {
    throw new Error(`Missing .docsense-modal for ${name}`);
  }
  await modal.screenshot({ path, type: 'png' });
  console.log('wrote', path);
}

// 1) Navbar trigger (full page so logo + pill Search docs are visible)
await page.waitForSelector('.docsense-trigger');
await shot('feature-navbar-search.png');

// 2) Empty modal with filters + limit
await page.click('.docsense-trigger');
await page.waitForSelector('.docsense-modal');
await new Promise((r) => setTimeout(r, 400));
await shotModal('feature-search-modal.png');

// 3) Results + filters
await page.click('.docsense-searchrow__input', { clickCount: 3 });
await page.type('.docsense-searchrow__input', 'search', { delay: 25 });
await page.waitForFunction(
  () => document.querySelectorAll('.docsense-hit').length > 0,
  { timeout: 8000 },
);
await new Promise((r) => setTimeout(r, 450));
await shotModal('feature-results-and-filters.png');

// 4) Filter chip (prefer How-to / Docs / Tutorial — whatever exists)
await page.evaluate(() => {
  const labels = ['How-to', 'Tutorial', 'Docs', 'Concept'];
  const chips = [...document.querySelectorAll('.docsense-chip')];
  const chip = labels
    .map((label) => chips.find((el) => el.textContent.includes(label)))
    .find(Boolean);
  if (chip) {
    chip.click();
  }
});
await new Promise((r) => setTimeout(r, 450));
await shotModal('feature-filter-chip.png');

// 5) Increase page limit
await page.click('button[aria-label="Show more pages"]');
await page.click('button[aria-label="Show more pages"]');
await new Promise((r) => setTimeout(r, 450));
await shotModal('feature-page-limit.png');

// Confirm footer text
const footer = await page.$eval('.docsense-footer', (el) => el.textContent);
console.log('footer:', footer.replace(/\s+/g, ' ').trim());
const limit = await page.$eval('.docsense-limit__value', (el) => el.textContent);
console.log('limit:', limit);
const hitCount = await page.$$eval('.docsense-hit', (els) => els.length);
console.log('hits:', hitCount);

await browser.close();
