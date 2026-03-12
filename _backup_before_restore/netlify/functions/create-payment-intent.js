// Netlify serverless function to create a Stripe Payment Intent
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amount, currency = 'usd' } = JSON.parse(event.body);

    // Validate amount
    if (!amount || amount < 50) { // Minimum $0.50
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid amount' })
      };
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to create payment intent',
        message: error.message 
      }),
    };
  }
};
