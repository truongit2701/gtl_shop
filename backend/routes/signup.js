const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const genAuthToken = require('../utils/genAuthToken');

const { User } = require('../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
   const schema = Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().min(3).max(200).required().email(),
      password: Joi.string().min(3).max(1024).required(),
   });

   const { error } = schema.validate(req.body);
   if (error) return res.status(400).send(error.details[0].message);

   let user =
      (await User.findOne({ email: req.body.email })) ||
      (await User.findOne({ username: req.body.username }));

   if (user) return res.status(400).send('user already exits');

   user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
   });

   const salt = await bcrypt.genSalt(10);
   user.password = await bcrypt.hash(user.password, salt);
   user = await user.save();

   const token = genAuthToken(user);

   res.send(token);
});

module.exports = router;
