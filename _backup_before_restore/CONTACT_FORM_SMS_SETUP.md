# Contact Form SMS Setup - Quick Guide

## ✅ Current Status

Your contact form (`name="contact"`) should already be set up to send SMS notifications if you configured it in Netlify. Here's how to verify and set it up:

---

## 🔍 Step 1: Verify Current Setup

1. Go to: https://app.netlify.com/projects/mixedmakershop
2. Click: **Site settings** → **Forms** → **Form notifications**
3. Look for notifications for the **"contact"** form

You should see:
- ✅ Email notification to: `Topher@mixedmakershop.com`
- ✅ SMS notification to: `5015758017@tmomail.net` (if already set up)

---

## 📱 Step 2: Add SMS Notification (If Not Already There)

If you don't see an SMS notification for the "contact" form:

1. **Click**: "Add notification" button
2. **Choose**: "Email notification"
3. **Fill in**:
   - **Email to notify**: `5015758017@tmomail.net`
   - **Name** (optional): `SMS - Contact Form`
   - **Subject** (optional): `New Contact: MixedMakerShop`
4. **Form**: Select "contact" from the dropdown (or leave as "any form")
5. **Click**: "Save"

---

## ✅ What You'll Receive

When someone submits the contact form, you'll get:

### Email (to Topher@mixedmakershop.com):
- Full form details
- Customer name, email, topic, message
- Complete submission data

### SMS (to your phone):
- Quick notification
- Customer name
- Email address
- Message preview (truncated)
- Same content as email, just via text

---

## 🧪 Step 3: Test It

1. Go to: https://mixedmakershop.com/#contact
2. Fill out the contact form with test data
3. Submit it
4. Check:
   - ✅ Your email (Topher@mixedmakershop.com)
   - ✅ Your phone (SMS should arrive within 1-2 minutes)

---

## 📝 Notes

- **SMS Format**: Same content as email, just delivered via text
- **Character Limit**: SMS messages may be truncated due to length limits
- **Full Details**: Always check email for complete information
- **Both Notifications**: You'll receive both email AND SMS for every submission

---

## ✅ Quick Checklist

- [ ] Checked Netlify notifications for "contact" form
- [ ] Added SMS notification (`5015758017@tmomail.net`) if needed
- [ ] Tested form submission
- [ ] Received email notification ✅
- [ ] Received SMS notification ✅

---

## 🎉 Done!

Once set up, every contact form submission will send:
1. **Email** → Full details to your inbox
2. **SMS** → Quick notification to your phone

Both contain the same information - just different delivery methods!
