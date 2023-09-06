const express = require('express');
const Stripe = require('stripe');
const dotenv = require('dotenv');
const { Order } = require('../models/order');

dotenv.config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
   const customer = await stripe.customers.create({
      metadata: {
         userId: req.body.userId,
      },
   });
   const lineItems = req.body.cartItems.map((cartItem) => {
      return {
         price_data: {
            currency: 'vnd',
            product_data: {
               name: cartItem.name,
               images: [cartItem.image.url],
               description: cartItem.desc,
               metadata: {
                  id: cartItem.id,
               },
            },
            unit_amount: cartItem.price,
         },
         quantity: cartItem.cartQuantity,
      };
   });
   const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
   });

   res.send({ url: session.url });
});

// create order

const createOrder = async (customer, data, lineItems) => {
   const newOrder = new Order({
      userId: customer.metadata.userId,
      customerId: data.customer,
      paymentIntentId: data.payment_intent,
      products: lineItems.data,
      subTotal: data.amount_subtotal,
      total: data.amount_total,
      shipping: data.customer_details,
      payment_status: data.payment_status,
   });

   try {
      const saveOrder = await newOrder.save();
   } catch (err) {
      console.log(err);
   }
};

// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;
// endpointSecx`2c7464d5fa6439238e106d5cb43fb68860c4ec9004a4620d8e1884b621';

router.post(
   '/webhook',
   express.raw({ type: 'application/json' }),
   (req, res) => {
      const sig = req.headers['stripe-signature'];
      let data;
      let eventType;
      if (endpointSecret) {
         let event;

         try {
            event = stripe.webhooks.constructEvent(
               req.body,
               sig,
               endpointSecret
            );
            console.log('webhook verified.');
         } catch (err) {
            console.log(`Webhook Error: ${err.message}`);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
         }
         data = event.data.object;
         eventType = event.type;
      } else {
         data = req.body.data.object;
         eventType = req.body.type;
      }

      // Handle the event
      if (eventType === 'checkout.session.completed') {
         stripe.customers
            .retrieve(data.customer)
            .then((customer) => {
               stripe.checkout.sessions.listLineItems(
                  data.id,
                  {},
                  function (err, lineItems) {
                     createOrder(customer, data, lineItems);
                  }
               );
            })
            .catch((err) => {
               console.log(err.message);
            });
      }

      // Return a 200 res to acknowledge receipt of the event
      res.send().end();
   }
);

module.exports = router;
