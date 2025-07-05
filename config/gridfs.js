import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// GridFS storage setup
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  // Removed deprecated options
  file: (req, file) => ({
    bucketName: 'uploads',
    filename: `${Date.now()}-${file.originalname}`,
  }),
});

// Optional: Event listeners (these are custom GridFsStorage events)
storage.on('connection', () => {
  console.log('✅ GridFS connected');
});

storage.on('connectionFailed', (err) => {
  console.error('❌ GridFS connection failed:', err);
});

// Correct ES module export with multer
export const upload = multer({ storage });

// GridFSBucket getter
export const getGridFSBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error('MongoDB connection not established');
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
};
