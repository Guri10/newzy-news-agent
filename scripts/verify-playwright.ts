import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(
    'data:text/html,<main><h1>Playwright installed</h1><p>Chromium smoke test passed.</p></main>',
  );

  const heading = await page
    .getByRole('heading', {
      name: 'Playwright installed',
    })
    .textContent();

  await browser.close();

  if (heading !== 'Playwright installed') {
    throw new Error(`Unexpected Playwright smoke result: ${heading}`);
  }

  console.log(
    'Playwright verification passed: Chromium launched and page automation worked.',
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
