import mongoose from 'mongoose';
import User from './src/models/UserModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const users = await User.find({}, 'email username roles').limit(10);
    console.log('--- Users in Database ---');
    console.log(users);
    console.log('-------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
