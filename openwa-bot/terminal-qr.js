const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

const CHROME_PATH = process.env.CHROME_PATH || process.env.BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = process.env.OPENWA_USER_DATA_DIR || path.join(__dirname, '_openwa_profile');
const headless = process.env.OPENWA_HEADLESS === 'true' ? true : false;

async function run() {
  if (!fs.existsSync(CHROME_PATH)) {
    console.error('Chrome not found at', CHROME_PATH);
    process.exit(2);
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: headless,
      args: [
        `--user-data-dir=${userDataDir}`,
        '--no-default-browser-check',
        '--no-first-run',
        '--disable-gpu'
      ],
    });

    const pages = await browser.pages();
    const page = pages && pages.length ? pages[0] : await browser.newPage();

    // set a common desktop UA to avoid unsupported-browser page
    await page.setUserAgent(process.env.OPENWA_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    console.log('Navigating to web.whatsapp.com...');
    await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle2', timeout: 60000 });

    // poll for canvas with aria-label
    const timeoutMs = 120000; // 2 minutes
    const start = Date.now();
    let qr = null;
    while (Date.now() - start < timeoutMs && !qr) {
      try {
        // wait briefly for the canvas element
        await page.waitForSelector('canvas[aria-label]', { timeout: 3000 }).catch(() => {});
        qr = await page.evaluate(() => {
          const canvas = document.querySelector('canvas[aria-label]');
          if (!canvas) return null;
          const parent = canvas.parentElement;
          // data-ref attribute holds the textual QR payload in many WA versions
          const dataRef = parent ? parent.getAttribute('data-ref') : null;
          if (dataRef && dataRef.length) return dataRef;

          // fallback: try to read any visible text that might be the code
          const codeElem = parent ? parent.querySelector('[data-ref]') : null;
          if (codeElem) return codeElem.getAttribute('data-ref') || null;

          return null;
        });

        if (qr) break;

        // If no textual QR, try to use window.getQrPng (some sites expose it)
        const hasGetQr = await page.evaluate(() => !!(window && window.getQrPng));
        if (hasGetQr) {
          const pngData = await page.evaluate(() => window.getQrPng && window.getQrPng());
          if (pngData) {
            // save png for inspection
            const base = pngData.replace(/^data:image\/png;base64,/, '');
            const out = path.join(__dirname, '_openwa_qr.png');
            require('fs').writeFileSync(out, Buffer.from(base, 'base64'));
            console.log('Saved QR image to', out);
            // we still need the textual QR for terminal rendering; continue polling
          }
        }
      } catch (e) {
        // ignore and retry
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!qr) {
      console.error('Could not find textual QR payload within timeout. Saved a screenshot for diagnosis.');
      const shot = path.join(__dirname, '_openwa_fallback.png');
      await page.screenshot({ path: shot, fullPage: true });
      console.log('Saved screenshot to', shot);
      await browser.close();
      process.exit(3);
    }

    // If QR is a short link code (numeric), print plainly
    if (qr.length <= 20) {
      console.log('Link code:', qr);
    } else {
      console.log('QR payload string detected; printing ASCII QR:');
      qrcode.generate(qr, { small: true }, (out) => console.log(out));
    }

    // Save a screenshot too
    const shot2 = path.join(__dirname, '_openwa_qr_capture.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log('Saved QR screenshot to', shot2);

    console.log('Keep this browser open and do not close the window until login finishes.');

    // Keep process alive briefly so user can scan
    const keepAliveMs = 5 * 60 * 1000; // 5 minutes
    console.log(`Waiting ${Math.round(keepAliveMs/1000)}s before exiting to allow scanning...`);
    await new Promise(r => setTimeout(r, keepAliveMs));

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('terminal-qr error:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

run();
