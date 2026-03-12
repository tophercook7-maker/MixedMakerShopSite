// Netlify serverless function to confirm a Stripe payment and send order email
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
    const { paymentIntentId, orderData } = JSON.parse(event.body);

    // Verify the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Payment not completed',
          status: paymentIntent.status 
        }),
      };
    }

    // Payment succeeded - submit order to Netlify Forms
    // Use the site URL from environment or construct from headers
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://mixedmakershop.com';
    
    const formData = new URLSearchParams();
    formData.append('form-name', 'checkout');
    formData.append('name', orderData.name);
    formData.append('email', orderData.email);
    formData.append('phone', orderData.phone || '');
    formData.append('address', orderData.address);
    formData.append('city', orderData.city);
    formData.append('state', orderData.state);
    formData.append('zip', orderData.zip);
    formData.append('country', orderData.country);
    formData.append('notes', orderData.notes || '');
    formData.append('order-items', orderData.orderItems);
    formData.append('order-subtotal', orderData.subtotal);
    formData.append('order-shipping', orderData.shipping);
    formData.append('order-total', orderData.total);
    formData.append('payment-intent-id', paymentIntentId);
    formData.append('payment-status', 'paid');
    formData.append('order-summary', orderData.orderSummary);

    // Submit to Netlify Forms
    try {
      const netlifyResponse = await fetch(`${siteUrl}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!netlifyResponse.ok) {
        console.error('Netlify form submission failed:', netlifyResponse.status, await netlifyResponse.text());
        // Payment succeeded but form submission failed - we still return success
        // since payment was processed. The order details are logged in Stripe.
      }
    } catch (formError) {
      console.error('Error submitting to Netlify Forms:', formError);
      // Payment succeeded, so we continue even if form submission fails
      // Order details are available in Stripe payment metadata
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from cents
      }),
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to confirm payment',
        message: error.message 
      }),
    };
  }
};
