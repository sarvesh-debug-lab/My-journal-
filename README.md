# My Journal — PWA

A beautiful notebook-style daily to-do list. Works offline, installable on any device.

## Deploy to Vercel

### Option A — Drag & Drop (easiest)
1. Run `npm install && npm run build` locally
2. Drag the `dist/` folder to [vercel.com/new](https://vercel.com/new)

### Option B — GitHub + Vercel (recommended)
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite — just click **Deploy**

### Option C — Vercel CLI
```bash
npm install -g vercel
npm install
vercel --prod
```

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build   # outputs to dist/
npm run preview # preview the production build
```

## PWA Features
- Works offline after first visit
- Installable on iOS (Add to Home Screen) and Android
- All data stored in localStorage — private to your device
