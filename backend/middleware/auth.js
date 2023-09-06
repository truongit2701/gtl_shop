const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
   const token = req.header('x-auth-token');
   console.log(token);
   if (!token)
      return res.status(401).send('Access denied. Not authenticatedddd...');

   try {
      const secret_key = process.env.JWT_SECRET_KEY;
      const user = jwt.verify(token, secret_key);

      req.user = user;

      next();
   } catch (err) {
      return res.status(401).send('Access denied. Invalid...');
   }
};

const isUser = (req, res, next) => {
   auth(req, res, () => {
      if (req.user._id === req.params.id || req.user.isAdmin) {
         next();
      } else {
         res.status(403).send('Access denined. Not authorized');
      }
   });
};

const isAdmin = (req, res, next) => {
   console.log(req.user);
   auth(req, res, () => {
      if (req.user.isAdmin) {
         next();
      } else {
         res.status(403).send('Access denied. Invalid auth token...');
      }
   });
};

module.exports = { auth, isAdmin, isUser };
