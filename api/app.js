import express from 'express';
import config from '../src/config/index.js';
import artRoute from '../src/routes/artRoute.js';
import userRoute from '../src/routes/userRoute.js';
import bodyParser from 'body-parser';
import authRoute from '../src/routes/authRoute.js';
import connectToDatabase from '../src/config/database.js';
import logger from '../src/middlewares/logger.js';
import auth from '../src/middlewares/auth.js';
import orderRoute from '../src/routes/orderRoute.js';
import multer from 'multer';
import { connectCloudinary } from '../src/config/cloudinary.js';

const app = express();

// Initialize async setup
(async () => {
  try {
    connectCloudinary();
    await connectToDatabase();
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Initialization error:', error.message);
    process.exit(1);
  }
})();












const upload = multer({ storage: multer.memoryStorage() });
app.use(bodyParser.json());

app.use(logger);



app.get('/',(req,res)=>{
   
    res.status(201).json({
        message: "Hello World",
        status: "success",
        version: config.VERSION,
        name: config.NAME,
        feature: config.Feature_toggle_enabletestFeature? "Test Feature is Enabled":"Test Feature is Disabled",


    });
});

app.use('/api/auth', authRoute);
app.use('/art',  upload.array('image', 5),  artRoute);
app.use("/user",auth,upload.single('image'), userRoute);
app.use('/order', orderRoute);







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

