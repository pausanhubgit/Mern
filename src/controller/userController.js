import userService from "../services/userService.js";

const getUser = async (req, res) => {
    try {
        const users = await userService.getUser();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
};

const createUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json({
            message: "User created successfully",
            user: newUser
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        const updatedUser = await userService.updateUser(id, updateData, req.user);
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            message: "Failed to update user",
            error: error.message
        });
    }
};

const createMerchant = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId)
            return res.status(400).json({ message: "User ID is required to create merchant" });

        const data = await userService.createMerchant(userId);
        res.json(data);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await userService.deleteUser(id, req.user);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "User deleted successfully",
            user: deletedUser
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(error.statusCode || 500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};

const updateProfileImage = async (req, res) => {
    const id = req.params.id;
    // multer.any() stores files in req.files
    const file = req.file || (req.files && req.files[0]);

    try {
        const data = await userService.updateUserProfileImage(id, file, req.user);
        res.json(data);
    } catch (error) {
        // res.status(500).json({error: error.message});
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

const updateCoverImage = async (req, res) => {
    const id = req.params.id;
    const file = req.file || (req.files && req.files[0]);

    try {
        const data = await userService.updateUserCoverImage(id, file, req.user);
        res.json(data);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

const getUserDashboard = async (req, res) => {
    try {
        const id = req.params.id;
        const dashboard = await userService.getUserDashboard(id, req.user);
        res.json(dashboard);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await userService.getCart(userId);
        res.json(cart);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { artId } = req.body;
        const cart = await userService.addToCart(userId, artId);
        res.json(cart);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const artId = req.params.artId;
        const cart = await userService.removeFromCart(userId, artId);
        res.json(cart);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const profile = await userService.getUserProfile(id);
        res.json(profile);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { roles } = req.body;
        if (!roles) {
            return res.status(400).json({ message: "Roles are required" });
        }
        const updatedUser = await userService.updateUserRole(id, roles);
        res.json({
            message: "User roles updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating user roles:", error);
        res.status(error.statusCode || 500).json({
            message: "Failed to update user roles",
            error: error.message
        });
    }
};

const followUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentUserId = req.user._id;
        const result = await userService.followUser(targetId, currentUserId);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentUserId = req.user._id;
        const result = await userService.unfollowUser(targetId, currentUserId);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

export default { createUser, getUserById, getUser, updateUser, createMerchant, deleteUser, updateProfileImage, updateCoverImage, getUserDashboard, getCart, addToCart, removeFromCart, getUserProfile, updateUserRole, followUser, unfollowUser };

// export default {createUser, getUserById};