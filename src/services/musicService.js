import Music from '../models/MusicModel.js';
import UserModel from '../models/UserModel.js';
import uploadFile from '../utils/file.js';
import promptGemini from '../utils/gemini.js';
import { Art_PROMPT } from '../constants/prompt.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';

const createMusic = async(data, files, createdBy) => {
   // ensure DB connection
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const uploadedFiles = await uploadFile(files);
   const promptMessage = Art_PROMPT.replace('%s', data.title).replace('%s', data.artist).replace('%s', data.category);

   const description = data.description ?? (await promptGemini(promptMessage));
   const createdMusic = await Music.create({
      ...data,
      createdBy: createdBy._id,
      audioUrls: uploadedFiles.map((item) => item?.url),
      description,
   });

   // Increment user's totalMusics
   await UserModel.findByIdAndUpdate(createdBy._id, { $inc: { totalMusics: 1 } });

   return createdMusic;
};

const getMusics = async(query) => {
   // ensure we have a live connection before querying
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }

   const limit = query.limit || 10;
   const offset = query.offset || 0;
   const sort = JSON.parse(query.sort || '{}');
   const brand = query.brand;
   const category = query.category;
   const subcategory = query.subcategory;
   const min = query.min;
   const max = query.max;
   const name = query.name;
   const createdBy = query.createdBy;

   const Filter = {};

    if(name){
      Filter.title = { $regex: name, $options: 'i' };
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
   if (subcategory) Filter.subcategory = subcategory;
   if(createdBy) Filter.createdBy = createdBy;
   const musics = await Music.find(Filter)
   .sort(sort)
   .limit(limit)
   .skip(offset);
   return musics;
};

const getMusicById = async (id) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }

   const foundMusic = await Music.findById(id);
   if (!foundMusic) {
      throw {
         statusCode: 404,
         message: "Music not found",
      };
   }

   return foundMusic;
};

const updateMusic = async (id, data, files, user) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const music = await getMusicById(id);
   if (music.createdBy.toString() !== user._id && !user.roles.includes("admin")) {
      throw {
         statusCode: 403,
         message: "Unauthorized to update this music",
      };
   }

   const updatedData = data;
   if (files && files.length>0) {
      const uploadedFiles = await uploadFile(files);
      updatedData.audioUrls = uploadedFiles.map((item) => item?.url);
   }

   const updatedMusic = await Music.findByIdAndUpdate(id, updatedData, {
      new: true,
   });
   return updatedMusic;
};

const deleteMusic = async (id, user) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const music = await getMusicById(id);
   if (music.createdBy.toString() !== user._id && !user.roles.includes("admin")) {
      throw {
         statusCode: 403,
         message: "Unauthorized to delete this music",
      };
   }
   await Music.findByIdAndDelete(id);
   // Decrement user's totalMusics
   await UserModel.findByIdAndUpdate(user._id, { $inc: { totalMusics: -1 } });
};

const reactToMusic = async (id, user) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const music = await getMusicById(id);
   await Music.findByIdAndUpdate(id, { $inc: { reactions: 1 } });
   // Increment user's totalReactions
   await UserModel.findByIdAndUpdate(music.createdBy, { $inc: { totalReactions: 1 } });
   return { message: "Reaction added" };
};

const viewMusic = async (id) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   await Music.findByIdAndUpdate(id, { $inc: { views: 1 } });
   return { message: "View counted" };
};

export default {getMusics, getMusicById, createMusic, updateMusic, deleteMusic, reactToMusic, viewMusic};