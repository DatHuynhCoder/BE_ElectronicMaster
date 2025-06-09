import express from 'express';
import { checkRole, protect } from '../../middleware/authMiddleware.js';
import { cancelOrder, createOrder, getOrderByUserIDandStatus, getElectronicsByOrderId } from '../../controllers/customer/order.controller.js';

const orderRouter = express.Router();

//create a order
orderRouter.post('/', protect, checkRole('admin', 'customer'), createOrder);

//get order by userID and status (or all)
orderRouter.get('/', protect, checkRole('admin', 'customer'), getOrderByUserIDandStatus);

// get electronics by orderid
orderRouter.get('/electronics', protect, checkRole('admin', 'customer'), getElectronicsByOrderId);

//cancel an order
orderRouter.patch('/:id', protect, checkRole('admin', 'customer'), cancelOrder);

export default orderRouter;