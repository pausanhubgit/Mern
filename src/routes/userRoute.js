import express from 'express';
import userController from '../controller/userController.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Admin, Merchant } from '../constants/roles.js';
import auth from '../middlewares/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });



const router = express.Router();


router.get('/all', userController.getUser);
router.get('/', roleBasedAuth(Admin), userController.getUser);
router.get('/id', roleBasedAuth(Admin), userController.getUserById);
router.put('/:id', userController.updateUser);
router.post('/', roleBasedAuth(Admin), userController.createUser);
router.delete('/:id', auth, userController.deleteUser);
router.patch('/:id/profile-image', upload.any(), userController.updateProfileImage);
router.patch('/:id/cover-image', upload.any(), userController.updateCoverImage);
router.get('/profile/:id', userController.getUserProfile);
router.get('/:id/dashboard', userController.getUserDashboard);
router.post('/merchant', roleBasedAuth(Admin), userController.createMerchant);
router.put('/:id/roles', auth, roleBasedAuth(Admin), userController.updateUserRole);


router.get('/cart', auth, userController.getCart);
router.post('/cart', auth, userController.addToCart);
router.delete('/cart/:artId', auth, userController.removeFromCart);

// Social routes
router.post('/:id/follow', auth, userController.followUser);
router.post('/:id/unfollow', auth, userController.unfollowUser);

export default router;
// export default router;
