import express from 'express'
import { checkRole, protect } from '../../middleware/authMiddleware.js';
import { addFavorite, checkFavorite, deleteFavortie, getFavorite } from '../../controllers/customer/favorite.controller.js';

const favoriteRouter = express.Router();

//Add to favorite
favoriteRouter.post('', protect, checkRole('admin', 'customer'), addFavorite)

//Remove from favorite
favoriteRouter.delete('/', protect, checkRole('admin','customer'), deleteFavortie)

//Get all favorite
favoriteRouter.get('/', protect, checkRole('admin','customer'), getFavorite)

//Check if electronic in favorite
favoriteRouter.get('/check', protect, checkRole('admin', 'customer'), checkFavorite)

export default favoriteRouter;