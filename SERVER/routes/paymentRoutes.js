import express from 'express';
import paymentsController from '../controllers/paymentsController.js';

const router = express.Router();

router.get('/building/:building_id', paymentsController.getBuildingPayments);
router.get('/user/:user_id', paymentsController.getUserPayments);
router.get('/collection/:buildingId/:paymentMonth', paymentsController.getCollectionStatus);
export default router;