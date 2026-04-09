import Art from '../models/ArtModel.js';
import UserModel from '../models/UserModel.js';
import uploadFile from '../utils/file.js';
import promptGemini from '../utils/gemini.js';
import { Art_PROMPT } from '../constants/prompt.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';
import notificationService from './notificationService.js';

const createArt = async (data, files, createdBy) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const uploadedResults = await uploadFile(files);

   // AI Description Generation with safety fallback
   let description = data.description || "";
   try {
      if (!description) {
         const promptMessage = Art_PROMPT.replace('%s', data.title || 'Unknown').replace('%s', data.artist || 'Unknown').replace('%s', data.category || 'Unknown');
         const aiDescription = await promptGemini(promptMessage);
         description = aiDescription || `A beautiful artwork titled ${data.title}`;
      }
   } catch (aiError) {
      console.error("AI Description generation failed:", aiError);
      description = data.description || `A collection of visual art titled ${data.title}`;
   }

   if (data.stock) data.stock = Number(data.stock);
   if (data.price) data.price = Number(data.price);

   const createdArt = await Art.create({
      ...data,
      createdBy: createdBy._id,
      imageUrls: uploadedResults.map((item) => item?.secure_url || item?.url),
      description,
   });

   await UserModel.findByIdAndUpdate(createdBy._id, { $inc: { totalArts: 1 } });

   return createdArt;
};

const getarts = async (query) => {
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
   const min = query.min !== undefined ? Number(query.min) : (query.minPrice !== undefined ? Number(query.minPrice) : undefined);
   const max = query.max !== undefined ? Number(query.max) : (query.maxPrice !== undefined ? Number(query.maxPrice) : undefined);
   const name = query.name || query.title;
   const createdBy = query.createdBy;

   const Filter = {};

   if (name) {
      Filter.title = { $regex: name, $options: 'i' };
   }
   if (min) {
      Filter.price = { $gte: min };
   }
   if (max) {
      Filter.price = { ...Filter.price, $lte: max };
   }
   if (brand) {
      const branditems = brand.split(',');
      Filter.brand = { $in: branditems };
   }
   if (category) Filter.category = category;
   if (createdBy) Filter.createdBy = createdBy;
   const arts = await Art.find(Filter)
      .sort(sort)
      .limit(limit)
      .skip(offset)
      .populate('createdBy', 'username name profileImageUrl');
   return arts;
};

const getArtById = async (id) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }

   const foundArt = await Art.findById(id).populate('createdBy', 'username name profileImageUrl');
   if (!foundArt) {
      throw {
         statusCode: 404,
         message: "Art not found",
      };
   }

   return foundArt;
};

const updateArt = async (id, data, files, user) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const art = await getArtById(id);
   // Robust role normalization
   const userRoles = Array.isArray(user.roles) ? user.roles : (typeof user.roles === 'string' ? [user.roles] : []);
   const upperRoles = userRoles.map(r => String(r).toUpperCase());
   const isAdmin = upperRoles.includes("ADMIN");

   if (art.createdBy?._id?.toString() !== user._id?.toString() && !isAdmin) {
      throw {
         statusCode: 403,
         message: "Unauthorized to update this art",
      };
   }

   if (data.stock) data.stock = Number(data.stock);
   if (data.price) data.price = Number(data.price);

   const updatedData = data;
   if (files && files.length > 0) {
      const uploadedFiles = await uploadFile(files);
      updatedData.imageUrls = uploadedFiles.map((item) => item?.url);
   }

   const updatedArt = await Art.findByIdAndUpdate(id, updatedData, {
      new: true,
   });
   return updatedArt;
};

const deleteArt = async (id, user) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const art = await getArtById(id);
   // Robust role normalization
   const userRoles = Array.isArray(user.roles) ? user.roles : (typeof user.roles === 'string' ? [user.roles] : []);
   const upperRoles = userRoles.map(r => String(r).toUpperCase());
   const isAdmin = upperRoles.includes("ADMIN");

   if (art.createdBy?._id?.toString() !== user._id?.toString() && !isAdmin) {
      throw {
         statusCode: 403,
         message: "Unauthorized to delete this art",
      };
   }
   await Art.findByIdAndDelete(id);
   await UserModel.findByIdAndUpdate(user._id, { $inc: { totalArts: -1 } });
};

const reactToArt = async (id, user) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const art = await getArtById(id);
   const userId = user._id.toString();
   const isLiked = art.likes && art.likes.map(id => id.toString()).includes(userId);

   if (isLiked) {
      // Unlike logic
      await Art.findByIdAndUpdate(id, {
         $pull: { likes: user._id },
         $inc: { reactions: -1 }
      });
      await UserModel.findByIdAndUpdate(art.createdBy, { $inc: { totalReactions: -1 } });
      return { message: "Reaction removed", liked: false };
   } else {
      // Like logic
      await Art.findByIdAndUpdate(id, {
         $addToSet: { likes: user._id },
         $inc: { reactions: 1 }
      });
      await UserModel.findByIdAndUpdate(art.createdBy, { $inc: { totalReactions: 1 } });

      // Professional notification for owner
      if (art.createdBy._id.toString() !== userId) {
         const senderName = user.name || user.username || "A merchant";
         await notificationService.createNotification({
            recipient: art.createdBy._id,
            sender: user._id,
            type: "like",
            title: "Artwork Reaction",
            message: `${senderName} has liked your design arts "${art.title}"`,
            link: `/arts/${id}`
         });
      }
      return { message: "Reaction added", liked: true };
   }
};

const viewArt = async (id) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   await Art.findByIdAndUpdate(id, { $inc: { views: 1 } });

   // 40% of $0.10 view revenue to Admin
   await UserModel.findOneAndUpdate({ roles: "Admin" }, { $inc: { revenue: 0.04 } });

   return { message: "View counted" };
};

const countarts = async (query) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const Filter = {};
   if (query.name) Filter.title = { $regex: query.name, $options: 'i' };
   if (query.createdBy) Filter.createdBy = query.createdBy;
   if (query.category) Filter.category = query.category;

   return await Art.countDocuments(Filter);
};

const addComment = async (id, userId, username, text) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const art = await Art.findByIdAndUpdate(
      id,
      { $push: { comments: { userId, username, text } } },
      { new: true }
   );

   if (art.createdBy.toString() !== userId.toString()) {
      await notificationService.createNotification({
         recipient: art.createdBy,
         sender: userId,
         type: "comment",
         title: "New Comment Received",
         message: `${username} commented on your artwork "${art.title}"`,
         link: `/arts/${id}`
      });
   }

   return art;
};

const deleteComment = async (id, commentId, userId) => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const art = await Art.findById(id);
   const comment = art.comments.id(commentId);
   if (!comment) throw { statusCode: 404, message: "Comment not found" };
   if (comment.userId.toString() !== userId) {
      throw { statusCode: 403, message: "Unauthorized to delete this comment" };
   }
   art.comments.pull(commentId);
   await art.save();
   return art;
};

const getCategories = async () => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   return await Art.distinct("category");
};

const getBrands = async () => {
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   return await Art.distinct("brand");
};

export default { getarts, getArtById, createArt, updateArt, deleteArt, reactToArt, viewArt, countarts, addComment, deleteComment, getCategories, getBrands };