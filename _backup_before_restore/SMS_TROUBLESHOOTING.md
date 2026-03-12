# SMS Troubleshooting Guide

## Current Setup
- **Phone Number**: 501-575-8017
- **SMS Email**: 5015758017@tmomail.net
- **Carrier**: Mint Mobile (uses T-Mobile network)

---

## Step 1: Verify Email Gateway Works

First, test if the email-to-SMS gateway is working at all:

1. **Send a test email** from your regular email (Topher@mixedmakershop.com) to:
   - `5015758017@tmomail.net`
2. **Check your phone** - you should receive it as an SMS within 1-2 minutes
3. **If you DON'T receive it**: The gateway isn't working - see Step 4

---

## Step 2: Check Netlify Notification Format

In Netlify, the notification should be:
- **Email address**: `5015758017@tmomail.net` (10 digits, no dashes, no spaces)
- **NOT**: `(501) 575-8017@tmomail.net`
- **NOT**: `501-575-8017@tmomail.net`
- **NOT**: `+15015758017@tmomail.net`

---

## Step 3: Verify Notification is Active

1. Go to: https://app.netlify.com/projects/mixedmakershop/configuration/notifications
2. Check the "Form submission notifications" section
3. Look for: "Email 5015758017@tmomail.net on new submission from any form"
4. Make sure it's **enabled** (not disabled)

---

## Step 4: Test Direct Email Gateway

If the email gateway test (Step 1) didn't work:

### Option A: Try Alternative T-Mobile Gateway
Sometimes `tmomail.net` doesn't work. Try:
- `5015758017@tmomail.net` (current)
- `5015758017@email.uscc.net` (alternative)

### Option B: Check Mint Mobile Settings
1. Log into your Mint Mobile account
2. Check if email-to-SMS is enabled
3. Some carriers require this to be enabled in account settings

### Option C: Contact Mint Mobile Support
Ask them:
- "Is email-to-SMS enabled for my number?"
- "What email gateway should I use for 501-575-8017?"
- "Can you test sending an email to my number?"

---

## Step 5: Check Netlify Form Submissions

1. Go to: https://app.netlify.com/projects/mixedmakershop/forms
2. Check if form submissions are being received
3. If submissions show up but no SMS:
   - The form is working
   - The notification might not be configured correctly
   - Or the email gateway isn't working

---

## Step 6: Verify Notification Configuration

In Netlify notifications, make sure:
- ✅ Email address is exactly: `5015758017@tmomail.net`
- ✅ Form selection is: "any form" (or specifically "contact")
- ✅ Notification is enabled (not disabled)
- ✅ No typos in the email address

---

## Common Issues & Fixes

### Issue 1: SMS Not Arriving
**Possible causes:**
- Email gateway format wrong
- Mint Mobile email-to-SMS not enabled
- Netlify notification not configured correctly

**Fix:**
- Test email gateway directly (Step 1)
- Verify Netlify notification format (Step 2)
- Check Mint Mobile account settings

### Issue 2: SMS Arriving But Delayed
**Normal:** 1-2 minutes delay is normal
**If longer:** Check Netlify function logs or test gateway directly

### Issue 3: SMS Arriving But Truncated
**Normal:** SMS has character limits (160-320 characters)
**Solution:** Full details always in email, SMS is just for quick alerts

---

## Quick Test Checklist

- [ ] Sent test email to `5015758017@tmomail.net` from my email
- [ ] Received SMS on my phone ✅
- [ ] Verified Netlify notification format is correct
- [ ] Checked Netlify form submissions are being received
- [ ] Verified notification is enabled in Netlify
- [ ] Tested contact form submission
- [ ] Checked both email and SMS after form submission

---

## Next Steps

If email gateway test works but Netlify SMS doesn't:
1. Double-check Netlify notification email format
2. Try removing and re-adding the notification
3. Check Netlify function logs for errors

If email gateway test doesn't work:
1. Contact Mint Mobile support
2. Ask about email-to-SMS for your number
3. Get the correct email gateway format
