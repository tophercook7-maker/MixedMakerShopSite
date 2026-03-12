// Netlify Function to send SMS when contact form is submitted
// Requires Twilio credentials in Netlify environment variables

const twilio = require('twilio');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
    const yourPhoneNumber = process.env.YOUR_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber || !yourPhoneNumber) {
      console.error('Missing Twilio credentials');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SMS service not configured' })
      };
    }

    // Parse form data from Netlify
    const formData = JSON.parse(event.body);
    const { name, email, topic, message } = formData;

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Format SMS message
    const smsMessage = `📧 New Contact Form Submission

From: ${name}
Email: ${email}
Topic: ${topic || 'Not specified'}

Message:
${message}

Reply to this number to respond to ${email}`;

    // Send SMS
    const twilioMessage = await client.messages.create({
      body: smsMessage,
      from: twilioNumber,
      to: yourPhoneNumber
    });

    console.log('SMS sent successfully:', twilioMessage.sid);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        messageSid: twilioMessage.sid 
      })
    };

  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send SMS',
        details: error.message 
      })
    };
  }
};
