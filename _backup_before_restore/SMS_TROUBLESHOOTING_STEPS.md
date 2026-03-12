# Fix SMS Notifications - Step by Step

## Current Situation
- ✅ SMS notification exists: `5015758017@tmomail.net on new submission from any form`
- ❌ Not receiving texts from contact form
- ✅ gonefishinkeychains.com SMS works (gateway is fine)

## Quick Test First

**Test if the email gateway works:**
1. Send an email from your regular email (Topher@mixedmakershop.com) to: `5015758017@tmomail.net`
2. Check your phone - you should receive it as SMS within 1-2 minutes
3. If you get the SMS → gateway works, issue is in Netlify
4. If you don't get the SMS → gateway issue, contact Mint Mobile

## Solution: Add Specific Notification for Contact Form

Since "any form" isn't working, let's add a specific notification:

### Step 1: Go to Notifications
1. Go to: https://app.netlify.com/projects/mixedmakershop/configuration/notifications#form-submission-notifications
2. Scroll down to "Form submission notifications" section

### Step 2: Add New Notification
1. Click **"Add notification"** button (top right of that section)
2. Select **"Email notification"** from dropdown
3. Fill in the form:
   - **Email to notify**: `5015758017@tmomail.net`
   - **Name** (optional): `SMS - Contact Form`
   - **Subject** (optional): `New Contact: MixedMakerShop`
4. **IMPORTANT - Form selection**: 
   - Click the dropdown for "Form"
   - Select **"contact"** (NOT "any form")
   - This makes it specific to the contact form
5. Click **"Save"**

### Step 3: Verify
After saving, you should see TWO SMS notifications:
- `5015758017@tmomail.net on new submission from any form` (existing)
- `5015758017@tmomail.net on new submission from contact` (new - this is the one that should work!)

### Step 4: Test
1. Go to: https://mixedmakershop.com/#contact
2. Fill out the form with test data (including phone number)
3. Submit it
4. Check your phone - should get SMS within 1-2 minutes

## Alternative: Check Existing Notification

If adding a new one doesn't work, check the existing one:

1. Find: "Email 5015758017@tmomail.net on new submission from any form"
2. Click the **"Options"** button (three dots) next to it
3. Click **"Edit"**
4. Verify:
   - Email is exactly: `5015758017@tmomail.net` (no spaces, no dashes)
   - Form is set to: "any form"
   - Notification is **enabled** (not disabled)
5. If it looks correct but still doesn't work:
   - Try **disabling** it, save, then **enabling** it again
   - Or **delete** it and recreate it

## Why This Should Work

Since gonefishinkeychains.com works:
- ✅ Email gateway (`5015758017@tmomail.net`) works
- ✅ Mint Mobile email-to-SMS is enabled
- ✅ Format is correct

The issue is likely that "any form" isn't triggering for the contact form specifically. Adding a form-specific notification should fix it!
