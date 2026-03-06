import express from 'express';
import config from '../src/config/index.js';
import artRoute from '../src/routes/artRoute.js';
import userRoute from '../src/routes/userRoute.js';
import bodyParser from 'body-parser';
import authRoute from '../src/routes/authRoute.js';
import connectToDatabase from '../src/config/database.js';
import logger from '../src/middlewares/logger.js';
import auth from '../src/middlewares/auth.js';
import roleBasedAuth from '../src/middlewares/roleBasedAuth.js';
import { Admin } from '../src/constants/roles.js';
import orderRoute from '../src/routes/orderRoute.js';
import multer from 'multer';
import { connectCloudinary } from '../src/config/cloudinary.js';
import { connect } from 'mongoose';

const app = express();

const upload = multer({storage: multer.memoryStorage()});

connectToDatabase();
connectCloudinary();

app.use(bodyParser.json());
app.use(logger);

app.get('/', (req, res) => {
    res.json({
      appName: config.NAME,
      version: config.VERSION,
      message: 'Welcome to the Art API',
      port: config.PORT,
      App_URL: config.appUrl,
    })
});

app.use('/api/art', artRoute);
app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/order', auth, roleBasedAuth([Admin]), orderRoute);

app.listen(config.PORT, () => {
    console.log(`${config.NAME} is running on port ${config.PORT}`);
});