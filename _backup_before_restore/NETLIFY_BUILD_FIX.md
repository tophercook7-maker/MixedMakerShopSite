# Fix Netlify Build Hanging Issue

## Problem
The Netlify build hangs during post-processing because it's trying to run `next build` (a Next.js command) on a static HTML site.

## Solution

### Option 1: Remove Build Command in Netlify Dashboard (Recommended)

1. Go to: https://app.netlify.com/projects/mixedmakershop
2. Click **"Site settings"** (gear icon)
3. Click **"Build & deploy"** in the left sidebar
4. Scroll to **"Build settings"**
5. Find **"Build command"** field
6. **Delete/clear the build command** (it probably says `next build`)
7. Leave it **empty**
8. Click **"Save"**
9. Try deploying again

### Option 2: Use Netlify CLI to Clear Build Command

```bash
cd /Users/christophercook/Desktop/MixedMakerShopSite
netlify unlink  # Unlink if already linked
netlify link    # Re-link to your site
netlify settings:set --command=""  # Clear build command
```

### Option 3: Manual Deploy (Quick Fix)

Since this is a static site, you can:
1. Go to Netlify dashboard
2. Click **"Deploys"** tab
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Drag and drop your entire `MixedMakerShopSite` folder
5. This bypasses build commands entirely

## Why This Happens

The `.netlify` folder in your project has settings that include:
- `command = "next build"` (Next.js build command)
- `@netlify/plugin-nextjs` plugin

Since your site is static HTML (not Next.js), these settings cause the build to hang trying to find Next.js files that don't exist.

## After Fixing

Once you remove the build command:
- Deployments should complete in seconds
- No post-processing hang
- Your static HTML files will deploy normally

## Verify

After fixing, check:
1. Build completes successfully
2. Site is live
3. Forms work (contact form)
4. File uploads work
