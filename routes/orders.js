import express from 'express';
import auth from '../middleware/auth.js';
import Order from '../models/Order.js';
import { upload } from '../config/gridfs.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }); // Removed .populate('receipt')
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

router.post('/', auth, upload.single('receipt'), async (req, res) => {
  try {
    console.log('POST /api/orders called');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const { items, total, shippingAddress, contactNumber } = req.body;
    if (!items || !total || !shippingAddress || !contactNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    let parsedItems;
    try {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch (parseErr) {
      return res.status(400).json({ error: 'Invalid items format', details: parseErr.message });
    }
    const order = new Order({
      userId: req.user.id,
      items: parsedItems,
      total,
      shippingAddress,
      contactNumber,
      receipt: req.file ? req.file.id : undefined,
    });
    await order.save();
    // Clear cart after order
    try {
      await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
    } catch (cartErr) {
      console.error('Error clearing cart:', cartErr);
    }
    res.json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Error creating order', details: err.message, stack: err.stack });
  }
});

export default router;