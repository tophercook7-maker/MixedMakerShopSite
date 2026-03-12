# Netlify Forms Setup Instructions

## ✅ What's Been Configured

1. **Form HTML Updated**: The contact form now has:
   - `data-netlify="true"` attribute
   - `data-netlify-honeypot="bot-field"` for spam protection
   - `name="contact"` for form identification
   - Required fields marked with `required` attribute
   - Hidden honeypot field for spam protection

2. **netlify.toml Created**: Configuration file for Netlify deployment

3. **Form Submission Handler**: JavaScript added to handle form submission with success/error messages

## 📧 Setting Up Email Notifications

### Step 1: Deploy to Netlify

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Deploy your site

### Step 2: Configure Email Notifications in Netlify

1. Go to your Netlify dashboard
2. Navigate to **Site settings** → **Forms** → **Form notifications**
3. Click **Add notification**
4. Choose **Email notification**
5. Enter your email address where you want to receive submissions
6. Customize the email subject (optional):
   ```
   New Contact Form Submission from MixedMakerShop
   ```
7. Save the notification

### Step 3: Test the Form

1. Submit a test form on your live site
2. Check your email for the submission
3. Check the Netlify dashboard under **Forms** → **Submissions** to see all form data

## 🎨 Customizing Email Notifications

You can customize the email notifications in Netlify:

1. Go to **Site settings** → **Forms** → **Form notifications**
2. Edit your email notification
3. You can customize:
   - Email subject
   - Email body (template)
   - Reply-to address

## 📋 Form Fields

The form captures:
- **name**: User's name (required)
- **email**: User's email (required)
- **topic**: What the inquiry is about (dropdown)
- **message**: Detailed message (required)
- **bot-field**: Hidden spam protection field

## 🔒 Spam Protection

The form includes:
- Honeypot field (hidden bot-field)
- Netlify's built-in spam detection
- Required field validation

## 🚀 Alternative: Email Service Integration

If you want more control, you can also integrate with:
- **SendGrid**: For transactional emails
- **Mailgun**: For email delivery
- **AWS SES**: For high-volume emails

These would require additional configuration via Netlify Functions.

## 📝 Notes

- Form submissions are stored in Netlify's dashboard
- You can view/export submissions from the Netlify dashboard
- Free Netlify plan includes 100 form submissions per month
- Form data is automatically formatted in the email notification

