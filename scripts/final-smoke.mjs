import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://127.0.0.1:3400/docs/docsense', { waitUntil: 'networkidle0' });

const checks = [];

const trigger = await page.$('.docsense-trigger');
checks.push(['navbar trigger', Boolean(trigger)]);

await page.click('.docsense-trigger');
await page.waitForSelector('.docsense-modal');

const footer = await page.$eval('.docsense-footer', (el) => el.textContent.replace(/\s+/g, ' ').trim());
checks.push(['footer powered by', footer.includes('Powered by Docsense')]);
checks.push(['default limit 8', (await page.$eval('.docsense-limit__value', (el) => el.textContent)) === '8']);

await page.type('.docsense-searchrow__input', 'UPLOAD audio', { delay: 10 });
await page.waitForFunction(() => document.querySelectorAll('.docsense-hit').length > 0, {
  timeout: 5000,
});
const caseHits = await page.$$eval('.docsense-hit__title', (els) => els.map((e) => e.textContent));
checks.push(['case-insensitive search', caseHits.some((t) => /upload/i.test(t))]);

await page.click('button[aria-label="Show more pages"]');
const limit9 = await page.$eval('.docsense-limit__value', (el) => el.textContent);
checks.push(['limit increment', limit9 === '9']);

await page.evaluate(() => {
  const chip = [...document.querySelectorAll('.docsense-chip')].find((el) =>
    el.textContent.includes('How-to'),
  );
  if (chip) chip.click();
});
await new Promise((r) => setTimeout(r, 300));
const activeHowTo = await page.evaluate(
  () => document.querySelector('.docsense-chip.is-active')?.textContent.includes('How-to') ?? false,
);
checks.push(['filter chip', activeHowTo]);

const overlapping = await page.evaluate(() => {
  const rects = [...document.querySelectorAll('.docsense-list > li')].map((li) => {
    const r = li.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom };
  });
  for (let i = 1; i < rects.length; i += 1) {
    if (rects[i].top < rects[i - 1].bottom - 2) return true;
  }
  return false;
});
checks.push(['no overlap', !overlapping]);

await browser.close();

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed += 1;
}
if (errors.length) {
  console.log('PAGE ERRORS:');
  for (const e of errors) console.log(' ', e);
  failed += 1;
}
if (failed) {
  process.exit(1);
}
console.log('SMOKE OK');
