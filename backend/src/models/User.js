// User model for authentication
// Define user schema with authentication fields:
// - email, password, name
// - isActive, isAdmin
// - authentication tokens, password reset fields
// - createdAt, updatedAt

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
