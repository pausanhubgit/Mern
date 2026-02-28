import dotenv from 'dotenv';


dotenv.config();


const mainConfig = {
    appUrl : process.env.APP_URL || "",
    mongoDBURL : process.env.MONGODB_URL||"",
    NAME: process.env.NAME || "Default App Name",
    VERSION: process.env.version || "0.0.0",
    PORT: process.env.PORT || 5000,
    Feature_toggle_enabletestFeature: parseInt(process.env.Feature_toggle_enabletestFeature) || 0,
    jwtSecret: process.env.JWT_SECRET ||"",
    cloudinay:{
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
    },
    khalti:{
        apiKey: process.env.KHALTI_API_KEY || "",
        apiUrl: process.env.KHALTI_API_URL || "",
        returnUrl: process.env.KHALTI_RETURN_URL || "",
    },
    emailApiKey: process.env.EMAIL_API_KEY || "",
    twilio:{
        sid: process.env.TWILIO_SID || "",
        authToken: process.env.TWILIO_AUTH_TOKEN || "",
    },
    gemini:{
        url: process.env.GEMINI_URL || "",
        apiKey: process.env.GEMINI_API_KEY || "",
    }

};
export default mainConfig;

