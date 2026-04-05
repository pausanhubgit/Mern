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
    let uploadedResults = [];
    try {
        uploadedResults = await uploadFile(files);
    } catch (uploadError) {
        // If the error has a statusCode (like our 400 for size limit), propagate it
        if (uploadError.statusCode) {
            throw uploadError;
        }
        throw uploadError;
    }
    
    // Separate files based on the fieldname provided by the upload utility
    const videoFiles = uploadedResults.filter(f => f.fieldname === 'media');
    const imageFiles = uploadedResults.filter(f => f.fieldname === 'image');

    const videoUrls = videoFiles.map(f => f.secure_url || f.url);
    const imageUrls = imageFiles.map(f => f.secure_url || f.url);

    // AI Description Generation with safety fallback
    let description = data.description || "";
    try {
        if (!description) {
            const promptMessage = Art_PROMPT.replace('%s', data.title || 'Unknown').replace('%s', data.artist || 'Unknown').replace('%s', data.category || 'Unknown');
            const aiDescription = await promptGemini(promptMessage);
            description = aiDescription || `A video titled ${data.title}`;
        }
    } catch (aiError) {
        console.error("AI Description generation failed:", aiError);
        description = data.description || `A video titled ${data.title}`;
    }

    const createdVideo = await Video.create({
       ...data,
       createdBy: createdBy._id,
       videoUrls,
       imageUrls,
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
   const genre = query.genre; // genre maps to category field
   const min = query.min !== undefined ? Number(query.min) : (query.minPrice !== undefined ? Number(query.minPrice) : undefined);
   const max = query.max !== undefined ? Number(query.max) : (query.maxPrice !== undefined ? Number(query.maxPrice) : undefined);
   const name = query.name || query.title;
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
   if (genre) Filter.category = genre; // filter by genre (which is stored as category)
   else if (category) Filter.category = category;
   if (subcategory) Filter.subcategory = subcategory;
   if(createdBy) Filter.createdBy = createdBy;
   const videos = await Video.find(Filter)
   .sort(sort)
   .limit(limit)
   .skip(offset)
   .populate('createdBy', 'username name profileImageUrl');
   return videos;
};

const getVideoById = async (id) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }

   const foundVideo = await Video.findById(id).populate('createdBy', 'username name profileImageUrl');
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
   
   // Robust role normalization
   const userRoles = Array.isArray(user.roles) ? user.roles : (typeof user.roles === 'string' ? [user.roles] : []);
   const upperRoles = userRoles.map(r => String(r).toUpperCase());
   const isAdmin = upperRoles.includes("ADMIN");

   if (video.createdBy?._id?.toString() !== user._id?.toString() && !isAdmin) {
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
   
   // Robust role normalization
   const userRoles = Array.isArray(user.roles) ? user.roles : (typeof user.roles === 'string' ? [user.roles] : []);
   const upperRoles = userRoles.map(r => String(r).toUpperCase());
   const isAdmin = upperRoles.includes("ADMIN");

   if (video.createdBy?._id?.toString() !== user._id?.toString() && !isAdmin) {
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

    // 40% of $0.10 view revenue to Admin
    await UserModel.findOneAndUpdate({ roles: "Admin" }, { $inc: { revenue: 0.04 } });

    return { message: "View counted" };
};

const countVideos = async(query) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const Filter = {};
   if(query.name) Filter.title = { $regex: query.name, $options: 'i' };
   if(query.createdBy) Filter.createdBy = query.createdBy;
   if(query.category) Filter.category = query.category;
   if(query.subcategory) Filter.subcategory = query.subcategory;
   
   return await Video.countDocuments(Filter);
};

const addComment = async (id, userId, username, text) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const video = await Video.findByIdAndUpdate(
      id,
      { $push: { comments: { userId, username, text } } },
      { new: true }
   );
   return video;
};

const deleteComment = async (id, commentId, userId) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const video = await Video.findById(id);
   const comment = video.comments.id(commentId);
   if (!comment) throw { statusCode: 404, message: "Comment not found" };
   if (comment.userId.toString() !== userId) {
      throw { statusCode: 403, message: "Unauthorized to delete this comment" };
   }
   video.comments.pull(commentId);
   await video.save();
   return video;
};

const getGenres = async () => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   return await Video.distinct("category");
};

export default {getVideos, getVideoById, createVideo, updateVideo, deleteVideo, reactToVideo, viewVideo, countVideos, addComment, deleteComment, getGenres};
