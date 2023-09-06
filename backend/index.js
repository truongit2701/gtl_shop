const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const signup = require('./routes/signup');
const signin = require('./routes/signin');
const product = require('./routes/product');
const stripe = require('./routes/stripe');
const order = require('./routes/order');
const user = require('./routes/user');
const { default: mongoose } = require('mongoose');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/signup', signup);
app.use('/api/signin', signin);
app.use('/api/product', product);
app.use('/api/stripe', stripe);
app.use('/api/order', order);
app.use('/api/user', user);

app.get('/', (req, res) => {
   res.send('welcome to our onlineshop');
});

app.listen(process.env.PORT, () => {
   console.log(`app listening on ${process.env.PORT}`);
});

mongoose
   .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   })
   .then(() => {
      console.log('MongoDb connection successful!');
   })
   .catch((err) => {
      console.log('MongoDb connection failed!', err.message);
   });
