import express from 'express';
import upload from '../../middleware/multer.js';
import { createElectronic, deleteElectronic, updateElectronic } from '../../controllers/admin/electronic.controller.js';
import { protect, checkRole } from '../../middleware/authMiddleware.js';

const electronicRouter = express.Router();

//create a new electronic
electronicRouter.post('/', upload.fields([{ name: "electronicImgs", maxCount: 4 }]), protect, checkRole('admin'), createElectronic)

//update electronic
electronicRouter.patch('/:id', upload.fields([{ name: "electronicImgs", maxCount: 4 }]), protect, checkRole('admin'), updateElectronic)

//delete electronic
electronicRouter.delete('/:id', protect, checkRole('admin'), deleteElectronic)

export default electronicRouter;