import express from 'express';
import userController from '../controller/userController.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Admin, Merchant } from '../constants/roles.js';
import auth from '../middlewares/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });



const router = express.Router();


router.get('/',auth, roleBasedAuth(Admin), userController.getUser);
 router.get('/id',auth, roleBasedAuth(Admin),  userController.getUserById);
 router.put('/:id',auth, roleBasedAuth(Admin), userController.updateUser);
 router.post('/',auth, roleBasedAuth(Admin),   userController.createUser);
 router.delete('/:id',auth, roleBasedAuth(Admin), userController.deleteUser);
 router.patch('/:id/profile-image', upload.any(), auth, roleBasedAuth(Merchant), userController.updateProfileImage);
 router.post('/merchant', auth, roleBasedAuth(Admin), userController.createMerchant);

export default router;
// export default router;
