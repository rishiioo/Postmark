import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// 🌐 Force Node to use Google/Cloudflare DNS (fixes querySrv ECONNREFUSED)
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: process.env.DOTENV_PATH || '.env.local' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
