import express from 'express';
const router = express.Router();
import buildingsController from './CONTROLLERS/buildingsController.js';

router.get('/buildings', buildingsController.getAllBuildings);
export default router;