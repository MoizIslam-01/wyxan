import { chromium } from 'playwright';
import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve(import.meta.dirname, '../../../demo');
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: outputDirectory, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const video = page.video();
const pause = (duration) => page.waitForTimeout(duration);
const demoAddress = `demo-${Date.now().toString(36)}.zz`;

try {
  await page.goto(process.env.DEMO_URL ?? 'http://localhost:3001', { waitUntil: 'networkidle' });
  await page.getByRole('combobox').first().waitFor();
  await pause(15_000);

  await page.getByRole('button', { name: /tidepool\.zz/ }).click();
  await page.frameLocator('iframe.site-frame').getByRole('heading', { name: 'Low Tide Notes' }).waitFor();
  await pause(15_000);
  await page.frameLocator('iframe.site-frame').getByRole('link', { name: 'Field Notes' }).click();
  await pause(15_000);
  await page.frameLocator('iframe.site-frame').getByRole('link', { name: 'The Moss Library' }).click();
  await pause(15_000);
  await page.frameLocator('iframe.site-frame').getByRole('link', { name: 'Tiny Recipes' }).click();
  await pause(15_000);

  await page.getByRole('button', { name: 'Go back' }).click();
  await pause(8_000);
  await page.getByRole('button', { name: 'Go back' }).click();
  await pause(8_000);
  await page.getByRole('button', { name: 'Go forward' }).click();
  await pause(8_000);
  await page.getByRole('textbox', { name: 'Address' }).fill('nightbus.zz');
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await pause(15_000);
  await page.getByRole('textbox', { name: 'Address' }).fill('weather-station.zz');
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await page.getByRole('heading', { name: 'No page lives here.' }).waitFor();
  await pause(15_000);
  await page.getByRole('button', { name: 'Go back' }).click();
  await pause(8_000);

  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search all sites' }).fill('moss');
  await page.getByRole('button', { name: 'Search', exact: true }).last().click();
  await page.getByText('Results for “moss”').waitFor();
  await pause(15_000);
  await page.getByRole('button', { name: /mosslibrary\.zz/ }).click();
  await pause(12_000);
  await page.getByRole('button', { name: 'Go back' }).click();
  await page.getByText('Results for “moss”').waitFor();
  await pause(12_000);

  await page.getByRole('button', { name: 'History' }).click();
  await page.getByRole('complementary', { name: 'Browsing history' }).waitFor();
  await pause(12_000);
  await page.locator('.history-item').first().click();
  await pause(12_000);

  await page.getByRole('button', { name: 'Publish a site' }).click();
  await page.getByRole('dialog', { name: 'Publish a one-page site' }).waitFor();
  await pause(10_000);
  await page.getByRole('dialog').getByRole('textbox', { name: 'Address' }).fill(demoAddress);
  await page.getByRole('dialog').getByRole('textbox', { name: 'Page title' }).fill('A Walk Through the Small Web');
  await page.getByRole('dialog').getByRole('textbox', { name: 'HTML' }).fill('<main><h1>A Walk Through the Small Web</h1><p>Every page is a small invitation to keep exploring. This one was published during the demo.</p><a href="tidepool.zz">Return to the tidepool</a></main>');
  await pause(8_000);
  await page.getByRole('dialog').getByRole('button', { name: 'Publish site' }).click();
  await page.frameLocator('iframe.site-frame').getByRole('heading', { name: 'A Walk Through the Small Web' }).waitFor();
  await pause(26_000);
} finally {
  await context.close();
  await browser.close();
  if (video) {
    const destination = resolve(outputDirectory, 'small-web-walkthrough.webm');
    await copyFile(await video.path(), destination);
    console.log(`Demo video: ${destination}`);
  }
}
