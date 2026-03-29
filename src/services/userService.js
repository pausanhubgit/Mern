import UserModel from '../models/UserModel.js';
import { Admin, Merchant, User } from '../constants/roles.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';
import uploadFile from '../utils/file.js';
import Art from '../models/ArtModel.js';
import Music from '../models/MusicModel.js';
import Video from '../models/VideoModel.js';
import Event from '../models/EventModel.js';

const getUser = async()=>{
   if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
   }
   const users = await UserModel.find();
   return users;
};


const getUserById = async(id)=>{
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }
    const user = await UserModel.findById(id);
    if(!user) throw { statusCode: 404, message: "User not found" };
    return user;
};

const createUser = async(data)=>await UserModel.create(data);

const updateUser = async(id, data, authUser)=>{
    const user = await getUserById(id);

  if (user._id.toString() !== authUser._id && !authUser.roles.includes(Admin)) {
    throw {
      statusCode: 403,
      message: "Access denied.",
    };
  }
 const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    {
        username: data.name || data.username || user.username,
        email: data.email || user.email,
        bio: data.bio || user.bio,
        city: data.city || data.address?.city || user.city,
    },
    {new:true}
 );

 return updatedUser;
};

const createMerchant = async(UserId)=>{

  const updateUser = await UserModel.findByIdAndUpdate(
    UserId,
    {
        roles: [User,Merchant],
    },
    {new:true}
  );
  return updateUser ? updateUser.toObject() : null;

}
const deleteUser = async(id)=>{
    const user = await getUserById(id);
    return await UserModel.findByIdAndDelete(id);
}


const updateUserProfileImage = async(id, file, authUser)=>{
    const user = await getUserById(id);
    if (user._id.toString() !== authUser._id && !authUser.roles.includes(Admin)) {
        throw { statusCode: 403, message: "Access denied." };
    }
    if (!file) {
        throw { statusCode: 400, message: "File is required" };
    }
    const results = await uploadFile([file]);
    const imageUrl = results[0]?.url || "";
    const updatedUser = await UserModel.findByIdAndUpdate(id, {profileImageUrl: imageUrl}, {new:true});
    return updatedUser;
}

const updateUserCoverImage = async(id, file, authUser)=>{
    const user = await getUserById(id);
    if (user._id.toString() !== authUser._id && !authUser.roles.includes(Admin)) {
        throw { statusCode: 403, message: "Access denied." };
    }
    if (!file) {
        throw { statusCode: 400, message: "File is required" };
    }
    const results = await uploadFile([file]);
    const imageUrl = results[0]?.url || "";
    const updatedUser = await UserModel.findByIdAndUpdate(id, {coverImageUrl: imageUrl}, {new:true});
    return updatedUser;
}

const getUserDashboard = async(id, authUser)=>{
    const user = await getUserById(id);
    if (user._id.toString() !== authUser._id && !authUser.roles.includes(Admin)) {
        throw { statusCode: 403, message: "Access denied." };
    }
    // Calculate badges based on counts
    const badges = [];
    if (user.totalArts > 0) badges.push("Artist");
    if (user.totalMusics > 0) badges.push("Musician");
    if (user.totalVideos > 0) badges.push("Videographer");
    
    // Tiered Engagement Badges
    if (user.totalReactions > 10) badges.push("Bronze Creator");
    if (user.totalReactions > 20) badges.push("Silver Creator");
    if (user.totalReactions > 50) badges.push("Gold Creator");
    if (user.totalReactions > 100) badges.push("Legendary Artist");

    // Update badges in DB
    await UserModel.findByIdAndUpdate(id, { badges });

    return {
        totalArts: user.totalArts,
        totalMusics: user.totalMusics,
        totalVideos: user.totalVideos,
        totalEvents: user.totalEvents || 0,
        totalReactions: user.totalReactions,
        revenue: user.revenue || 0,
        badges
    };
}

const addToCart = async (userId, artId) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await UserModel.findById(userId);
    if (!user) throw { statusCode: 404, message: "User not found" };

    const cartItemIndex = user.cart.findIndex(item => item.artId.toString() === artId);

    if (cartItemIndex > -1) {
        user.cart[cartItemIndex].quantity += 1;
    } else {
        user.cart.push({ artId, quantity: 1 });
    }

    await user.save();
    return await user.populate('cart.artId');
};

const removeFromCart = async (userId, artId) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await UserModel.findById(userId);
    if (!user) throw { statusCode: 404, message: "User not found" };

    user.cart = user.cart.filter(item => item.artId.toString() !== artId);
    await user.save();
    return await user.populate('cart.artId');
};

const getCart = async (userId) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await UserModel.findById(userId).populate('cart.artId');
    if (!user) throw { statusCode: 404, message: "User not found" };
    return user.cart;
};

const getUserProfile = async (id) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await UserModel.findById(id).select('-password -cart');
    if (!user) throw { statusCode: 404, message: "User not found" };

    const [arts, musics, videos, events] = await Promise.all([
        Art.find({ createdBy: id }).limit(12).populate('createdBy', 'username name profileImageUrl'),
        Music.find({ createdBy: id }).limit(12).populate('createdBy', 'username name profileImageUrl'),
        Video.find({ createdBy: id }).limit(12).populate('createdBy', 'username name profileImageUrl'),
        Event.find({ creatorUserId: id }).limit(12).populate('creatorUserId', 'username name profileImageUrl')
    ]);

    return {
        user,
        creations: {
            arts,
            musics,
            videos,
            events
        }
    };
};

const updateUserRole = async (id, roles) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await UserModel.findById(id);
    if (!user) throw { statusCode: 404, message: "User not found" };

    // Ensure roles is an array
    const rolesArray = Array.isArray(roles) ? roles : [roles];

    // Validate roles
    const validRoles = [User, Admin, Merchant];
    const filteredRoles = rolesArray.filter(role => validRoles.includes(role));
    
    if (filteredRoles.length === 0) {
        throw { statusCode: 400, message: "At least one valid role is required" };
    }

    user.roles = filteredRoles;
    await user.save();
    return user;
};

export default {getUserById, deleteUser,getUser,createUser, updateUser, createMerchant, updateUserProfileImage, updateUserCoverImage, getUserDashboard, addToCart, removeFromCart, getCart, getUserProfile, updateUserRole};

