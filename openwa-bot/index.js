const express = require('express');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 8080);
const API_KEY = process.env.OPENWA_API_KEY || '';
const SESSION_ID = process.env.WHATSAPP_SESSION_ID || process.env.OPENWA_SESSION_ID || 'team-egb';
const AUTH_DATA_DIR = process.env.WHATSAPP_DATA_DIR || path.join(__dirname, '.wwebjs_auth');
const CACHE_DIR = process.env.WHATSAPP_CACHE_DIR || path.join(__dirname, '.wwebjs_cache');
const HEADLESS = process.env.WHATSAPP_HEADLESS === 'true';
const KEEP_QR_FILE = process.env.WHATSAPP_KEEP_QR_FILE !== 'false';
const USE_SYSTEM_CHROME = process.env.WHATSAPP_USE_SYSTEM_CHROME === 'true';
const BROWSER_PATH = resolveBrowserPath();

let client = null;
let isReady = false;
let lastQr = '';
let readyResolve;
let readyReject;
let readyPromise = new Promise((resolve, reject) => {
  readyResolve = resolve;
  readyReject = reject;
});

process.on('unhandledRejection', (reason) => {
  const message = String(reason && reason.message ? reason.message : reason);
  console.error('[bot] unhandledRejection:', reason);
  if (message.includes('Execution context was destroyed')) {
    return;
  }
});

process.on('uncaughtException', (error) => {
  const message = String(error && error.message ? error.message : error);
  console.error('[bot] uncaughtException:', error);
  if (message.includes('Execution context was destroyed')) {
    return;
  }
});

