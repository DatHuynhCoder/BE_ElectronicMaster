import express from 'express';
import { checkRole, protect } from '../../middleware/authMiddleware.js';
import { createComment, deleteComment, updateComment } from '../../controllers/customer/comment.controller.js';
import upload from '../../middleware/multer.js';

const commentRouter = express.Router();

//create new comment
commentRouter.post('/', upload.fields([{name: "reviewImgs", maxCount: 3}]), protect, checkRole('admin','customer'), createComment);

//Update comment
commentRouter.patch('/', upload.fields([{name: "reviewImgs", maxCount: 3}]), protect, checkRole('admin','customer'), updateComment);

//Delete comment
commentRouter.delete('/', protect, checkRole('admin','customer'), deleteComment);

export default commentRouter;