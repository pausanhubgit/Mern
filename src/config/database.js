import mongoose from 'mongoose';
import mainConfig from './index.js';    

async function connectToDatabase() {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        console.log('Already connected to MongoDB');
        return mongoose.connection;
    }

    try {
        if (!mainConfig.mongoDBURL) {
            throw new Error('MONGODB_URL environment variable is not set');
        }
        
        const status = await mongoose.connect(mainConfig.mongoDBURL, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('Connected to MongoDB:', status.connection.host);
        return status;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
}

export default connectToDatabase;