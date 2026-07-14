import Expense from '../models/expenseModel.js';

const expenseController = {
    // יצירת הוצאה חדשה
    createExpense: async (req, res) => {
        try {
            const { building_id, title, amount, expense_date, receipt_path } = req.body;

            // ולידציה בסיסית - לוודא ששדות החובה נשלחו
            if (!building_id || !title || !amount || !expense_date) {
                return res.status(400).json({ message: 'נא למלא את כל שדות החובה: בניין, כותרת, סכום ותאריך.' });
            }

            const newExpenseId = await Expense.create({
                building_id,
                title,
                amount,
                expense_date,
                receipt_path: receipt_path || null // קבלה היא אופציונלית
            });

            res.status(201).json({
                message: 'ההוצאה נרשמה בהצלחה בקופת הבניין!',
                expenseId: newExpenseId
            });
        } catch (error) {
            console.error('שגיאה ביצירת הוצאה:', error);
            res.status(500).json({ message: 'שגיאה פנימית בשרת בעת יצירת ההוצאה', error: error.message });
        }
    },

    // קבלת כל ההוצאות של בניין מסוים
    getBuildingExpenses: async (req, res) => {
        try {
            const { buildingId } = req.params;
            console.log("➡️ הגיע לקונטרולר! מזהה הבניין:", buildingId);
            const expenses = await Expense.getByBuilding(buildingId);
            res.status(200).json(expenses);
        } catch (error) {
            console.error('שגיאה בשליפת הוצאות:', error);
            res.status(500).json({ message: 'שגיאה פנימית בשרת בעת שליפת ההוצאות', error: error.message });
        }
    }
};

export default expenseController;