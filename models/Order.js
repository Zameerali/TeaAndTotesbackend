import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  }],
  total: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  receipt: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }, // Reference to GridFS file
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  contactNumber: { type: String, required: true },
});

export default mongoose.model('Order', orderSchema);