import mongoose from 'mongoose';
import { config } from '../env.js';

const connectDB = async () => {
  if (!config.mongodbUri) {
    console.error('MONGODB_URI is missing. Copy backend/.env.example to backend/.env and fill it in.');
    process.exit(1);
  }
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;
