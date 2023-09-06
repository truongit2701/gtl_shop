const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
   {
      name: { type: String, required: true },
      type: { type: String, required: true },
      desc: { type: String, required: true },
      bigDesc: { type: String, required: true },
      price: { type: String, required: true },
      pattern: { type: String, required: true },
      color: { type: String, required: true },
      image: { type: Object, required: true },
   },
   {
      timestamps: true,
   }
);

const Product = mongoose.model('Product', productSchema);

exports.Product = Product;
