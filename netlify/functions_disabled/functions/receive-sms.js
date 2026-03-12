// Netlify Function to receive SMS webhooks from Twilio
// Set this as webhook URL in Twilio: https://your-site.netlify.app/.netlify/functions/receive-sms

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method not allowed'
    };
  }

  try {
    const params = new URLSearchParams(event.body || '');
    const from = params.get('From');
    const body = params.get('Body');

    const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thanks! We got your message.</Message></Response>';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/xml'
      },
      body: twiml
    };
  } catch (error) {
    console.error('Error processing SMS:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
};
