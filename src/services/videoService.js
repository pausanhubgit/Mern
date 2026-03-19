import Video from '../models/VideoModel.js';
import UserModel from '../models/UserModel.js';
import uploadFile from '../utils/file.js';
import promptGemini from '../utils/gemini.js';
import { Art_PROMPT } from '../constants/prompt.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';

const createVideo = async(data, files, createdBy) => {
   // ensure DB connection
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const uploadedFiles = await uploadFile(files);
   const promptMessage = Art_PROMPT.replace('%s', data.title).replace('%s', data.artist).replace('%s', data.category);

   const description = data.description ?? (await promptGemini(promptMessage));
   const createdVideo = await Video.create({
      ...data,
      createdBy: createdBy._id,
      videoUrls: uploadedFiles.map((item) => item?.url),
      description,
   });

   // Increment user's totalVideos
   await UserModel.findByIdAndUpdate(createdBy._id, { $inc: { totalVideos: 1 } });

   return createdVideo;
};

const getVideos = async(query) => {
   // ensure we have a live connection before querying
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }

   const limit = query.limit || 10;
   const offset = query.offset || 0;
   let sort = {};
   try {
       sort = JSON.parse(query.sort || '{}');
   } catch (e) {
       sort = {};
   }
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
   const videos = await Video.find(Filter)
   .sort(sort)
   .limit(limit)
   .skip(offset);
   return videos;
};

const getVideoById = async (id) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }

   const foundVideo = await Video.findById(id);
   if (!foundVideo) {
      throw {
         statusCode: 404,
         message: "Video not found",
      };
   }

   return foundVideo;
};

const updateVideo = async (id, data, files, user) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const video = await getVideoById(id);
   if (video.createdBy.toString() !== user._id && !user.roles.includes("admin")) {
      throw {
         statusCode: 403,
         message: "Unauthorized to update this video",
      };
   }

   const updatedData = data;
   if (files && files.length>0) {
      const uploadedFiles = await uploadFile(files);
      updatedData.videoUrls = uploadedFiles.map((item) => item?.url);
   }

   const updatedVideo = await Video.findByIdAndUpdate(id, updatedData, {
      new: true,
   });
   return updatedVideo;
};

const deleteVideo = async (id, user) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const video = await getVideoById(id);
   if (video.createdBy.toString() !== user._id && !user.roles.includes("admin")) {
      throw {
         statusCode: 403,
         message: "Unauthorized to delete this video",
      };
   }
   await Video.findByIdAndDelete(id);
   // Decrement user's totalVideos
   await UserModel.findByIdAndUpdate(user._id, { $inc: { totalVideos: -1 } });
};

const reactToVideo = async (id, user) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const video = await getVideoById(id);
   await Video.findByIdAndUpdate(id, { $inc: { reactions: 1 } });
   // Increment user's totalReactions
   await UserModel.findByIdAndUpdate(video.createdBy, { $inc: { totalReactions: 1 } });
   return { message: "Reaction added" };
};

const viewVideo = async (id) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });
   return { message: "View counted" };
};

export default {getVideos, getVideoById, createVideo, updateVideo, deleteVideo, reactToVideo, viewVideo};