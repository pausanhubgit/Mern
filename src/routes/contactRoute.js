import express from 'express';
import contactController from '../controller/contactController.js';
import auth from '../middlewares/auth.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Admin } from '../constants/roles.js';

const router = express.Router();

router.post('/', contactController.submitContact);
router.get('/', auth, roleBasedAuth([Admin]), contactController.getContacts);

export default router;
