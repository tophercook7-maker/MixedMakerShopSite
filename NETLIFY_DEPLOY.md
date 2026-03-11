# MixedMakerShop — Netlify deployment guide

## 1. App root

The Next.js app lives in **`next-app/`** (contains `package.json`, `app/`, etc.).

---

## 2. netlify.toml

Located at **repo root** (`MixedMakerShopSite/netlify.toml`). It configures:

- **Base directory**: `next-app` (build and publish run from there)
- **Build command**: `npm run build`
- **Publish directory**: `.next` (relative to base = `next-app/.next`)

There is no static export; the app uses the App Router, API routes, and middleware.

---

## 3. Netlify build settings

| Setting            | Value           |
|--------------------|-----------------|
| **Base directory** | `next-app`      |
| **Build command**  | `npm run build` |
| **Publish directory** | `.next`     |

`netlify.toml` sets these; you can leave Netlify UI defaults or override if needed.

---

## 4. Environment variables (Netlify UI)

Add these under **Site settings → Environment variables**:

| Variable                       | Scope    | Notes                                         |
|--------------------------------|----------|-----------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`     | All      | `https://YOUR_PROJECT_ID.supabase.co`        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| All      | Supabase anon/public key                      |
| `SUPABASE_SERVICE_ROLE_KEY`    | All      | Server-only; never expose to the client      |

---

## 5. Supabase Auth URL configuration

In **Supabase Dashboard → Authentication → URL configuration**:

1. **Site URL**  
   Production: `https://your-site.netlify.app`  
   (or your custom domain)

2. **Redirect URLs** — add:

   ```
   https://your-site.netlify.app/**
   https://*.netlify.app/**
   ```

   Replace `your-site` with your actual Netlify subdomain (e.g. `mixedmakershop.netlify.app`).

3. For deploy previews, include:
   ```
   https://deploy-preview-*--your-site.netlify.app/**
   ```

---

## 6. Compatibility check

| Feature        | Status  | Notes                                                |
|----------------|---------|------------------------------------------------------|
| App Router     | Yes     | Supported via OpenNext                               |
| Middleware     | Yes     | Runs as Netlify Edge Functions                       |
| API routes     | Yes     | `/api/*` works with serverless functions             |
| Auth redirects | Yes     | Use `redirectedFrom` or `redirect` as configured     |
| Static export  | No      | App is full Next.js (SSR + API + middleware)         |

---

## 7. GitHub → Netlify deployment checklist

- [ ] **1. Push to GitHub**  
  Ensure the repo is pushed with the latest code and `netlify.toml`.

- [ ] **2. Connect Netlify**  
  - Netlify → **Add new site → Import an existing project**  
  - Connect your GitHub account and select the repo  

- [ ] **3. Configure build**  
  - Base directory: `next-app`  
  - Build command: `npm run build`  
  - Publish directory: `.next`  

- [ ] **4. Add environment variables**  
  Add the three Supabase variables in Site settings.

- [ ] **5. Deploy**  
  Trigger a deploy and confirm the build completes.

- [ ] **6. Configure Supabase Auth URLs**  
  Add the Netlify domain(s) and redirect URLs in Supabase.

- [ ] **7. Test**  
  - `/` — Home  
  - `/connect` — Connect page  
  - `/auth/login` — Login  
  - `/admin` — Redirects to login when logged out  

---

## 8. Custom domain (optional)

1. Netlify → **Domain settings** → Add custom domain  
2. In Supabase Auth URL configuration, add your custom domain to **Site URL** and **Redirect URLs**  
3. Redeploy after DNS changes if needed  
