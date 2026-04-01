import express from 'express';
import orderController from '../controller/orderController.js';
import roleBasedAuth from '../middlewares/roleBasedAuth.js';
import auth from '../middlewares/auth.js';

import { Admin, Merchant } from '../constants/roles.js';

const router = express.Router();

router.get('/',auth,roleBasedAuth(Admin),orderController.getOrders);
router.get('/user',auth,orderController.getOrdersByUser);
router.get('/merchant',auth,roleBasedAuth(Merchant),orderController.getOrdersOfMerchant);
router.get('/:id',auth,roleBasedAuth(Admin),orderController.getOrderById);
router.post('/',auth, orderController.createOrder);
router.put('/:id',auth,roleBasedAuth(Admin),orderController.updateOrder);
router.put('/:id/confirm-payment',auth,orderController.confirmOrderPayment);
router.delete('/:id',auth, orderController.deleteOrder);
router.post("/:id/payment/khalti",auth,orderController.orderPaymentViaKhalti);
router.post("/:id/payment/stripe",auth,orderController.orderPaymentViaStripe);
router.put('/:id/cod',auth,orderController.markAsCOD);
router.put('/:id/cancel',auth,orderController.cancelOrder);

export default router;