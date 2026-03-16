import {v2 as cloudinary} from 'cloudinary';
async function uploadFile(files) {
    const CLOUDINARY_FOLDER = "art-gallery";
    const uploadresults = [];
    if (!files || !Array.isArray(files)) return uploadresults;

    for (const file of files) {
        const mime = file.mimetype?.toLowerCase() || "";
        const resourceType = mime.startsWith("image/")
            ? "image"
            : mime.startsWith("video/") || mime.startsWith("audio/") || mime.includes("mp4")
            ? "video"
            : "raw"; // raw allows arbitrary binary data when type is unknown

        console.log(`uploadFile: field=${file.fieldname} mime=${mime} size=${file.size} resource_type=${resourceType}`);

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: CLOUDINARY_FOLDER,
                        resource_type: resourceType,
                    },
                    (error, data) => {
                        if (error) return reject(error);
                        resolve(data);
                    }
                )
                .end(file.buffer);
        });
        uploadresults.push(result);
    }
    return uploadresults;
}
export default uploadFile;