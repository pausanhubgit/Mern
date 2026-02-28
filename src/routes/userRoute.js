import express from 'express';
import userController from '../controller/userController.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Admin } from '../constants/roles.js';



const router = express.Router();


router.get('/',roleBasedAuth(Admin), userController.getUser);
 router.get('/id',roleBasedAuth(Admin),  userController.getUserById);
 router.put('/:id',roleBasedAuth(Admin), userController.updateUser);
 router.post('/',roleBasedAuth(Admin),   userController.createUser);
 router.delete('/:id',roleBasedAuth(Admin), userController.deleteUser);
 router.patch('/:id/profile-image', roleBasedAuth(Admin),userController.updateProfileImage);
 router.post('/merchant', roleBasedAuth(Admin), userController.createMerchant);

export default router;
// export default router;
