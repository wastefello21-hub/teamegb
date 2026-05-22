Fly.io deployment guide (openwa-bot)

1. Install `flyctl` and authenticate:

```
# https://fly.io/docs/hands-on/install-flyctl/
flyctl auth login
```

2. From `openwa-bot/` initialize app (choose region)

```
cd openwa-bot
flyctl launch --name team-egb-openwa --no-deploy --region iad
```

3. Create a persistent volume for the auth folder:

```
flyctl volumes create wwebjs_auth --size 1 --region iad --app team-egb-openwa
```

4. Add the mount to `fly.toml` (already provided) and set secrets:

```
flyctl secrets set OPENWA_API_KEY=your-secret-key WHATSAPP_SESSION_ID=team-egb WHATSAPP_HEADLESS=false PORT=8080 --app team-egb-openwa
```

5. Deploy:

```
flyctl deploy --app team-egb-openwa
```

6. Watch logs, scan QR and confirm ready:

```
flyctl logs --app team-egb-openwa --follow
curl -s https://team-egb-openwa.fly.dev/health | jq
```

Notes:

- After first login and `ready:true`, you may set `WHATSAPP_HEADLESS=true` and re-deploy secrets for headless runs.
- The bot must have persistent `.wwebjs_auth`; do not commit that folder to git.
- If Fly auto-assigns a different app name or region, adapt the `fly.toml` accordingly.
