import mongoose from 'mongoose';
import mainConfig from './index.js';

async function connectToDatabase() {
  try {
    const status = await mongoose.connect(mainConfig.mongoDBURL);

    console.log(`MongoDB connected: ${status.connection.host}`);
  } catch (error) {
    console.log(error);
  }
}

export default connectToDatabase;
