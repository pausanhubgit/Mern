import mongoose from 'mongoose';
import mainConfig from './index.js';    

async function connectToDatabase() {
    // avoid reconnecting if already open
    if (mongoose.connection.readyState === 1) {
        console.log('Already connected to MongoDB');
        return mongoose.connection;
    }

    if (!mainConfig.mongoDBURL) {
        console.error('MONGODB_URL environment variable is not set');
        return; // Don't throw, just log
    }

    // ensure the URL contains the recommended options
    const url = mainConfig.mongoDBURL.includes('?')
        ? mainConfig.mongoDBURL
        : `${mainConfig.mongoDBURL}?retryWrites=true&w=majority`;

    console.log('connecting to', url);

    try {
        const status = await mongoose.connect(url, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('Connected to MongoDB:', status.connection.host);
        return status;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export default connectToDatabase;