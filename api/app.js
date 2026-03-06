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

// Initialize Cloudinary
try {
  connectCloudinary();
} catch (error) {
  console.error('Cloudinary initialization failed:', error.message);
}

const upload = multer({ storage: multer.memoryStorage() });
app.use(bodyParser.json());
app.use(logger);

// Initialize database with timeout and error handling
let dbConnected = false;
const initializeDatabase = async () => {
  if (dbConnected) return;
  try {
    await Promise.race([
      connectToDatabase(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 30000)
      )
    ]);
    dbConnected = true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    dbConnected = false;
  }
};

// Attempt to connect on startup but don't block
initializeDatabase().catch(err => console.error('Initial DB connection failed:', err.message));

// Middleware to ensure DB connection for protected routes
const ensureDbConnected = async (req, res, next) => {
  if (!dbConnected) {
    try {
      await initializeDatabase();
    } catch (error) {
      return res.status(503).json({ 
        message: 'Database service unavailable', 
        status: 'error' 
      });
    }
  }
  next();
};

app.get('/',(req,res)=>{
   
    res.status(201).json({
        message: "Hello World",
        status: "success",
        version: config.VERSION,
        name: config.NAME,
        feature: config.Feature_toggle_enabletestFeature? "Test Feature is Enabled":"Test Feature is Disabled",


    });
});

app.use('/api/auth', ensureDbConnected, authRoute);
app.use('/art', ensureDbConnected, upload.array('image', 5), artRoute);
app.use("/user", ensureDbConnected, auth, upload.single('image'), userRoute);
app.use('/order', ensureDbConnected, orderRoute);

// global error handler (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong',
  });
});





// app.get('/Arts', (req, res) => {
//    const art= fs.readFileSync('./src/data/art.json', 'utf8');
             
//    const data=JSON.parse(art);
//    res.json(data); 
//     });


// app.get('/artists', (req, res) => {
//    const artist= fs.readFileSync('./src/data/artist.json', 'utf8');
//    const data=JSON.parse(artist);
//    res.json(data);
// });


// app.listen(config.PORT,()=>{
//     console.log(`Server is running on port ${config.PORT}`);
// });

export default app;

