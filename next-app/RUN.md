# How to run MixedMakerShop (Next.js)

## Quick start

```bash
cd next-app
npm run dev
```

Then open: **http://localhost:3000**

If you see:
> Port 3000 is in use, trying 3001 instead

Open **http://localhost:3001** instead. Another process (old dev server, static server, etc.) is using 3000.

## From workspace root

```bash
npm run dev
```

This runs the Next.js app from `next-app/`.

## Routes

| URL | Expected behavior |
|-----|-------------------|
| http://localhost:3000/ | Home page |
| http://localhost:3000/connect | Connect page (4 buttons) |
| http://localhost:3000/auth/login | Login page |
| http://localhost:3000/admin | Redirects to login when logged out |
