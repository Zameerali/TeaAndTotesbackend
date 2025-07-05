import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import auth, { adminAuth } from '../middleware/auth.js';
import { upload } from '../config/gridfs.js';

const router = express.Router();

// Add a product with image upload
router.post('/products', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('POST /api/admin/products called');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }
    if (!req.file.id) {
      console.error('File upload failed, req.file:', req.file);
      return res.status(500).json({ error: 'File upload failed: file id is undefined', file: req.file });
    }
    const { name, price, description, category, featured } = req.body;
    if (!name || !price || !description || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const product = new Product({
      name,
      price: parseFloat(price),
      description,
      image: req.file.id,
      category,
      featured: featured === 'true',
    });
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message, stack: err.stack });
  }
});

// Update a product (image optional)
router.put('/products/:id', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category, featured } = req.body;
    const updateData = { 
      name, 
      price: parseFloat(price), 
      description, 
      category, 
      featured: featured === 'true' 
    };
    if (req.file) updateData.image = req.file.id;
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// Delete a product
router.delete('/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// Get all orders
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email'); // Removed .populate('receipt')
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Error fetching orders', details: err.message });
  }
});

// Update order status
router.put('/orders/:id', auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
});

export default router;