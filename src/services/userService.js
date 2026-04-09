import UserModel from '../models/UserModel.js';
import { Admin, Merchant, User } from '../constants/roles.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';
import uploadFile from '../utils/file.js';
import Art from '../models/ArtModel.js';
import Music from '../models/MusicModel.js';
import Video from '../models/VideoModel.js';
import Event from '../models/EventModel.js';
import notificationService from './notificationService.js';

const getUser = async () => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const users = await UserModel.find();
    return users;
};


const getUserById = async (id) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await UserModel.findById(id);
    if (!user) throw { statusCode: 404, message: "User not found" };
    return user;
};

const createUser = async (data) => await UserModel.create(data);

const updateUser = async (id, data, authUser) => {
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
            username: data.username || user.username,
            name: data.name || user.name || "",
            email: data.email || user.email,
            bio: data.bio || user.bio,
            city: data.city || data.address?.city || user.city,
        },
        { new: true }
    );

    return updatedUser;
};

const createMerchant = async (UserId) => {

    const updateUser = await UserModel.findByIdAndUpdate(
        UserId,
        {
            roles: [User, Merchant],
        },
        { new: true }
    );
    return updateUser ? updateUser.toObject() : null;

}
const deleteUser = async (id, authUser) => {
    const user = await getUserById(id);

    // Permission check: User can only delete themselves unless they are an Admin
    if (user._id.toString() !== authUser._id.toString() && !authUser.roles.map(r => r.toLowerCase()).includes(Admin.toLowerCase())) {
        throw { statusCode: 403, message: "Access denied. You can only delete your own account." };
    }

    // Delete associated content
    await Promise.all([
        Art.deleteMany({ createdBy: id }),
        Music.deleteMany({ createdBy: id }),
        Video.deleteMany({ createdBy: id }),
        Event.deleteMany({ creatorUserId: id }),
        // Optional: Remove user from other users' followers/following lists
        UserModel.updateMany({}, { $pull: { followers: id, following: id } })
    ]);

    return await UserModel.findByIdAndDelete(id);
}


const updateUserProfileImage = async (id, file, authUser) => {
    const user = await getUserById(id);
    if (user._id.toString() !== authUser._id && !authUser.roles.includes(Admin)) {
        throw { statusCode: 403, message: "Access denied." };
    }
    if (!file) {
        throw { statusCode: 400, message: "File is required" };
    }
    const results = await uploadFile([file]);
    const imageUrl = results[0]?.url || "";
    const updatedUser = await UserModel.findByIdAndUpdate(id, { profileImageUrl: imageUrl }, { new: true });
    return updatedUser;
}

const updateUserCoverImage = async (id, file, authUser) => {
    const user = await getUserById(id);
    if (user._id.toString() !== authUser._id && !authUser.roles.includes(Admin)) {
        throw { statusCode: 403, message: "Access denied." };
    }
    if (!file) {
        throw { statusCode: 400, message: "File is required" };
    }
    const results = await uploadFile([file]);
    const imageUrl = results[0]?.url || "";
    const updatedUser = await UserModel.findByIdAndUpdate(id, { coverImageUrl: imageUrl }, { new: true });
    return updatedUser;
}

const getTotalReactions = async () => {
    const [artReactions, musicReactions, videoReactions] = await Promise.all([
        Art.aggregate([{ $group: { _id: null, total: { $sum: "$reactions" } } }]),
        Music.aggregate([{ $group: { _id: null, total: { $sum: "$reactions" } } }]),
        Video.aggregate([{ $group: { _id: null, total: { $sum: "$reactions" } } }])
    ]);
    return (artReactions[0]?.total || 0) + (musicReactions[0]?.total || 0) + (videoReactions[0]?.total || 0);
}

const getSystemStats = async () => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const [totalUsers, totalArts, totalMusics, totalVideos, totalEvents, totalReactions] = await Promise.all([
        UserModel.countDocuments(),
        Art.countDocuments(),
        Music.countDocuments(),
        Video.countDocuments(),
        Event.countDocuments(),
        getTotalReactions()
    ]);

    return {
        totalUsers: Math.max(0, totalUsers),
        totalArts: Math.max(0, totalArts),
        totalMusics: Math.max(0, totalMusics),
        totalVideos: Math.max(0, totalVideos),
        totalEvents: Math.max(0, totalEvents),
        totalReactions: Math.max(0, totalReactions),
    };
};

