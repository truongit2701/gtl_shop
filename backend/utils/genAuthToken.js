const jwt = require('jsonwebtoken');

const genAuthToken = (user) => {
   const serectKey = process.env.JWT_SECRET_KEY;
   const token = jwt.sign(
      {
         _id: user._id,
         username: user.username,
         email: user.email,
         isAdmin: user.isAdmin,
      },
      serectKey
   );

   return token;
};

module.exports = genAuthToken;
