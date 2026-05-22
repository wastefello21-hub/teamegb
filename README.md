This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started with the application

Before running the app, copy [.env.local.example](.env.local.example) to `.env.local` and fill in your Supabase keys. If you want ID card uploads to work with a private bucket, also set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## WhatsApp message delivery in production

The website does not keep a WhatsApp login by itself. Deploy the bot in `openwa-bot/` as a separate long-running service with persistent disk, then point the website at it.

Required setup:

1. Deploy `openwa-bot/` to a server/VPS that can keep Chrome running and store `.wwebjs_auth/` on persistent disk.
2. Log into WhatsApp once in the bot terminal by scanning the QR.
3. Set these production env vars on the Next.js deployment:

```env
OPENWA_API_URL=https://your-bot-host.example.com
OPENWA_SENDTEXT_PATH=/sendText
OPENWA_API_KEY=the_same_key_used_by_the_bot
```

4. Make sure your contribution routes send messages after a contribution is saved. The app already does this in `/api/create-contribution`.

If you redeploy only the website but not the bot, WhatsApp sending will fail because the bot session lives in the separate service.
