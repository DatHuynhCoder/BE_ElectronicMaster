import express from 'express'
import { checkRole, protect } from '../../middleware/authMiddleware.js';
import { getAllOrderByStatus, updateOrderStatus } from '../../controllers/admin/manageOrder.controller.js';

const manageOrderRouter = express.Router();

//get all order by status (or all)
manageOrderRouter.get('/',protect, checkRole('admin'), getAllOrderByStatus);

//udpate status order
manageOrderRouter.patch('/', protect, checkRole('admin'), updateOrderStatus);

export default manageOrderRouter;