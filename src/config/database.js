import mongoose from 'mongoose';
import mainConfig from './index.js';    

async function connectToDatabase() {

    try {
    const status = await mongoose.connect(mainConfig.mongoDBURL,);
        console.log('Connected to MongoDB:', status.connection.host);
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}

export default connectToDatabase;