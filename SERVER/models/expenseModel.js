import db from '../config/db.js'; // ודאי שנתיב החיבור למסד הנתונים שלך נכון

const Expense = {
    // 1. יצירת הוצאה חדשה בבניין
    create: async (expenseData) => {
        const { building_id, title, amount, expense_date, receipt_path } = expenseData;
        const query = `
            INSERT INTO expenses (building_id, title, amount, expense_date, receipt_path)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [building_id, title, amount, expense_date, receipt_path]);
        return result.insertId; // מחזיר את ה-ID של ההוצאה החדשה שנוצרה
    },

    // 2. שליפת כל ההוצאות של בניין מסוים (מסודר מהחדש לישן)
    getByBuilding: async (buildingId) => {
        const query = `
            SELECT * FROM expenses
            WHERE building_id = ?
            ORDER BY expense_date DESC
        `;
        const [rows] = await db.query(query, [buildingId]);
        return rows;
    }
};

export default Expense;