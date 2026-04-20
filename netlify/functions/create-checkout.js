const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { lineItems } = JSON.parse(event.body);

    if (!lineItems || !lineItems.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No line items' }) };
    }

    const baseUrl = process.env.URL || `https://${event.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems.map(({ priceId, quantity }) => ({ price: priceId, quantity })),
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      success_url: `${baseUrl}/success.html`,
      cancel_url: `${baseUrl}/#shop`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
