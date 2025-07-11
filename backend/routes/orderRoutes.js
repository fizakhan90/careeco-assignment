import express from 'express';
import { placeOrder, getOrderHistory, cancelOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', placeOrder); // works for both guest & auth
router.get('/history', protect, getOrderHistory);
router.put('/:id/cancel', protect, cancelOrder);

export default router;