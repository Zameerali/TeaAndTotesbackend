import dotenv from 'dotenv';
dotenv.config(); // Railway uses dashboard variables
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';

mongoose.set('strictQuery', true); // From prior conversation

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173', // <-- add this line
    'https://tea-and-totes.vercel.app'
  ],
  credentials: true,
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/admin/env', (req, res) => {
  res.json({ mongoUri: process.env.MONGO_URI, jwtSecret: process.env.JWT_SECRET, port: process.env.PORT });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));