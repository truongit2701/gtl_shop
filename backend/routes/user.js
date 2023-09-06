const { User } = require('../models/user');

const { auth, isUser, isAdmin } = require('../middleware/auth');
const moment = require('moment');

const router = require('express').Router();

router.get('/', isAdmin, async (req, res) => {
   try {
      const users = await User.find();
      return res.status(200).send(users);
   } catch (err) {
      res.status(500).send(err);
   }
});

router.post('/assignAdmin', isAdmin, async (req, res) => {
   try {
      console.log(req._id);
      return;
      const user = await User.findById(req);
      const userUpdated = await User.findByIdAndUpdate(req.user._id, {
         isAdmin: !user.isAdmin,
      });

      return res.status(200).send(userUpdated);
   } catch (err) {
      console.log('err', err);
      res.status(500).send(err);
   }
});

router.delete('/:id', isAdmin, async (req, res) => {
   try {
      const users = await User.findByIdAndDelete(req.params.id);
      return res.status(200).send(users);
   } catch (err) {
      res.status(500).send(err);
   }
});

module.exports = router;
