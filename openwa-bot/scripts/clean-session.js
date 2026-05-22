const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const targets = [
  '.wwebjs_auth',
  '.wwebjs_cache',
  '_openwa_profile',
  'session',
  'data.json',
  'open-wa-session.data.json',
  'open-wa-session.postman_collection.json',
  'open-wa-session.sw_col.json',
];

const lockFileNames = new Set(['LOCK', 'DevToolsActivePort']);

const entries = fs.readdirSync(root, { withFileTypes: true });
for (const entry of entries) {
  const name = entry.name;
  if (name.startsWith('_IGNORE_') || targets.includes(name)) {
    const target = path.join(root, name);
    try {
      fs.rmSync(target, { recursive: true, force: true });
      console.log('Removed:', target);
    } catch (err) {
      console.error('Failed to remove', target, err);
    }
  }
}

const authRoot = path.join(root, '.wwebjs_auth');
if (fs.existsSync(authRoot)) {
  const sessionEntries = fs.readdirSync(authRoot, { withFileTypes: true });
  for (const sessionEntry of sessionEntries) {
    const sessionPath = path.join(authRoot, sessionEntry.name);
    if (!sessionEntry.isDirectory()) continue;

    const nestedEntries = fs.readdirSync(sessionPath, { withFileTypes: true });
    for (const nestedEntry of nestedEntries) {
      if (!nestedEntry.isFile() || !lockFileNames.has(nestedEntry.name)) continue;

      const nestedPath = path.join(sessionPath, nestedEntry.name);
      try {
        fs.rmSync(nestedPath, { force: true });
        console.log('Removed lock file:', nestedPath);
      } catch (err) {
        console.error('Failed to remove lock file', nestedPath, err);
      }
    }
  }
}

console.log('Session cleanup complete. You can start again with npm start.');
