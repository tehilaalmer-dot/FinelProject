import express from 'express';
import expenseController from '../controllers/expenseController.js'; 
import { protect, restrictTo } from '../middleware/authMiddleware.js';
const router = express.Router();

// נתיב ליצירת הוצאה חדשה (POST)
router.post('/create', protect, restrictTo('vaad'), expenseController.createExpense);

// נתיב לקבלת כל ההוצאות של בניין ספציפי (GET)
router.get('/building/:buildingId', protect, restrictTo('vaad','manager'), expenseController.getBuildingExpenses);
console.log("➡️ הגיע לראוטר! גוף הבקשה:", router);

export default router;