import mongoose from 'mongoose';
import mainConfig from './index.js';

async function connectToDatabase() {
  try {
    const status = await mongoose.connect(mainConfig.mongoDBURL);

    const hostStr = status.connection?.host ? status.connection.host : 'successfully';
    console.log(`MongoDB connected: ${hostStr}`);
  } catch (error) {
    console.log(error);
  }
}

export default connectToDatabase;
