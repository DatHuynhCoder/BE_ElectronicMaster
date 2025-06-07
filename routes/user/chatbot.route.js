import express from 'express'
import { searchElectroicWithChatbot, searchSimilarImgs } from '../../controllers/user/chatbot.controller.js';
import upload from '../../middleware/multer.js';

const chatbotRouter = express.Router();

chatbotRouter.post('/searchElec', searchElectroicWithChatbot);

chatbotRouter.post('/searchSimilarImgs', upload.single('file'), searchSimilarImgs)

export default chatbotRouter;