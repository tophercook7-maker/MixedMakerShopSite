# E-Commerce Setup Guide

## Overview

You now have a **centralized shopping system** on MixedMakerShop.com that handles both:
- **3D Printed Items** (from MixedMakerShop)
- **GoneFishin Keychains** (from gonefishinkeychains.com)

## How It Works

### Architecture
- **GoneFishin Keychains Site**: Showcases products, links to shop for purchase
- **MixedMakerShop Shop Page**: Central hub for all products
- **Checkout**: Single checkout system on MixedMakerShop.com

### Benefits of Centralized System
✅ One payment system to manage  
✅ Easier order tracking  
✅ Better customer experience (one checkout)  
✅ Both brands maintain their own sites for marketing  
✅ Customers can buy from either site, checkout is unified  

## Files Created

### 1. `shop.html` - Main Shopping Page
- Product listings for all items
- Shopping cart functionality
- Filter by category (Keychains, 3D Prints, All)
- Cart stored in browser (localStorage)

### 2. `checkout.html` - Checkout Page
- Shipping information form
- Order summary
- Payment processing (currently manual)
- Form validation

## How to Add Products

### Adding Keychains
Edit `shop.html` and add to the `products` array:

```javascript
{
  id: 'keychain-unique-id',
  name: 'Your Keychain Name',
  description: 'Description of the keychain',
  price: 18.99, // or 12.99, 8.99
  category: 'keychains',
  image: '../gonefishinkeychains/img/things/your-image.png',
  brand: 'GoneFishin'
}
```

### Adding 3D Printed Items
Edit `shop.html` and add to the `products` array:

```javascript
{
  id: '3d-print-unique-id',
  name: 'Your 3D Print Name',
  description: 'Description of the item',
  price: 15.00,
  category: '3dprints',
  image: 'img/products/your-image.png', // or null for placeholder
  brand: 'MixedMakerShop'
}
```

## Current Payment Flow

1. Customer browses products on either site
2. Clicks "Add to Cart" → Cart saved in browser
3. Goes to checkout → Fills out shipping form
4. Submits order → Currently shows alert
5. **You receive order** (needs setup - see below)
6. Contact customer to arrange payment (PayPal, Venmo, etc.)

## Setting Up Payment Processing

### Option 1: Manual (Current)
- Works as-is
- You receive orders via email/form submission
- Contact customers to arrange payment
- Best for low volume or starting out

### Option 2: Stripe Integration (Recommended for growth)
1. Sign up at [stripe.com](https://stripe.com)
2. Add Stripe payment form to `checkout.html`
3. Process payments automatically
4. Orders saved to Stripe dashboard

### Option 3: PayPal Integration
1. Sign up at [paypal.com](https://paypal.com)
2. Add PayPal button/form to checkout
3. Customers pay via PayPal
4. You receive payment notifications

### Option 4: Netlify Forms + Payment Service
1. Use Netlify Forms for order submission
2. Connect to payment processor
3. Automatic order emails

## Order Processing (What Needs Setup)

### Current Status
- ✅ Shopping cart works
- ✅ Checkout form works
- ❌ Order submission needs backend/email service

### To Enable Order Notifications

**Option A: Netlify Forms (Easiest)**
1. Add `netlify` attribute to checkout form
2. Add hidden input: `<input type="hidden" name="form-name" value="order">`
3. Netlify automatically sends emails with form data

**Option B: Email Service (Formspree, etc.)**
1. Sign up at [formspree.io](https://formspree.io) or similar
2. Update form action in `checkout.html`
3. Orders sent to your email automatically

**Option C: Backend API**
1. Create server endpoint to receive orders
2. Send confirmation emails
3. Store orders in database

## Testing Your Shop

1. **Add Test Products**: Edit `shop.html` products array
2. **Test Cart**: Add items, check cart badge updates
3. **Test Checkout**: Fill form, submit order
4. **Verify**: Check that cart clears after checkout

## Next Steps

### Immediate
- [ ] Add your actual products to `shop.html`
- [ ] Add product images to appropriate folders
- [ ] Test the shopping flow end-to-end

### Payment Setup
- [ ] Choose payment processor (Stripe/PayPal/Manual)
- [ ] Set up order notification system
- [ ] Test payment flow

### Order Management
- [ ] Set up email notifications for orders
- [ ] Create order tracking system (spreadsheet/database)
- [ ] Set up shipping labels (PirateShip, etc.)

## File Structure

```
MixedMakerShopSite/
├── index.html                    # Main MixedMakerShop site
├── shop.html                     # Shopping page ⭐ NEW
├── checkout.html                 # Checkout page ⭐ NEW
├── gonefishinkeychains/
│   └── index.html               # Updated with shop links
└── E-COMMERCE_SETUP.md          # This file
```

## Notes

- Cart uses **localStorage** - persists between pages on same browser
- All products in one place - easy to manage
- GoneFishin site links to MixedMakerShop shop
- Future: Can add inventory management, order history, etc.

## Support

For payment integration help:
- Stripe docs: https://stripe.com/docs
- PayPal docs: https://developer.paypal.com
- Netlify Forms: https://docs.netlify.com/forms/setup/

---

**Your shopping system is ready! Just add products and set up payment processing.**
