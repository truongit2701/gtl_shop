const { Order } = require('../models/order');

const { auth, isUser, isAdmin } = require('../middleware/auth');
const moment = require('moment');

const router = require('express').Router();

router.get('/', isAdmin, async (req, res) => {
   const query = req.query.new;

   try {
      const orders = query
         ? await s.find().sort({ _id: -1 }).limit(4)
         : await Order.find().sort({ _id: -1 });

      res.status(200).send(orders);
   } catch (err) {
      res.status(500).send(err);
   }
});

router.get('/findOne/:id', auth, async (req, res) => {
   try {
      const order = await Order.findById(req.params.id);
      if (req.user.isAdmin || req.user._id === order.userId) {
         return res.status(200).send(order);
      } else {
         return res.status(403).send('Access denied. Not authorized...');
      }
   } catch (err) {
      res.status(500).send(err.message);
   }
});

router.put('/:id', async (req, res) => {
   try {
      const updatedOrder = await Order.findByIdAndUpdate(
         req.params.id,
         {
            $set: req.body,
         },
         { new: true }
      );
      res.status(200).send(updatedOrder);
   } catch (err) {
      res.status(500).send(err);
   }
});

router.get('/stats', isAdmin, async (req, res) => {
   const perviousMonth = moment()
      .month(moment().month() - 1)
      .set('date', 1)
      .format('yyyy-mm-dd hh:mm:ss');

   try {
      const orders = await Order.aggregate([
         {
            $match: { createdAt: { $gte: new Date(perviousMonth) } },
         },
         {
            $project: {
               month: { $month: '$createdAt' },
            },
         },
         {
            $group: {
               _id: '$month',
               total: { $sum: 1 },
            },
         },
      ]);

      res.status(200).send(orders);
   } catch (err) {
      res.status(500).send(err);
   }
});

router.get('/income/stats', isAdmin, async (req, res) => {
   const perviousMonth = moment()
      .month(moment().month() - 1)
      .set('date', 1)
      .format('yyyy-mm-dd hh:mm:ss');

   try {
      const income = await Order.aggregate([
         {
            $match: { createdAt: { $gte: new Date(perviousMonth) } },
         },
         {
            $project: {
               month: { $month: '$createdAt' },
               sale: '$total',
            },
         },
         {
            $group: {
               _id: '$month',
               total: { $sum: '$sale' },
            },
         },
      ]);

      res.status(200).send(income);
   } catch (err) {
      res.status(500).send(err);
   }
});

router.get('/year-sales', isAdmin, async (req, res) => {
   try {
      const data = await Order.find({});
      const income = data.map((item) => {
         const dateTime = new Date(item.createdAt);

         return {
            date: dateTime,
            value: item.subTotal,
         };
      });
      res.status(200).send(income);
   } catch (err) {
      res.status(500).send(err);
   }
});

router.get('/income/stats', isAdmin, async (req, res) => {
   const perviousMonth = moment()
      .month(moment().month() - 1)
      .set('date', 1)
      .format('yyyy-mm-dd hh:mm:ss');

   try {
      const income = await Order.aggregate([
         {
            $match: { createdAt: { $gte: new Date(perviousMonth) } },
         },
         {
            $project: {
               month: { $month: '$createdAt' },
               sale: '$total',
            },
         },
         {
            $group: {
               _id: '$month',
               total: { $sum: '$sale' },
            },
         },
      ]);

      res.status(200).send(income);
   } catch (err) {
      res.status(500).send(err);
   }
});

module.exports = router;
