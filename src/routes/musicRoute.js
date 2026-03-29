import express from 'express';
import musicController from '../controller/musicController.js';
import auth from '../middlewares/auth.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Merchant, Admin } from '../constants/roles.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});

router.get('/', musicController.getMusic);
router.get('/count', musicController.getMusicCount);
router.get('/genres', musicController.getGenres);
router.get('/:id', musicController.getMusicById);
router.post('/', upload.any(), auth, roleBasedAuth([Merchant, Admin]), musicController.createMusic);
router.put('/:id', upload.any(), auth, roleBasedAuth([Merchant, Admin]), musicController.updateMusic);
router.delete('/:id', auth, roleBasedAuth([Merchant, Admin]), musicController.deleteMusic);
router.post('/:id/react', auth, musicController.reactToMusic);
router.get('/:id/view', musicController.viewMusic);
router.post('/:id/comment', auth, musicController.addComment);
router.delete('/:id/comment/:commentId', auth, musicController.deleteComment);

export default router;