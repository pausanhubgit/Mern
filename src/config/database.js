import mongoose from 'mongoose';
import mainConfig from './index.js';

async function connectToDatabase() {
  try {
    const status = await mongoose.connect(mainConfig.mongoDBURL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4 to avoid potential IPv6 DNS resolution issues
    });

    const hostStr = status.connection?.host ? status.connection.host : 'successfully';
    console.log(`MongoDB connected: ${hostStr}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.syscall === 'querySrv') {
        console.warn('⚠️ DNS Resolution issue detected. Please check your internet connection or IP whitelist.');
    }
  }
}

export default connectToDatabase;
