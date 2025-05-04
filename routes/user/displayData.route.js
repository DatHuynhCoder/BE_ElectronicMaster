import express from 'express';
import { getAllCategories, getCommentsByElectronicID, getElectronicById } from '../../controllers/user/displayData.controller.js';

const displayDataRouter = express.Router();

//display electronic by id
displayDataRouter.get('/electronic/:id', getElectronicById)

//display all catergory
displayDataRouter.get('/getAllCate', getAllCategories)

//display comments by electronicID
displayDataRouter.get('/commentsByElectronic/:id', getCommentsByElectronicID);

export default displayDataRouter;