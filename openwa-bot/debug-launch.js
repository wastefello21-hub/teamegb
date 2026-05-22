const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function resolveBrowserPath() {
  const explicitPath = process.env.BROWSER_PATH || process.env.CHROME_PATH;
  if (explicitPath && fs.existsSync(explicitPath)) return explicitPath;

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ].filter(Boolean);

  for (const c of candidates) if (fs.existsSync(c)) return c;
  return '';
}

function getBrowserVersion(browserPath) {
  if (!browserPath) return '(not found)';
  try {
    const r = spawnSync(browserPath, ['--version'], { encoding: 'utf8' });
    return String(r.stdout || r.stderr || '').trim();
  } catch (err) {
    return `(error: ${String(err)})`;
  }
}

async function run() {
  const browserPath = resolveBrowserPath();
  console.log('Using browser path:', browserPath || '(not found)');
  console.log('Browser version:', getBrowserVersion(browserPath));

  if (!browserPath) {
    console.error('No Chrome found. Set CHROME_PATH or BROWSER_PATH and retry.');
    process.exit(2);
  }

  let pptr;
  try {
    pptr = require('puppeteer-core');
  } catch (err) {
    try {
      pptr = require('puppeteer');
    } catch (err2) {
      console.error('Failed to require puppeteer-core or puppeteer. Is it installed?');
      console.error(err2);
      process.exit(3);
    }
  }

  console.log('Launching Chrome via Puppeteer...');
  try {
    const browser = await pptr.launch({
      executablePath: browserPath,
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-client-side-phishing-detection',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--no-first-run',
        '--disable-features=site-per-process',
      ],
      ignoreDefaultArgs: false,
      defaultViewport: null,
      timeout: 60000,
    });

    console.log('Browser launched. PID:', browser.process() && browser.process().pid);
    const pages = await browser.pages();
    console.log('Open pages count:', pages.length);
    await browser.close();
    console.log('Browser closed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Puppeteer launch failed:');
    console.error(err && err.stack ? err.stack : String(err));
    process.exit(4);
  }
}

run();
