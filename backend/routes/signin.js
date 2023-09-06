const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const genAuthToken = require('../utils/genAuthToken');

const { User } = require('../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
   const schema = Joi.object({
      username: Joi.string().min(3).max(30).required(),
      password: Joi.string().min(3).max(1024).required(),
   });

   const { error } = schema.validate(req.body);

   if (error) return res.status(400).send(error.details[0].message);

   let user = await User.findOne({ username: req.body.username });
   if (!user) return res.status(400).send('Invalid username or password');

   const isValid = await bcrypt.compare(req.body.password, user.password);

   if (!isValid) return res.status(400).send('Invalid username or password');

   const token = genAuthToken(user);
   res.send(token);
});

module.exports = router;
