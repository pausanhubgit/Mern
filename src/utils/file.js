import {v2 as cloudinary} from 'cloudinary';
async function uploadFile(files) {
    const  CLOUDINARY_FOLDER = "art-gallery";
    const uploadresults = [];
    if (!files || !Array.isArray(files)) return uploadresults;
    for (const file of files){
        const result = await new Promise((resolve,reject)=>{
            cloudinary.uploader
            .upload_stream({
                folder: CLOUDINARY_FOLDER,
            },(error,data)=>{
                if(error) return reject(error);
                resolve(data);
            })
            .end(file.buffer)
        });
        uploadresults.push(result);
    }
    return uploadresults;
}
export default uploadFile;