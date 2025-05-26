import express from 'express'
import { checkRole, protect } from '../../middleware/authMiddleware.js';
import { getWebStatistics } from '../../controllers/admin/dashboard.controller.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/', protect, checkRole('admin'), getWebStatistics)

export default dashboardRouter;