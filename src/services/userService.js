import UserModel from '../models/UserModel.js';
import { Admin, Merchant, User } from '../constants/roles.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';
import uploadFile from '../utils/file.js';

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
        username: data.username,
        email: data.email,
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
//recheck
export default {getUserById, deleteUser,getUser,createUser, updateUser, createMerchant, updateUserProfileImage};

