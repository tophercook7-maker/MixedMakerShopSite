# Finding the Checkout Form in Netlify

## After Deployment

The checkout form should now be detected by Netlify. Here's how to find it:

### Option 1: Check Forms List
1. Go to: https://app.netlify.com/projects/mixedmakershop
2. Click **"Forms"** in the left sidebar
3. You should see **two forms**:
   - `contact` (from index.html)
   - `checkout` (from checkout.html) ← This is the new one!

### Option 2: If "checkout" Doesn't Appear Yet

Netlify sometimes needs a moment to detect new forms. Try:

1. **Wait 1-2 minutes** after deployment
2. **Refresh the Netlify dashboard**
3. **Submit a test order** - Sometimes Netlify only shows forms after the first submission:
   - Go to: https://mixedmakershop.com/shop.html
   - Add an item to cart
   - Go to checkout
   - Fill out the form (use test data)
   - Submit the order
   - Then check Forms again

### Option 3: Check Form Submissions

Even if the form name doesn't appear in the list, submissions will still work:
1. Go to **Forms** → **Active forms**
2. Look for any new submissions
3. Or check **Site overview** → Recent activity

## Setting Up Email Notifications

Once you see the "checkout" form:

1. Go to: **Site Settings** → **Forms** → **Form Notifications**
2. Click **"Add notification"**
3. Select **"checkout"** from the form dropdown
4. Choose **"Email notification"**
5. Enter your email address
6. Customize the subject line (optional):
   - Example: "New Order from MixedMakerShop"
7. Save

## Test It

After setting up notifications:
1. Submit a test order
2. Check your email inbox
3. You should receive an email with all order details

## Troubleshooting

If the checkout form still doesn't appear:
- Check that `checkout.html` was deployed (it should be)
- Verify the form has `data-netlify="true"` (it does)
- Try submitting a test order - this will force Netlify to register it
- Check the Netlify build logs for any errors

The form should work even if it doesn't show in the dashboard yet - Netlify will still process submissions!

