import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }, // Reference to GridFS file
  category: { type: String, required: true },
  featured: { type: Boolean, default: false },
});

export default mongoose.model('Product', productSchema);