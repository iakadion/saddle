import { AgentBrowser, createBrowser } from '../browser.js';

async function main() {
  const browser = createBrowser({
    headless: false,
    viewport: { width: 1280, height: 720 },
    blockAds: true,
  });

  try {
    await browser.launch('chromium');

    console.log('Navigating to example.com...');
    await browser.navigate('https://example.com');
    console.log(`Title: ${await browser.title()}`);
    console.log(`URL: ${await browser.url()}`);

    const pageText = await browser.text();
    console.log(`Page text (first 500 chars): ${pageText.slice(0, 500)}`);

    const buf = await browser.screenshot({ fullPage: true });
    console.log(`Screenshot: ${buf.length} bytes`);

    const links = await browser.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.textContent?.trim().slice(0, 100),
      }));
    });
    console.log(`Links found: ${links.length}`);

    console.log('\nExecuting command sequence...');
    const results = await browser.executeCommands([
      { action: 'extract' },
    ]);
    const extraction = results[0] as Record<string, unknown>;
    console.log(`Extracted title: ${extraction.title}`);
    console.log(`Extracted text length: ${(extraction.text as string).length}`);

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
