import mongoose from "mongoose";

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URL || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URL or MONGODB_URI environment variable is required');
  }

  try {
    console.log('Connecting to MongoDB:', uri);
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Connected');
    return db.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

export default connectToDatabase;