import express from 'express';
import { checkRole, protect } from '../../middleware/authMiddleware.js';
import { cancelOrder, createOrder, getCart, getOrderByUserIDandStatus } from '../../controllers/customer/order.controller.js';

const orderRouter = express.Router();

//create a order
orderRouter.post('/', protect, checkRole('admin','customer'), createOrder);

//get order by userID and status (or all)
orderRouter.get('/', protect, checkRole('admin','customer'), getOrderByUserIDandStatus);

//cancel an order
orderRouter.patch('/:id', protect, checkRole('admin','customer'), cancelOrder);

//Get Cart (order with status: pending, confirmed, processing, in transit)
orderRouter.get('/cart', protect, checkRole('admin','customer'), getCart);

export default orderRouter;