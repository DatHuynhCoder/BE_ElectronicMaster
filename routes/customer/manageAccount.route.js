import express from 'express';
import { changePassword, deleteAccount, getAccountById, updateAccount } from '../../controllers/customer/manageAccount.controller.js';
import upload from '../../middleware/multer.js';
import { checkRole, protect } from '../../middleware/authMiddleware.js';

const manageAccountRouter = express.Router();

//get account by id
manageAccountRouter.get('/', protect, checkRole('customer', 'admin'), getAccountById)

//update account info
manageAccountRouter.patch('/', protect, checkRole('customer', 'admin'), upload.single('avatar'), updateAccount)

//change password
manageAccountRouter.patch('/changepass', protect, checkRole('customer', 'admin'), changePassword);

//delete account
manageAccountRouter.delete('/', protect, checkRole('customer', 'admin'), deleteAccount);

export default manageAccountRouter;