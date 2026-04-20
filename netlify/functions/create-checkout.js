const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { lineItems } = JSON.parse(event.body);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems.map(({ priceId, quantity }) => ({ price: priceId, quantity })),
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    success_url: `${process.env.URL}/success.html`,
    cancel_url: `${process.env.URL}/#shop`,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ url: session.url }),
  };
};
