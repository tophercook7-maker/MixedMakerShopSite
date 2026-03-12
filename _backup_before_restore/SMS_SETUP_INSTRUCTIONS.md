# SMS Messaging Setup - Step-by-Step Instructions

## 🎯 Two Options Available

### Option 1: Email-to-SMS (FREE & SIMPLE - 5 minutes)
✅ **Recommended to start with this!**

### Option 2: Twilio Two-Way SMS (PAID - More features)
💰 ~$1-2/month, full two-way messaging

---

## 🚀 Option 1: Email-to-SMS (Start Here!)

### Step 1: Find Your Carrier's Email Gateway

**Common US Carriers:**
- **AT&T**: `yournumber@txt.att.net`
- **Verizon**: `yournumber@vtext.com`
- **T-Mobile / Mint Mobile**: `yournumber@tmomail.net` ⬅️ **Use this for Mint Mobile!**
- **Sprint**: `yournumber@messaging.sprintpcs.com`
- **US Cellular**: `yournumber@email.uscc.net`

**Note**: Mint Mobile uses T-Mobile's network, so use T-Mobile's gateway: `@tmomail.net`

**Format**: Use your 10-digit phone number (no dashes or spaces)
**Example**: If your number is `555-123-4567`, use `5551234567@txt.att.net`

### Step 2: Add SMS Notification in Netlify

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Select your site**: MixedMakerShop
3. **Go to**: Site Settings → Forms → Form Notifications
4. **Click**: "Add notification"
5. **Choose**: "Email notification"
6. **Enter email**: `yourphonenumber@yourcarrier.com`
   - Example: `5551234567@txt.att.net`
7. **Subject** (optional): `New Contact Form - MixedMakerShop`
8. **Click**: "Save"

### Step 3: Test It!

1. Submit a test form on your website
2. Check your phone - you should receive an SMS!

**Done!** ✅

**Limitations:**
- One-way only (you can't reply from phone)
- Character limit (~160 chars)
- No formatting

---

## 💬 Option 2: Twilio Two-Way SMS (Full Setup)

### Step 1: Create Twilio Account

1. **Sign up**: https://www.twilio.com/try-twilio
2. **Verify your email** and phone number
3. **Get $15 free credit** (enough for ~2000 messages)

### Step 2: Get Twilio Phone Number

1. **In Twilio Console**: Go to Phone Numbers → Buy a Number
2. **Choose**: US number (or your country)
3. **Select**: SMS capable
4. **Buy** (free in trial)
5. **Note the number**: e.g., `+1234567890`

### Step 3: Get Your Credentials

1. **In Twilio Console**: Go to Account → API Keys & Tokens
2. **Copy**:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)

### Step 4: Add Environment Variables in Netlify

1. **Go to Netlify Dashboard**: Your Site → Site Settings → Environment Variables
2. **Add these variables**:

   ```
   TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN = your_auth_token_here
   TWILIO_PHONE_NUMBER = +1234567890
   YOUR_PHONE_NUMBER = +1234567890
   ```

   **Important**: 
   - Use `+` and country code (e.g., `+15551234567` for US)
   - No spaces or dashes
   - Keep these secret!

### Step 5: Install Twilio Package

The `package.json` file is already created. Netlify will automatically install it when you deploy.

**Or manually** (if needed):
```bash
npm install twilio
```

### Step 6: Set Up Webhook for Replies

1. **In Twilio Console**: Go to Phone Numbers → Manage → Active Numbers
2. **Click** your Twilio number
3. **Scroll to**: "Messaging" section
4. **Webhook URL**: 
   ```
   https://your-site-name.netlify.app/.netlify/functions/receive-sms
   ```
   Replace `your-site-name` with your actual Netlify site name
5. **HTTP Method**: POST
6. **Click**: "Save"

### Step 7: Deploy to Netlify

1. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Add SMS messaging"
   git push
   ```

2. **Netlify will auto-deploy** (if connected to Git)
   - Or manually deploy from Netlify dashboard

### Step 8: Test It!

1. **Submit a form** on your website
2. **Check your phone** - you should get an SMS with:
   - Customer name
   - Email
   - Message
   - Reply instructions

3. **Reply from your phone** to the Twilio number
4. **Customer should receive** your reply via email

---

## 📱 How It Works

### When Customer Submits Form:
1. Form submits to Netlify
2. Netlify Function (`send-sms.js`) triggers
3. SMS sent to your phone with customer details
4. You get notified instantly!

### When You Reply:
1. You text back to Twilio number
2. Twilio webhook calls `receive-sms.js`
3. Function extracts customer email
4. Email sent to customer with your reply
5. You get confirmation SMS

---

## 🔧 Troubleshooting

### SMS Not Sending?

1. **Check environment variables** in Netlify:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `YOUR_PHONE_NUMBER`

2. **Check Netlify Function logs**:
   - Site → Functions → View logs
   - Look for errors

3. **Verify phone numbers**:
   - Must include country code: `+1` for US
   - Format: `+15551234567`

### Replies Not Working?

1. **Check webhook URL** in Twilio:
   - Must be: `https://your-site.netlify.app/.netlify/functions/receive-sms`
   - Must be HTTPS

2. **Check Twilio logs**:
   - Twilio Console → Monitor → Logs
   - Look for webhook errors

3. **Test webhook**:
   - Use Twilio's webhook tester
   - Or send a test SMS

---

## 💰 Cost Estimate (Twilio)

- **Sending SMS**: ~$0.0075 per message
- **Receiving SMS**: ~$0.0075 per message  
- **Phone number**: ~$1/month
- **Example**: 100 messages/month = ~$1.75/month

**Free Trial**: $15 credit = ~2000 messages free!

---

## ✅ Quick Start Recommendation

**Start with Email-to-SMS** (Option 1):
- ✅ Free
- ✅ 5-minute setup
- ✅ Works immediately
- ✅ Good for notifications

**Upgrade to Twilio** (Option 2) if:
- You want to reply from phone
- You need two-way messaging
- You want better formatting
- You're okay with small cost

---

## 📞 Need Help?

The functions are already created:
- ✅ `netlify/functions/send-sms.js` - Sends SMS on form submit
- ✅ `netlify/functions/receive-sms.js` - Handles your replies
- ✅ Form updated to trigger SMS

Just follow the setup steps above!
