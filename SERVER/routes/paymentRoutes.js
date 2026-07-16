import express from 'express';
import paymentsController from '../controllers/paymentsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/building/:building_id', protect, restrictTo('vaad', 'manager'), paymentsController.getBuildingPayments);
router.get('/user/:user_id', protect, restrictTo('vaad', 'manager'), paymentsController.getUserPayments);
router.get('/collection/:buildingId/:paymentMonth', protect, restrictTo('vaad', 'manager'), paymentsController.getCollectionStatus);
router.post('/mark-paid', protect, restrictTo('vaad'), paymentsController.markPaymentPaid);
router.post('/pay-expense', protect, paymentsController.payExpense);
router.get('/expense/:expenseId/collection', protect, restrictTo('vaad', 'manager'), paymentsController.getExpenseCollectionStatus);
router.get('/expense/:expenseId/status', protect, paymentsController.getUserExpenseStatus);
export default router;