function auth(req, res, next) {
  if (!API_KEY) return next();
  const keyHeader = req.headers.key;
  const authHeader = (req.headers.authorization || '').replace('Bearer ', '');
  const incoming = keyHeader || authHeader;
  if (incoming !== API_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  return next();
}

function normalizePhoneToChatId(phone) {
  let digits = String(phone || '').replace(/[^\d]/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.slice(1)}`;
  }
  return `${digits}@c.us`;
}

function resolveBrowserPath() {
  const explicitPath = process.env.WHATSAPP_BROWSER_PATH || process.env.BROWSER_PATH || process.env.CHROME_PATH;
  if (explicitPath && fs.existsSync(explicitPath)) {
    return explicitPath;
  }

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return '';
}

function getBrowserVersion(browserPath) {
  if (!browserPath) return '(not found)';
  try {
    const { spawnSync } = require('child_process');
    const result = spawnSync(browserPath, ['--version'], { encoding: 'utf8' });
    const output = String(result.stdout || result.stderr || '').trim();
    return output || '(version unavailable)';
  } catch (error) {
    return `(version lookup failed: ${String(error)})`;
  }
}

function cleanupStaleSessions() {
  const targets = [
    '.wwebjs_cache',
    '_openwa_profile',
    'session',
    'data.json',
    'open-wa-session.data.json',
    'open-wa-session.postman_collection.json',
    'open-wa-session.sw_col.json',
  ];

  for (const name of targets) {
    const targetPath = path.join(__dirname, name);
    if (!fs.existsSync(targetPath)) continue;
    try {
      fs.rmSync(targetPath, { recursive: true, force: true });
      console.log('[bot] removed stale session item:', targetPath);
    } catch (error) {
      console.warn('[bot] failed to remove stale session item:', targetPath, error);
    }
  }

  const entries = fs.readdirSync(__dirname, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('_IGNORE_')) {
      const targetPath = path.join(__dirname, entry.name);
      try {
        fs.rmSync(targetPath, { recursive: true, force: true });
        console.log('[bot] removed stale session folder:', targetPath);
      } catch (error) {
        console.warn('[bot] failed to remove stale session folder:', targetPath, error);
      }
    }
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function bootstrap() {
  cleanupStaleSessions();
  ensureDir(AUTH_DATA_DIR);
  ensureDir(CACHE_DIR);

  console.log('[bot] session id:', SESSION_ID);
  console.log('[bot] auth data dir:', AUTH_DATA_DIR);
  console.log('[bot] cache dir:', CACHE_DIR);
  console.log('[bot] browser path:', BROWSER_PATH || '(not found)');
  console.log('[bot] browser version:', getBrowserVersion(BROWSER_PATH));
  console.log('[bot] headless:', HEADLESS ? 'true' : 'false');
  console.log('[bot] use system chrome:', USE_SYSTEM_CHROME ? 'true' : 'false');

  if (!BROWSER_PATH) {
    throw new Error('No supported Google Chrome installation was found. Set WHATSAPP_BROWSER_PATH, BROWSER_PATH, or CHROME_PATH to chrome.exe.');
  }

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: SESSION_ID,
      dataPath: AUTH_DATA_DIR,
    }),
    puppeteer: {
      headless: HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--disable-gpu',
      ],
      ...(USE_SYSTEM_CHROME && BROWSER_PATH ? { executablePath: BROWSER_PATH } : {}),
    },
    takeoverOnConflict: false,
    takeoverTimeoutMs: 0,
    qrMaxRetries: 0,
    restartOnAuthFail: false,
    authTimeoutMs: 0,
  });

  client.on('qr', (qr) => {
    lastQr = qr;
    console.log('\n[bot] QR received. Scan it with WhatsApp on your phone:\n');
    qrcode.generate(qr, { small: true });
    if (KEEP_QR_FILE) {
      fs.writeFileSync(path.join(__dirname, 'last-qr.txt'), qr, 'utf8');
      console.log('[bot] saved QR payload to last-qr.txt');
    }
  });

  client.on('authenticated', () => {
    console.log('[bot] authenticated');
  });

  client.on('auth_failure', (message) => {
    console.error('[bot] auth failure:', message);
    isReady = false;
    if (readyReject) {
      readyReject(new Error(message || 'Authentication failed'));
      readyReject = null;
    }
  });

  client.on('ready', () => {
    isReady = true;
    console.log('[bot] ready');
    if (readyResolve) {
      readyResolve();
      readyResolve = null;
    }
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    console.error('[bot] disconnected:', reason);
    if (String(reason).toUpperCase().includes('LOGOUT')) {
      console.error('[bot] session logged out. Run npm run clean-session only if you want a fresh login.');
    }
  });

  client.on('change_state', (state) => {
    console.log('[bot] state:', state);
  });

  client.on('loading_screen', (percent, message) => {
    console.log('[bot] loading:', `${percent}%`, message || '');
  });

  client.on('message', async (message) => {
    if (message.body === '!ping') {
      await message.reply('pong');
    }
  });

  app.get('/health', async (_req, res) => {
    let state = 'unknown';
    try {
      if (client) {
        state = await client.getState();
      }
    } catch (error) {
      state = `error:${String(error)}`;
    }

    res.json({
      ok: true,
      service: 'whatsapp-webjs-bot',
      ready: isReady,
      state,
      hasQr: Boolean(lastQr),
    });
  });

  app.get('/qr', (_req, res) => {
    if (!lastQr) {
      return res.status(404).json({ ok: false, error: 'No QR available yet' });
    }
    return res.json({ ok: true, qr: lastQr });
  });

  app.post('/sendText', auth, async (req, res) => {
    try {
      if (!isReady || !client) {
        return res.status(503).json({ ok: false, error: 'WhatsApp client is not ready yet' });
      }

      const { chatId, phone, text } = req.body || {};
      const finalChatId = chatId || normalizePhoneToChatId(phone);
      if (!finalChatId || !text) {
        return res.status(400).json({ ok: false, error: 'chatId (or phone) and text are required' });
      }

      const result = await client.sendMessage(finalChatId, text);
      return res.json({ ok: true, result: result ? { id: result.id?._serialized || null } : null });
    } catch (error) {
      return res.status(500).json({ ok: false, error: String(error) });
    }
  });

  app.listen(PORT, () => {
    console.log(`[bot] running on http://localhost:${PORT}`);
    console.log('[bot] endpoint: POST /sendText');
    console.log('[bot] endpoint: GET /health');
  });

  console.log('[bot] initializing WhatsApp client...');
  client.initialize().catch((error) => {
    console.error('[bot] initialize failed:', error);
    if (readyReject) {
      readyReject(error);
      readyReject = null;
    }
  });
}

process.on('SIGINT', async () => {
  console.log('[bot] SIGINT received');
  try {
    if (client) {
      await client.destroy();
    }
  } catch (error) {
    console.warn('[bot] error while shutting down client:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[bot] SIGTERM received');
  try {
    if (client) {
      await client.destroy();
    }
  } catch (error) {
    console.warn('[bot] error while shutting down client:', error);
  }
  process.exit(0);
});

bootstrap().catch((err) => {
  console.error('[bot] startup failed:', err);
  process.exit(1);
});
