const express = require('express');
const cloudinary = require('../utils/cloudinary');
const { Product } = require('../models/product');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

// create product

router.post('/', isAdmin, async (req, res) => {
   const { name, type, desc, price, image, bigDesc, color, pattern } = req.body;
   try {
      if (image) {
         const uploadRes = await cloudinary.uploader.upload(image, {
            upload_preset: 'store',
         });
         if (uploadRes) {
            const product = new Product({
               name,
               type,
               desc,
               price,
               bigDesc,
               pattern,
               color,
               image: uploadRes,
            });

            const savedProduct = await product.save();
            res.status(200).send(savedProduct);
         }
      }
   } catch (err) {
      res.status(500).send(err);
   }
});

router.get('/find/:id', async (req, res) => {
   try {
      const product = await Product.findById(req.params.id);
      res.status(200).send(product);
   } catch (err) {
      res.status(500).send(err);
   }
});

router.delete('/:id', isAdmin, async (req, res) => {
   try {
      const product = await Product.findById(req.params.id);

      if (!product) res.status(404).send('Product not found...');

      if (product.image.public_id) {
         const destroyResponse = await cloudinary.uploader.destroy(
            product.image.public_id
         );

         if (destroyResponse) {
            const deletedProduct = await Product.findByIdAndDelete(
               req.params.id
            );

            res.status(200).send(deletedProduct);
         }
      } else {
         console.log('Action terminated. Failed to deleted product image');
      }
   } catch (err) {
      res.status(500).send(err);
   }
});

router.put('/:id', isAdmin, async (req, res) => {
   if (req.body.productImg) {
      try {
         const destroyResponse = await cloudinary.uploader.destroy(
            req.body.product.image.public_id
         );
         if (destroyResponse) {
            const updatedResponse = await cloudinary.uploader.upload(
               req.body.productImg,
               {
                  upload_preset: 'store',
               }
            );
            if (updatedResponse) {
               const updatedProduct = await Product.findByIdAndUpdate(
                  req.params.id,
                  {
                     $set: {
                        ...req.body.product,
                        image: updatedResponse,
                     },
                  },
                  {
                     new: true,
                  }
               );

               res.status(200).send(updatedProduct);
            }
         }
      } catch (err) {
         res.status(500).send(err);
      }
   } else {
      try {
         const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
               $set: {
                  ...req.body.product,
               },
            },
            {
               new: true,
            }
         );
         res.status(200).send(updatedProduct);
      } catch (err) {
         res.status(500).send(err);
      }
   }
});

router.get('/', async (req, res) => {
   try {
      const products = await Product.find();
      res.status(200).send(products);
   } catch (err) {
      res.status(500).send(err);
   }
});

module.exports = router;
