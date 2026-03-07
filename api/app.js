import express from 'express';
import config from '../src/config/index.js';
import artRoute from '../src/routes/artRoute.js';
import userRoute from '../src/routes/userRoute.js';
import authRoute from '../src/routes/authRoute.js';
import connectToDatabase from '../src/config/database.js';
import logger from '../src/middlewares/logger.js';
import auth from '../src/middlewares/auth.js';
import roleBasedAuth from '../src/middlewares/roleBasedAuth.js';
import { Admin } from '../src/constants/roles.js';
import orderRoute from '../src/routes/orderRoute.js';
import multer from 'multer';
import bodyParser from "body-parser";
import { connectCloudinary } from '../src/config/cloudinary.js';
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

app.use('/api/auth', authRoute);
app.use('/api/users', auth, roleBasedAuth([Admin]), userRoute);
app.use('/api/arts', artRoute);
app.use('/api/orders', auth, orderRoute);

app.listen(config.PORT, () => {
  console.log(`${config.NAME} is running on port ${config.PORT}`);
    console.log(`App URL: ${config.appUrl}`);
});