# Netlify Setup for gonefishinkeychains.com

## Steps to Deploy and Wire Your Domain

### 1. Deploy the Site to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag the entire `gonefishinkeychains` folder into the deploy area
4. Wait for the deployment to complete

### 2. Add Your Custom Domain

1. In your Netlify site dashboard, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter: `gonefishinkeychains.com`
4. Click **"Verify"** - Netlify will check if the domain is available to add
5. Follow Netlify's instructions to update your DNS settings

### 3. Configure DNS Settings

You'll need to update your domain's DNS records. Netlify will provide the exact values, but typically you need:

**For your domain registrar (where you bought gonefishinkeychains.com):**

#### Option A: A Record (if Netlify provides an IP)
- Type: `A`
- Name: `@` (or leave blank for root domain)
- Value: Netlify's IP address (e.g., `75.2.60.5`)

#### Option B: CNAME (recommended)
- Type: `CNAME`
- Name: `@` or `www`
- Value: Netlify will provide something like `your-site-name.netlify.app`

**You'll also need to add:**
- Type: `CNAME`
- Name: `www`
- Value: `gonefishinkeychains.com` (points www to your root domain)

### 4. Enable HTTPS

Netlify automatically provides free SSL certificates via Let's Encrypt. Once your DNS is configured:
1. Netlify will automatically detect your domain
2. Go to **Site settings** → **Domain management**
3. Click **"Verify DNS configuration"**
4. Once verified, Netlify will automatically provision an SSL certificate
5. Enable **"Force HTTPS"** under **HTTPS** settings

### 5. Test Your Site

1. Wait 5-15 minutes for DNS to propagate
2. Visit `https://gonefishinkeychains.com` in your browser
3. You should see your site!

## Troubleshooting

- **DNS not updating?** It can take up to 48 hours for DNS changes to fully propagate globally
- **SSL certificate not provisioning?** Make sure DNS is properly configured first
- **Site not loading?** Check that your Netlify deployment is successful (green status)

## Quick Deploy Commands (Alternative)

If you prefer using Netlify CLI:

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from the gonefishinkeychains folder
cd gonefishinkeychains
netlify deploy --prod

# Link to existing site
netlify link
```

## Files Included

- `index.html` - Main website file
- `logo.svg` - Logo file you can use for stickers

## Next Steps

1. Replace product placeholder images with real product photos
2. Update any placeholder text with actual product descriptions
3. Add your social media links when ready
4. Test the contact form/links

