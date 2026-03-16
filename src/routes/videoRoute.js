import express from 'express';
import videoController from '../controller/videoController.js';
import auth from '../middlewares/auth.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Merchant } from '../constants/roles.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});

router.get('/', videoController.getVideo);
router.get('/:id', videoController.getVideoById);
router.post('/', upload.any(), auth, roleBasedAuth(Merchant), videoController.createVideo);
router.put('/:id', upload.any(), auth, roleBasedAuth(Merchant), videoController.updateVideo);
router.delete('/:id', auth, roleBasedAuth(Merchant), videoController.deleteVideo);
router.post('/:id/react', auth, videoController.reactToVideo);
router.post('/:id/view', videoController.viewVideo);

export default router;