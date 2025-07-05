import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { category, featured } = req.query;
  const query = {};
  if (category) query.category = category;
  if (featured) query.featured = featured === 'true';
  try {
    const products = await Product.find(query); // Removed .populate('image')
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Error fetching products', details: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Removed .populate('image')
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Error fetching product', details: err.message });
  }
});

export default router;