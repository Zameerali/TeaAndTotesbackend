import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
});

export default mongoose.model('User', userSchema);