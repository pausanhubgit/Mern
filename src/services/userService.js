import UserModel from '../models/UserModel.js';
import { Admin, Merchant, User } from '../constants/roles.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';

const getUser = async()=>{
const users = await UserModel.find();
return users;
};


const getUserById = async(id)=>{
    const user = await UserModel.findById(id);
    if(!user) throw { statusCode: 404, message: "User not found" };
    return user;
};

const createUser = async(data)=>await UserModel.create(data);

const updateUser = async(id, data, authUser)=>{
    const user = await getUserById(id);

  if (user._id != authUser._id && !authUser.roles.includes(ADMIN)) {
    throw {
      statusCode: 403,
      message: "Access denied.",
    };
  }
 const updatedUser = await User.findByIdAndUpdate(
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
  return updateUser;

}
const deleteUser = async(id)=>{
    const user = await getUserById(id);
    return await UserModel.findByIdAndDelete(id);
}


const updateUserProfileImage = async(id, file,authUser)=>{
    const user = await getUserById(id);
     if(!user.id != authUser&& !req.user.roles.includes(ADMIN)) throw { statusCode: 404, message: "User not found" };
    const uploadFiles = await uploadFiles([file]);

    const updatedUser = await UserModel.findByIdAndUpdate(id, {profileImageUrl: uploadFiles[0].url}, {new:true});
    return updatedUser;
}
//recheck
export default {getUserById, deleteUser,getUser,createUser, updateUser, createMerchant, updateUserProfileImage};

