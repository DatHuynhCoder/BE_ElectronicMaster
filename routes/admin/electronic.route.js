import express from 'express';
import upload from '../../middleware/multer.js';
import { createElectronic, deleteElectronic, updateElectronic, getAllElectronics, deleteElectronicImg } from '../../controllers/admin/electronic.controller.js';
import { protect, checkRole } from '../../middleware/authMiddleware.js';

const electronicRouter = express.Router();

//create a new electronic
electronicRouter.post('/', upload.fields([{ name: "electronicImgs", maxCount: 4 }]), protect, checkRole('admin'), createElectronic)

//update electronic
electronicRouter.patch('/:id', upload.fields([{ name: "electronicImgsFiles", maxCount: 4 }]), protect, checkRole('admin'), updateElectronic)

//delete electronic
electronicRouter.delete('/:id', protect, checkRole('admin'), deleteElectronic)

//get all electronics
electronicRouter.get('/', protect, checkRole('admin'), getAllElectronics);

//delete single image from electronic
electronicRouter.post('/delete-image/:id', protect, checkRole('admin'), deleteElectronicImg);

export default electronicRouter;