import {v2 as cloudinary} from 'cloudinary';
import mainConfig from './index.js';

function connectCloudinary() {
    return new Promise((resolve, reject) => {
        try {
            cloudinary.config({
                cloud_name: mainConfig.cloudinay.cloud_name,
                api_key: mainConfig.cloudinay.api_key,
                api_secret: mainConfig.cloudinay.api_secret,
            });
            console.log("Connected to Cloudinary");
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

export { connectCloudinary};