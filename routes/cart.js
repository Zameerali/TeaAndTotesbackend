import express from 'express';
import auth from '../middleware/auth.js';
import Cart from '../models/Cart.js';

const router = express.Router();

// Helper to attach image to each item, handling missing products
function mapItemsWithImage(items) {
  return items.map(item => {
    // item.productId may be null if product was deleted
    let image = null;
    if (item.productId && typeof item.productId === 'object' && 'image' in item.productId) {
      image = item.productId.image;
    }
    return {
      ...item.toObject(),
      image,
    };
  });
}

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: 'items.productId',
      select: 'image',
    });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
    }
    const itemsWithImage = mapItemsWithImage(cart.items);
    res.json({ ...cart.toObject(), items: itemsWithImage });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching cart' });
  }
});

// ...existing code...

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, name, price, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, quantity });
    }
    await cart.save();
    // Populate product fields for the response
    await cart.populate({ path: 'items.productId', select: 'image name price' });
    const itemsWithImage = cart.items.map(item => ({
      ...item.toObject(),
      image: item.productId && item.productId.image ? item.productId.image : null,
      name: item.productId && item.productId.name ? item.productId.name : item.name,
      price: item.productId && item.productId.price ? item.productId.price : item.price,
    }));
    res.json({ ...cart.toObject(), items: itemsWithImage });
  } catch (err) {
    res.status(400).json({ error: 'Failed to add item to cart' });
  }
});

// Update item quantity
router.put('/update', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      if (quantity < 1) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
      await cart.populate({ path: 'items.productId', select: 'image name price' });
      const itemsWithImage = cart.items.map(item => ({
        ...item.toObject(),
        image: item.productId && item.productId.image ? item.productId.image : null,
        name: item.productId && item.productId.name ? item.productId.name : item.name,
        price: item.productId && item.productId.price ? item.productId.price : item.price,
      }));
      res.json({ ...cart.toObject(), items: itemsWithImage });
    } else {
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (err) {
    res.status(400).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.items = cart.items.filter((item) => item.productId.toString() !== req.params.productId);
    await cart.save();
    await cart.populate({ path: 'items.productId', select: 'image name price' });
    const itemsWithImage = cart.items.map(item => ({
      ...item.toObject(),
      image: item.productId && item.productId.image ? item.productId.image : null,
      name: item.productId && item.productId.name ? item.productId.name : item.name,
      price: item.productId && item.productId.price ? item.productId.price : item.price,
    }));
    res.json({ ...cart.toObject(), items: itemsWithImage });
  } catch (err) {
    res.status(400).json({ error: 'Failed to remove item' });
  }
});

// ...existing code...
export default router;