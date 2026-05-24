# WhatsApp bot

This folder contains the WhatsApp bridge for the festival project.

It now uses `whatsapp-web.js` with `LocalAuth`, so the session is stored locally and the QR code is printed in the terminal when login is needed.

## Prerequisites

- Google Chrome installed on Windows.
- Node.js 18+.
- A phone with WhatsApp that can scan the QR.

## Install

From this folder:

```powershell
npm install
```

## Configure

Create or edit `.env` in this folder with:

```env
PORT=8080
OPENWA_API_KEY=
WHATSAPP_SESSION_ID=team-egb
WHATSAPP_HEADLESS=false
WHATSAPP_BROWSER_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

If `WHATSAPP_BROWSER_PATH` is omitted, the bot will try common Chrome locations.

## Start

```powershell
npm start
```

The first run prints a QR code in the terminal. Scan it with WhatsApp on your phone.

## Check health

```powershell
curl http://localhost:8080/health
```

## Send a test message

```powershell
curl -X POST http://localhost:8080/sendText -H "Content-Type: application/json" -d '{"phone":"919876543210","text":"Hello from whatsapp-web.js"}'
```

## Reset login

If you want a fresh login, run:

```powershell
npm run clean-session
```

That removes the `whatsapp-web.js` auth cache and any older OpenWA session folders.

## Deploy as a persistent bot service

This bot should not run on a short-lived serverless platform. Deploy it on a long-running host with persistent storage so `.wwebjs_auth/` survives restarts.

Use the same `WHATSAPP_SESSION_ID` on every restart, and keep `WHATSAPP_HEADLESS=false` until you finish the first QR login.

## Use this laptop as the WhatsApp host after website deployment

If the Next.js website is deployed somewhere else, the website must still be able to reach this bot service over the network. `http://localhost:8080` works only on this laptop, so expose the bot through a tunnel and point the deployed site at that public tunnel URL.

Recommended setup on Windows:

1. Keep this bot running on this laptop with `npm start`.
2. Install a tunnel tool such as Cloudflare Tunnel or ngrok.
3. Forward the local bot port:

```powershell
cloudflared tunnel --url http://localhost:8080
```

4. Copy the public tunnel URL into the deployed website env vars:

```env
OPENWA_API_URL=https://your-public-tunnel.example.com
OPENWA_SENDTEXT_PATH=/sendText
OPENWA_API_KEY=the_same_key_used_by_the_bot
```

5. Keep `.wwebjs_auth/` on this laptop so the WhatsApp login survives restarts.

If you want the bot to come back automatically after reboot, use Windows Task Scheduler or a service wrapper such as `pm2` to run `npm start` in `openwa-bot/` on sign-in.

For the Next.js site, set:

```env
OPENWA_API_URL=https://your-bot-host.example.com
OPENWA_SENDTEXT_PATH=/sendText
OPENWA_API_KEY=the_same_key_used_by_the_bot
```

If you change the bot host, scan a new QR only if the auth folder is lost or you intentionally run `npm run clean-session`.
