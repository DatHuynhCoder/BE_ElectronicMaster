import express from 'express'
import { checkRole, protect } from '../../middleware/authMiddleware.js';
import { getAllUser } from '../../controllers/admin/manageUser.controller.js';

const manageUserRouter = express.Router();

//get all user
manageUserRouter.get('/', protect, checkRole('admin'), getAllUser)

export default manageUserRouter;