import mongoose from 'mongoose';
import mainConfig from './index.js';    

async function connectToDatabase() {
    try {
        const status = await mongoose.connect(mainConfig.mongoDBURL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
            retryWrites: true,
            maxPoolSize: 10,
            minPoolSize: 2,
        });
        console.log('Connected to MongoDB:', status.connection.host);
        return status;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
}

export default connectToDatabase;