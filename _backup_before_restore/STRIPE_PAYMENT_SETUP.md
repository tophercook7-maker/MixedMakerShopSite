# Stripe Credit Card Payment Setup Guide

This guide will help you set up Stripe payment processing for MixedMakerShop.com.

## ✅ What's Been Implemented

1. **Stripe Payment Integration**
   - Credit card form using Stripe Elements (secure, PCI-compliant)
   - Payment processing via Stripe Payment Intents
   - Serverless functions for secure payment handling
   - Order confirmation after successful payment

2. **Files Created/Modified**
   - `netlify/functions/create-payment-intent.js` - Creates payment intent
   - `netlify/functions/confirm-payment.js` - Confirms payment and submits order
   - `checkout.html` - Updated with Stripe Elements and payment processing
   - `package.json` - Added Stripe dependency
   - `netlify.toml` - Updated with functions directory

## 🔧 Setup Steps

### Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account setup (business information, bank account, etc.)

### Step 2: Get Your Stripe API Keys

1. Log into your Stripe Dashboard
2. Go to **Developers** → **API keys**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` for test mode, `pk_live_` for live)
   - **Secret key** (starts with `sk_test_` for test mode, `sk_live_` for live)

### Step 3: Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Navigate to your site → **Site settings** → **Environment variables**
3. Add the following environment variable:
   - **Key**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe Secret Key (from Step 2)
   - **Scopes**: All scopes (or specific if you have multiple sites)

### Step 4: Update Checkout Page with Publishable Key

1. Open `checkout.html`
2. Find this line (around line 446):
   ```javascript
   const stripe = Stripe('pk_test_51YourPublishableKeyHere');
   ```
3. Replace `'pk_test_51YourPublishableKeyHere'` with your actual Stripe Publishable Key
4. For production, use your live publishable key (`pk_live_...`)

### Step 5: Install Dependencies and Deploy

1. In your project directory, run:
   ```bash
   npm install
   ```
   This installs the Stripe package for the Netlify functions.

2. Commit and push your changes to trigger a Netlify deployment:
   ```bash
   git add .
   git commit -m "Add Stripe payment processing"
   git push
   ```

3. Netlify will automatically:
   - Install dependencies
   - Build your site
   - Deploy the functions

### Step 6: Test the Payment Flow

#### Test Mode (Recommended First)

1. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date (e.g., 12/34)
   - Use any 3-digit CVC
   - Use any ZIP code

2. Test the checkout flow:
   - Add items to cart
   - Go to checkout
   - Fill out shipping info
   - Enter test card details
   - Complete payment

3. Check Stripe Dashboard → **Payments** to see test payments

#### Live Mode

1. In Stripe Dashboard, toggle from "Test mode" to "Live mode"
2. Update `checkout.html` with your live publishable key
3. Update Netlify environment variable with live secret key
4. Redeploy your site

## 📋 How It Works

### Payment Flow

1. **Customer adds items to cart** → Cart stored in browser localStorage
2. **Customer goes to checkout** → Payment intent created automatically
3. **Customer fills shipping form** → Form validated
4. **Customer enters card details** → Stripe Elements validates in real-time
5. **Customer clicks "Complete Order"** → Payment processed via Stripe
6. **Payment confirmed** → Order submitted to Netlify Forms
7. **You receive email** → Order details with payment confirmation
8. **Cart cleared** → Customer redirected to homepage

### Security Features

- ✅ **PCI Compliance**: Card details never touch your server
- ✅ **Secure Processing**: All payments handled by Stripe
- ✅ **Serverless Functions**: Payment logic runs securely on Netlify
- ✅ **Environment Variables**: Secret keys stored securely
- ✅ **Payment Verification**: Orders only submitted after successful payment

## 📧 Email Notifications

After payment, you'll receive an email via Netlify Forms with:
- Customer shipping information
- Order items and quantities
- Order totals
- Payment Intent ID (for tracking in Stripe)
- Payment status (PAID)

## 🔍 Monitoring Payments

### Stripe Dashboard

- View all payments: **Payments** tab
- See payment details: Click on any payment
- Refund payments: From payment detail page
- Export data: Use Stripe's export features

### Netlify Dashboard

- View form submissions: **Forms** tab
- See order details: Each submission includes full order info
- Email notifications: Configure in **Forms** → **Form notifications**

## 🐛 Troubleshooting

### Payment Intent Creation Fails

- **Check**: Netlify environment variable `STRIPE_SECRET_KEY` is set
- **Check**: Secret key is correct (test vs live mode)
- **Check**: Netlify functions are deploying correctly

### Payment Confirmation Fails

- **Check**: Card details are valid
- **Check**: Payment intent was created successfully
- **Check**: Browser console for error messages

### Order Not Received

- **Check**: Netlify Forms notifications are configured
- **Check**: Email address in Netlify settings
- **Check**: Spam folder
- **Check**: Netlify Forms dashboard for submissions

## 💰 Stripe Fees

- **Online payments**: 2.9% + $0.30 per transaction
- **No monthly fees**
- **No setup fees**
- **First $1M in revenue**: Standard rates apply

## 🔐 Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** for secret keys
3. **Test in test mode** before going live
4. **Monitor Stripe Dashboard** regularly
5. **Set up webhooks** (optional) for advanced notifications

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Stripe Dashboard](https://dashboard.stripe.com)

## ✅ Checklist

Before going live:

- [ ] Stripe account created and verified
- [ ] Bank account added to Stripe
- [ ] Test payments working
- [ ] Publishable key updated in checkout.html
- [ ] Secret key added to Netlify environment variables
- [ ] Email notifications configured in Netlify
- [ ] Tested complete checkout flow
- [ ] Switched to live mode (when ready)
- [ ] Updated keys for production

## 🎉 You're All Set!

Once configured, customers can securely pay with credit cards directly on your site. All payments are processed by Stripe, and you'll receive order notifications via email.
