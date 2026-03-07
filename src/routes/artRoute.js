import express from 'express';
import artController from '../controller/artController.js';
import auth from '../middlewares/auth.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import { Merchant } from '../constants/roles.js';
import multer from 'multer';




const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});



router.get('/', artController.getArt);
router.get('/:id', artController.getArtById);

router.post(
    '/',
    upload.any(),
     auth,
    roleBasedAuth(Merchant),
     artController.Createart
    );

router.put('/:id', upload.any(), auth, roleBasedAuth(Merchant), artController.UpdateArt);
router.delete('/:id',auth, roleBasedAuth(Merchant), artController.deleteArt);

// router.get('/art/get', artController.getArt);


// router.get('/art', artController.getArtById);

// router.get('/sketch', (req, res) => {
//     res.send('Sketches Route');
// });





export default router;