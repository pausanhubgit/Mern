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
import { connectCloudinary } from '../src/config/cloudinary.js';
import { version } from 'mongoose';
import e from 'express';

// log any unhandled errors so Vercel shows stack traces
const app = express();

const upload = multer({storage: multer.memoryStorage()});
connectToDatabase().catch(err => console.error('DB connection error:', err));
connectCloudinary().catch(err => console.error('Cloudinary error:', err));

app.use(logger);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: `Welcome to ${config.NAME} API!`,
    appUrl: config.URL,
    version: config.VERSION,
    status: "Running",
    version: version,
  });
});

app.use('/api/auths', authRoute);
app.use('/api/users', auth, userRoute);
app.use('/api/arts', artRoute);
app.use('/api/orders', auth, orderRoute);

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: 'error'
  });
});

// Only listen if not on Vercel
if (!process.env.VERCEL) {
  app.listen(config.PORT, () => {
    console.log(`${config.NAME} is running on port ${config.PORT}`);
    console.log(`App URL: ${config.appUrl}`);
  });
}

export default app;
