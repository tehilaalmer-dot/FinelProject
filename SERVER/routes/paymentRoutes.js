import express from 'express';
import paymentsController from '../controllers/paymentsController.js';

const router = express.Router();

router.get('/building/:building_id', paymentsController.getBuildingPayments);
router.get('/user/:user_id', paymentsController.getUserPayments);

export default router;