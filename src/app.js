import express from 'express';
import config from './config/index.js';
import artRoute from './routes/artRoute.js';
import userRoute from './routes/userRoute.js';
import bodyParser from 'body-parser';
import authRoute from './routes/authRoute.js';
import connectToDatabase from './config/database.js';
import logger from './middlewares/logger.js';
import auth from './middlewares/auth.js';
import roleBasedAuth from './middlewares/roleBasedAuth.js';
import { Admin } from './constants/roles.js';
import orderRoute from './routes/orderRoute.js';
import multer from 'multer';
import { connectCloudinary } from './config/cloudinary.js';










const app = express();
connectCloudinary();

connectToDatabase();
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


app.listen(config.PORT,()=>{
    console.log(`Server is running on port ${config.PORT}`);
});

