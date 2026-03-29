import subscriberController from '../controller/subscriberController.js';
import express from 'express';
import auth from '../middlewares/auth.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Admin } from '../constants/roles.js';

const router = express.Router();

router.post('/', subscriberController.subscribe);
router.get('/', auth, roleBasedAuth([Admin]), subscriberController.getSubscribers);

export default router;
