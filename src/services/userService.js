import UserModel from '../models/UserModel.js';
import { Admin, Merchant, User } from '../constants/roles.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';

const getUser = async()=>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    return await UserModel.find();
};


const getUserById = async(id)=>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await UserModel.findById(id);
    if(!user) throw { statusCode: 404, message: "User not found" };
    return user;
};

const createUser = async(data)=>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    return await UserModel.create(data);
};


const updateUser = async(id, updateData,authUser)=>{
    const user = await getUserById(id);
    if(!user.id != authUser&& !authUser.roles.includes(ADMIN)) throw { statusCode: 404, message: "User not found" };
    return await UserModel.findByIdAndUpdate(id, {
        name: updateData.name,
        phone: updateData.phone,
        address: updateData.address
    }, {new:true});

};
const createMerchant = async(UserId)=>{
  if (mongoose.connection.readyState !== 1) {
    await connectToDatabase();
  }
  const updateUser = await UserModel.findByIdAndUpdate(
    UserId,
    {
        roles: [User,Merchant],
    },
    {new:true}
  );
  return updateUser;

}
const deleteUser = async(id)=>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    return await UserModel.findByIdAndDelete(id);
};

const updateUserProfileImage = async(id, file,authUser)=>{
    const user = await getUserById(id);
     if(!user.id != authUser&& !req.user.roles.includes(ADMIN)) throw { statusCode: 404, message: "User not found" };
    const uploadFiles = await uploadFiles([file]);

    const updatedUser = await UserModel.findByIdAndUpdate(id, {profileImageUrl: uploadFiles[0].url}, {new:true});
    return updatedUser;
}
//recheck
export default {getUserById, deleteUser,getUser,createUser, updateUser, createMerchant, updateUserProfileImage};

