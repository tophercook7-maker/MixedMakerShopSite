# Credit Card Payment System

MixedMakerShop.com now has a fully integrated credit card payment system powered by Stripe.

## 🎯 Quick Start

1. **Get Stripe API Keys** - Sign up at [stripe.com](https://stripe.com) and get your keys
2. **Set Environment Variable** - Add `STRIPE_SECRET_KEY` in Netlify dashboard
3. **Update Publishable Key** - Edit `checkout.html` line ~502 with your publishable key
4. **Install & Deploy** - Run `npm install` and deploy to Netlify

See **STRIPE_PAYMENT_SETUP.md** for detailed instructions.

## ✨ Features

- ✅ Secure credit card processing (PCI compliant)
- ✅ Real-time card validation
- ✅ Automatic payment confirmation
- ✅ Order email notifications
- ✅ Payment tracking in Stripe dashboard

## 📁 Files

- `checkout.html` - Payment form with Stripe Elements
- `netlify/functions/create-payment-intent.js` - Creates payment intent
- `netlify/functions/confirm-payment.js` - Confirms payment & submits order
- `STRIPE_PAYMENT_SETUP.md` - Complete setup guide

## 🔒 Security

- Card details never touch your server
- All processing handled by Stripe
- Secret keys stored in Netlify environment variables
- Publishable key is safe to expose (by design)

## 💳 Test Cards

Use these in test mode:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry, any CVC, any ZIP

## 📞 Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Netlify Functions Docs](https://docs.netlify.com/functions/)
