import express from 'express';
import config from './config/index.js';
import artRoute from './routes/artRoute.js';
import userRoute from './routes/userRoute.js';
import authRoute from './routes/authRoute.js';
import connectToDatabase from './config/database.js';
import logger from './middlewares/logger.js';
import auth from './middlewares/auth.js';
import roleBasedAuth from './middlewares/roleBasedAuth.js';
import { Admin } from './constants/roles.js';
import orderRoute from './routes/orderRoute.js';
import multer from 'multer';
import bodyParser from "body-parser";
import { connectCloudinary } from './config/cloudinary.js';
import { version } from 'mongoose';

// log any unhandled errors so Vercel shows stack traces
const app = express();

const upload = multer({storage: multer.memoryStorage()});
connectToDatabase();
connectCloudinary();

app.use(logger);
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({
    message: `Welcome to ${config.NAME} API!`,
    appUrl: config.URL,
    version: config.VERSION,
    status: "Running",
    version: version,
  });
});

app.use('/auth', authRoute);
app.use('/users', auth, roleBasedAuth([Admin]), userRoute);
app.use('/arts', artRoute);
app.use('/orders', auth, orderRoute);

app.listen(config.PORT, () => {
  console.log(`${config.NAME} is running on port ${config.PORT}`);
    console.log(`App URL: ${config.appUrl}`);
});