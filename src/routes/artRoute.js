import express from 'express';
import artController from '../controller/artController.js';
import auth from '../middlewares/auth.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Merchant, Admin } from '../constants/roles.js';
import multer from 'multer';




const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});



router.get('/', artController.getArt);
router.get('/count', artController.getArtCount);
router.get('/categories', artController.getCategories);
router.get('/brands', artController.getBrands);
router.get('/:id', artController.getArtById);

router.post(
    '/',
    upload.any(),
     auth,
    roleBasedAuth([Merchant, Admin]),
     artController.Createart
    );

router.put('/:id', upload.any(), auth, roleBasedAuth([Merchant, Admin]), artController.UpdateArt);
router.delete('/:id',auth, roleBasedAuth([Merchant, Admin]), artController.deleteArt);
router.post('/:id/react', auth, artController.reactToArt);
router.post('/:id/view', artController.viewArt);
router.post('/:id/comment', auth, artController.addComment);
router.delete('/:id/comment/:commentId', auth, artController.deleteComment);

// router.get('/art/get', artController.getArt);


// router.get('/art', artController.getArtById);

// router.get('/sketch', (req, res) => {
//     res.send('Sketches Route');
// });





export default router;