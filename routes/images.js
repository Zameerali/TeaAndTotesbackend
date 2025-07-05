import express from 'express';
import mongoose from 'mongoose';
import { getGridFSBucket } from '../config/gridfs.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const bucket = getGridFSBucket();
    // Validate that id is a valid ObjectId
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid file id' });
    }
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.id));
    downloadStream.on('error', (err) => {
      res.status(404).json({ error: 'Image not found' });
    });
    downloadStream.pipe(res);
  } catch (err) {
    res.status(404).json({ error: 'Image not found' });
  }
});

export default router;