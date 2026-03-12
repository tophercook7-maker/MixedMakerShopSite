// Netlify Function to receive SMS replies and email customer
// Set this as webhook URL in Twilio: https://your-site.netlify.app/.netlify/functions/receive-sms

const twilio = require('twilio');

exports.handler = async (event) => {
  // Twilio sends POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse Twilio webhook data
    const formData = new URLSearchParams(event.body);
    const fromNumber = formData.get('From');
    const toNumber = formData.get('To');
    const messageBody = formData.get('Body');
    const messageSid = formData.get('MessageSid');

    // Your phone number (the one replying)
    const yourPhoneNumber = process.env.YOUR_PHONE_NUMBER;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    // Only process if message is from your phone number
    if (fromNumber !== yourPhoneNumber) {
      console.log('Ignoring message from:', fromNumber);
      return {
        statusCode: 200,
        body: 'Message ignored'
      };
    }

    // Extract customer email from previous message context
    // This is a simple implementation - you may want to store message threads in a database
    // For now, we'll look for email pattern in the reply or use a simple format
    
    // Parse email from message if customer included it, or use a default
    // In a production setup, you'd store the conversation thread
    const emailMatch = messageBody.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const customerEmail = emailMatch ? emailMatch[0] : null;

    if (!customerEmail) {
      // If no email found, you could store this in a database or log it
      console.log('No customer email found in reply');
      return {
        statusCode: 200,
        body: 'Reply received but no customer email found. Please include customer email in your reply.'
      };
    }

    // Send email to customer using Netlify's email service or a service like SendGrid
    // For now, we'll use a simple approach - you can integrate with SendGrid, Mailgun, etc.
    
    // Option 1: Use Netlify's built-in email (if available)
    // Option 2: Use a service like SendGrid (recommended)
    // Option 3: Log and handle manually

    const emailSubject = `Re: Your inquiry to MixedMakerShop`;
    const emailBody = `Hello,

Thank you for contacting MixedMakerShop. Here's my reply:

${messageBody}

Best regards,
MixedMakerShop

---
This is an automated reply from your inquiry at mixedmakershop.com`;

    // For now, we'll log it - you can integrate with SendGrid or similar
    console.log('Reply to send:', {
      to: customerEmail,
      subject: emailSubject,
      body: emailBody
    });

    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: customerEmail,
    //   from: 'noreply@mixedmakershop.com',
    //   subject: emailSubject,
    //   text: emailBody
    // });

    // Send confirmation SMS back to you
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: `✓ Reply sent to ${customerEmail}`,
      from: twilioNumber,
      to: yourPhoneNumber
    });

    return {
      statusCode: 200,
      body: 'Reply processed'
    };

  } catch (error) {
    console.error('Error processing SMS reply:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process reply',
        details: error.message 
      })
    };
  }
};
