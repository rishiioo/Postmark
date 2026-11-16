import dns from 'node:dns';
import mongoose from 'mongoose';
import { config } from '../env.js';

// Some networks block SRV lookups (querySrv ECONNREFUSED). Use public DNS for Atlas (mongodb+srv) URIs.
// Set USE_CUSTOM_DNS=false to turn this off.
if (process.env.USE_CUSTOM_DNS !== 'false' && String(config.mongodbUri || '').startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

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
