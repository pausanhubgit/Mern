import Art from '../models/ArtModel.js';
import UserModel from '../models/UserModel.js';
import uploadFile from '../utils/file.js';
import promptGemini from '../utils/gemini.js';
import { Art_PROMPT } from '../constants/prompt.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';

const createArt = async(data, files, createdBy) => {
// const createArt = async (data, files, createdBy) => {
   const uploadedFiles = await uploadFile(files);
//    const imageUrls = uploadedFiles.map((item) => item?.url);
 const promptMessage = Art_PROMPT.replace('%s', data.title).replace('%s', data.artist).replace('%s', data.category);

const description = data.description??(await promptGemini(promptMessage));
     const createdArt = await Art.create({
      ...data,
      createdBy,
      imageUrls: uploadedFiles.map((item) => item?.url),
      description,
   });

   return createdArt;

//   return promptMessage;
};

const getarts = async(query) => {
   // ensure we have a live connection before querying
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }

   const limit = query.limit || 10;
   const offset = query.offset || 0;
   const sort = JSON.parse(query.sort || '{}');
   const brand = query.brand;
   const category = query.category;
   const min = query.min;
   const max = query.max;
   const name = query.name;
   const createdBy = query.createdBy;

   const Filter = {};

    if(name){
      Filter.name = { $regex: name, $options: 'i' };
   }
   if (min) {
      Filter.price = { $gte: min };
   }
   if(max){
   Filter.price = { ...Filter.price, $lte: max };
   }
   if (brand){
      const branditems = brand.split(',');
      Filter.brand = { $in: branditems };
   }
   if (category) Filter.category = category;
   if(createdBy) Filter.createdBy = createdBy;
   const arts = await Art.find(Filter)
   .sort(sort)
   .limit(limit)
   .skip(offset);
   return arts;
};

// const getarts = async(query) => {
//    const limit = query.limit;
//    const offset = query.offset;
//    const sort = JSON.parse(query.sort || '{}');
//    const brand = query.brand;
//    const category = query.category;
//    const min = query.min;
//    const max = query.max;
//    const name = query.name;
//    if(name){
     
//       Filter.name = { $regex: name, $options: 'i' };
//    }

//    if (min) {
//       Filter.price = { $gte: min };
//    }
//    if(max){
//    Filter.price = { ...Filter.price, $lte: max };
//    }   
  
//    if (brand){
//       const branditems = brand.split(',');
//       filter.brand = { $in: branditems };
//    }
//    if (category) Filter.category = category;
//   const arts = await (await Art.find(Filter))
//   .sort(sort)
//   .limit(limit)
//   .skip(offset);
//   return arts;
    
// };

const getArtById= async (id) => {

const foundArt = await Art.findById(id);
if (!foundArt) {
   throw{
      statusCode: 404,
      message: "Art not found"
   };
}

return foundArt; 
};



const updateArt = async (id, data, files, user) => {
   // resolve user id from param which can be an object or id
   const art = await getArtById(id);
    if(art.createdBy !== user.id && !req.user.roles.includes("Admin")){
    throw {
       statusCode: 403,
       message: "Unauthorized to delete this art",
    }
  }

   const updatedData = data;
   if (files && files.length>0) {
      const uploadedFiles = await uploadFile(files);
      updatedData.imageUrls = uploadedFiles.map((item) => item?.url);
   }

   const updatedArt = await Art.findByIdAndUpdate(id, updatedData, {
      new: true,
   });
   return updatedArt;

};


const deleteArt = async (id,user) => {
   const art = await getArtById(id);
  if (art.createdBy !== user.id && !(user.roles || []).includes("Admin")) {
    throw {
      statusCode: 403,
      message: "Unauthorized to delete this art",
    };
  }
 await Art.findByIdAndDelete(id);

};



export default {getarts,getArtById,createArt,updateArt,deleteArt};



    





// export default {getarts,getArtById, createart,deleteArt, updatedArt};