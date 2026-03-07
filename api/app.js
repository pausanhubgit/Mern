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

const app = express();
const upload = multer({storage: multer.memoryStorage()});

// Connect to database and cloudinary
connectToDatabase().catch(err => console.error('DB connection error:', err));
connectCloudinary().catch(err => console.error('Cloudinary error:', err));

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
  });
}

export default app;