const getContentGrowth = async () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            name: d.toLocaleString('default', { month: 'short' }),
            date: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
        });
    }

    const growthData = await Promise.all(months.map(async (m) => {
        const [users, arts, events] = await Promise.all([
            UserModel.countDocuments({ createdAt: { $lte: m.date } }),
            Art.countDocuments({ createdAt: { $lte: m.date } }),
            Event.countDocuments({ createdAt: { $lte: m.date } })
        ]);
        return { name: m.name, users, arts, events };
    }));

    return growthData;
};

const getUserDashboard = async (id, authUser) => {
    const user = await getUserById(id);
    if (user._id.toString() !== authUser._id && !authUser.roles.includes(Admin)) {
        throw { statusCode: 403, message: "Access denied." };
    }

    if (authUser.roles.includes(Admin)) {
        const [stats, growthData] = await Promise.all([
            getSystemStats(),
            getContentGrowth()
        ]);
        return {
            ...stats,
            growthData,
            revenue: user.revenue || 0,
            badges: user.badges || []
        };
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
    const user = await UserModel.findById(id).select('-password -cart')
        .populate('followers', 'username name profileImageUrl')
        .populate('following', 'username name profileImageUrl');
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

const followUser = async (targetId, currentUserId) => {
    if (mongoose.connection.readyState !== 1) await connectToDatabase();
    
    // Robust ID comparison using strings
    const targetIdStr = String(targetId || "");
    const currentUserIdStr = String(currentUserId || "");

    if (!targetIdStr || !currentUserIdStr) {
        throw { statusCode: 400, message: "Valid target and sender IDs are required" };
    }

    if (targetIdStr === currentUserIdStr) {
        throw { statusCode: 400, message: "You cannot follow yourself" };
    }

    const targetUser = await UserModel.findById(targetId);
    const currentUser = await UserModel.findById(currentUserId);

    if (!targetUser || !currentUser) throw { statusCode: 404, message: "User not found" };

    // Avoid duplicates
    if (targetUser.followers.some(id => id.toString() === currentUserIdStr)) {
        return { message: "Already following this user" };
    }

    // Check if this is a mutual follow (Follow Back)
    // We check if the targetUser (A) already includes the currentUser (B) in their following list
    const targetFollowing = targetUser.following || [];
    const isFollowBack = targetFollowing.some(id => String(id) === currentUserIdStr);
    
    const followerName = currentUser.name || currentUser.username || "A merchant";
    const notifTitle = isFollowBack ? "New Follow Back" : "New Follower";
    const notifMessage = isFollowBack 
        ? `${followerName} followed you back` 
        : `${followerName} started following you`;

    console.log(`[SOCIAL DEBUG] isFollowBack: ${isFollowBack}, TargetID: ${targetId}, CurrentID: ${currentUserId}`);

    await Promise.all([
        UserModel.findByIdAndUpdate(targetId, { $push: { followers: currentUserId } }),
        UserModel.findByIdAndUpdate(currentUserId, { $push: { following: targetId } }),
        notificationService.createNotification({
            recipient: targetId,
            sender: currentUserId,
            type: isFollowBack ? "follow_back" : "follow",
            title: notifTitle,
            message: notifMessage,
            link: `/profile/${currentUserId}`
        })
    ]);
    console.log(`[BACKEND SOCIAL] Notification (${isFollowBack ? 'FOLLOW_BACK' : 'FOLLOW'}) sent to ${targetId} from ${currentUserId}`);

    return { success: true, message: "Followed successfully" };
};

const unfollowUser = async (targetId, currentUserId) => {
    if (mongoose.connection.readyState !== 1) await connectToDatabase();

    await Promise.all([
        UserModel.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } }),
        UserModel.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } })
    ]);

    return { success: true, message: "Unfollowed successfully" };
};

export default { getUserById, deleteUser, getUser, createUser, updateUser, createMerchant, updateUserProfileImage, updateUserCoverImage, getUserDashboard, addToCart, removeFromCart, getCart, getUserProfile, updateUserRole, followUser, unfollowUser };

