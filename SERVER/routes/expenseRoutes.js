import express from 'express';
import expenseController from '../controllers/expenseController.js'; 

const router = express.Router();

// נתיב ליצירת הוצאה חדשה (POST)
router.post('/create', expenseController.createExpense);

// נתיב לקבלת כל ההוצאות של בניין ספציפי (GET)
router.get('/building/:buildingId', expenseController.getBuildingExpenses);

export default router;