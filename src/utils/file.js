import {v2 as cloudinary} from 'cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

async function uploadFile(files) {
    const CLOUDINARY_FOLDER = "art-gallery";
    const uploadresults = [];
    if (!files || !Array.isArray(files)) return uploadresults;

    // Ensure uploads directory exists for temp storage
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (const file of files) {
        const mime = file.mimetype?.toLowerCase() || "";
        let resource_type = "auto";
        
        if (mime.startsWith("video/")) resource_type = "video";
        else if (mime.startsWith("audio/")) resource_type = "video"; // Cloudinary treats audio as type 'video' for most endpoints
        else if (mime.startsWith("image/")) resource_type = "image";

        let result;
        // Logic to handle larger files (> 5MB) or videos specifically via upload_large
        if (resource_type === "video" || file.size > 5 * 1024 * 1024) {
            const tempFileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`;
            const tempFilePath = path.join(uploadsDir, tempFileName);
            
            await writeFileAsync(tempFilePath, file.buffer);
            
            try {
                // Use upload_large for better stability with large files
                result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_large(tempFilePath, {
                        folder: CLOUDINARY_FOLDER,
                        resource_type: resource_type,
                        chunk_size: 6000000, // 6MB chunks
                    }, (error, data) => {
                        if (error) return reject(error);
                        resolve(data);
                    });
                });
            } catch (err) {
                console.error("Cloudinary upload_large error:", err);
                // Handle specific Cloudinary errors
                if (err.message && err.message.includes("too large")) {
                    throw {
                        statusCode: 400,
                        message: "Requested resource too large. Max: 104,857,600 bytes (100MB). Your file exceeds Cloudinary's free tier limit for videos."
                    };
                }
                throw err;
            } finally {
                // Clean up the temp file
                if (fs.existsSync(tempFilePath)) {
                    await unlinkAsync(tempFilePath).catch(e => console.error("Temp file cleanup failed:", e));
                }
            }
        } else {
            // Standard upload_stream for smaller files
            result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: CLOUDINARY_FOLDER,
                        resource_type: resource_type,
                    },
                    (error, data) => {
                        if (error) return reject(error);
                        resolve(data);
                    }
                );

                const bufferStream = new Readable();
                bufferStream.push(file.buffer);
                bufferStream.push(null);
                bufferStream.pipe(stream);
            });
        }
        uploadresults.push({ ...result, fieldname: file.fieldname });
    }
    return uploadresults;
}

export default uploadFile;