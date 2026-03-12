# Mint Mobile SMS Setup - Step-by-Step Guide

## ✅ Mint Mobile Email-to-SMS Setup

Since Mint Mobile uses T-Mobile's network, you'll use **T-Mobile's email gateway**.

---

## 📱 Step 1: Find Your SMS Email Address

**Mint Mobile uses T-Mobile's network**, so use T-Mobile's email gateway:

**Format**: `yourphonenumber@tmomail.net`

**Example**: 
- If your phone number is: `(555) 123-4567`
- Your SMS email is: `5551234567@tmomail.net`

**Important**: 
- Use 10 digits (no dashes, no spaces, no parentheses)
- No area code prefix needed (just the 10-digit number)
- Use `@tmomail.net` (T-Mobile's gateway)

---

## 🚀 Step 2: Set Up in Netlify (5 Minutes)

### Step 2a: Go to Netlify Dashboard

1. **Open**: https://app.netlify.com
2. **Sign in** to your account
3. **Select your site**: MixedMakerShop

### Step 2b: Navigate to Form Notifications

1. **Click**: "Site settings" (gear icon) in the top navigation
2. **In left sidebar**: Click "Forms"
3. **Click**: "Form notifications" tab
4. **You should see**: "contact" form listed

### Step 2c: Add SMS Email Notification

1. **Click**: "Add notification" button
2. **Choose**: "Email notification"
3. **Fill in the form**:
   - **Email**: `yournumber@tmomail.net`
     - Replace `yournumber` with your 10-digit phone number
     - Example: `5551234567@tmomail.net`
   - **Name** (optional): `SMS Notification - Mint Mobile`
   - **Subject** (optional): `New Contact Form - MixedMakerShop`
4. **Click**: "Save"

### Step 2d: Test It!

1. **Go to your website**: mixedmakershop.com
2. **Navigate to**: Contact section
3. **Fill out the form** with test data:
   - Name: Test
   - Email: your-email@example.com
   - Topic: Choose any
   - Message: Test message
4. **Submit the form**
5. **Check your phone** - you should receive an SMS within 1-2 minutes!

---

## ✅ You're Done!

Now when someone submits your contact form:
1. ✅ You'll get an email notification (existing)
2. ✅ You'll get an SMS notification (new!)
3. ✅ SMS will contain the form details

**Note**: 
- SMS messages are shortened (character limit)
- Full details will be in your email
- SMS is just for quick notifications

---

## 📝 What the SMS Will Look Like

You'll receive an SMS with:
- Customer name
- Email address
- Message preview (truncated)
- Link to view full submission in Netlify

**Example SMS**:
```
New Contact Form - MixedMakerShop
From: John Doe
Email: john@example.com
Topic: A custom website
Message: I'm looking for a custom website...
```

---

## 🔧 Troubleshooting

### SMS Not Arriving?

1. **Check phone number format**:
   - ✅ Correct: `5551234567@tmomail.net`
   - ❌ Wrong: `(555) 123-4567@tmomail.net`
   - ❌ Wrong: `555-123-4567@tmomail.net`

2. **Verify in Netlify**:
   - Go to: Site Settings → Forms → Form Notifications
   - Check email address is correct
   - Should show `yournumber@tmomail.net`

3. **Test the email gateway**:
   - Send a test email from your email to: `yournumber@tmomail.net`
   - If you receive it as SMS, gateway is working
   - If not, check your phone number

4. **Check Mint Mobile settings**:
   - Some carriers require enabling email-to-SMS
   - Check Mint Mobile app/website settings
   - Contact Mint Mobile support if needed

### SMS Arriving But Delayed?

- Normal delay: 1-2 minutes
- If longer, check Netlify function logs
- Or test email gateway directly

### Want Full Messages?

SMS has character limits. For full messages:
- Check your email (Netlify sends full details)
- Or log into Netlify dashboard → Forms → Submissions

---

## 📱 Quick Reference

**Mint Mobile SMS Email**: `yournumber@tmomail.net`

**Where to set it**: Netlify Dashboard → Site Settings → Forms → Form Notifications

**Test it**: Submit your contact form and check your phone!

---

## ✅ Checklist

- [ ] I know my 10-digit phone number
- [ ] I've added `yournumber@tmomail.net` to Netlify notifications
- [ ] I've submitted a test form
- [ ] I received SMS on my phone
- [ ] It's working! ✅

---

## 🎉 That's It!

You're all set! Every time someone contacts you through your website, you'll get:
1. An email with full details
2. An SMS notification for quick alerts

No extra setup needed - it's already configured in your form!
