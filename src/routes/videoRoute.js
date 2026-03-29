import express from 'express';
import videoController from '../controller/videoController.js';
import auth from '../middlewares/auth.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Merchant, Admin } from '../constants/roles.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});

router.get('/', videoController.getVideo);
router.get('/count', videoController.getVideoCount);
router.get('/genres', videoController.getGenres);
router.get('/:id', videoController.getVideoById);
router.post('/', upload.any(), auth, roleBasedAuth([Merchant, Admin]), videoController.createVideo);
router.put('/:id', upload.any(), auth, roleBasedAuth([Merchant, Admin]), videoController.updateVideo);
router.delete('/:id', auth, roleBasedAuth([Merchant, Admin]), videoController.deleteVideo);
router.post('/:id/react', auth, videoController.reactToVideo);
router.post('/:id/view', videoController.viewVideo);
router.post('/:id/comment', auth, videoController.addComment);
router.delete('/:id/comment/:commentId', auth, videoController.deleteComment);

export default router;