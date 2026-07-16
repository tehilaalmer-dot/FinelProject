import db from '../config/db.js';

const Payment = {
    // שליפת כל התשלומים של בניין מסוים (עבור ועד הבית)
    getByBuildingId: async (buildingId) => {
        const [rows] = await db.query('SELECT * FROM payments WHERE building_id = ?', [buildingId]);
        return rows;
    },
    // שליפת כל התשלומים של דייר ספציפי
    getByUserId: async (userId) => {
        const [rows] = await db.query('SELECT * FROM payments WHERE user_id = ?', [userId]);
        return rows;
    },
    getCollectionStatus: async (buildingId, paymentMonth) => {
         const [rows] = await db.query (`
            SELECT 
                u.idusers AS user_id,
                u.full_name AS name,
                u.apartmentnumber,
                COALESCE(p.status, 'unpaid') AS status,
                COALESCE(p.amount, 0) AS amount
            FROM users u
            LEFT JOIN payments p ON u.idusers = p.user_id
                AND p.building_id = ?
                AND p.payment_month = ?
            WHERE u.building_id = ?`, [buildingId, paymentMonth, buildingId]
        );
        return rows;
    },
    createOrUpdatePayment: async ({ user_id, building_id, amount, payment_month = null, expense_id = null, status = 'paid', payment_method = 'cash' }) => {
        // אם הוזן expense_id - נסמן/נעדכן תשלום עבור הוצאה ספציפית
        if (expense_id) {
            const [updateResult] = await db.query(
                `UPDATE payments SET status = ?, amount = ?, payment_method = ?
                 WHERE user_id = ? AND expense_id = ?`,
                [status, amount, payment_method, user_id, expense_id]
            );

            if (updateResult.affectedRows > 0) return updateResult.insertId || null;

            const [insertResult] = await db.query(
                `INSERT INTO payments (user_id, building_id, expense_id, amount, payment_month, status, payment_method)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user_id, building_id, expense_id, amount, payment_month, status, payment_method]
            );

            return insertResult.insertId;
        }

        // ברירת מחדל: תשלום לפי חודש גבייה
        const [updateResult] = await db.query(
            `UPDATE payments SET status = ?, amount = ?, payment_method = ?
             WHERE user_id = ? AND building_id = ? AND payment_month = ?`,
            [status, amount, payment_method, user_id, building_id, payment_month]
        );

        if (updateResult.affectedRows > 0) {
            return updateResult.insertId || null;
        }

        const [insertResult] = await db.query(
            `INSERT INTO payments (user_id, building_id, amount, payment_month, status, payment_method)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, building_id, amount, payment_month, status, payment_method]
        );

        return insertResult.insertId;
    },
    // שליפת תשלומים עבור הוצאה ספציפית
    getByExpenseId: async (expenseId) => {
        try {
            const [rows] = await db.query('SELECT * FROM payments WHERE expense_id = ?', [expenseId]);
            return rows;
        } catch (err) {
            if (err && err.sqlMessage && err.sqlMessage.includes('Unknown column')) {
                return [];
            }
            throw err;
        }
    },
    // בדיקת סטטוס תשלום של משתמש מסוים להוצאה ספציפית
    getPaymentForUserExpense: async (userId, expenseId) => {
        try {
            const [rows] = await db.query('SELECT * FROM payments WHERE user_id = ? AND expense_id = ?', [userId, expenseId]);
            return rows[0] || null;
        } catch (err) {
            if (err && err.sqlMessage && err.sqlMessage.includes('Unknown column')) {
                return null;
            }
            throw err;
        }
    }
    ,
    // שליפת מצב גבייה (paid/unpaid) לכל דייר עבור הוצאה ספציפית
    getExpenseCollectionStatus: async (expenseId) => {
        // מוציאים את מזהה הבניין מההוצאה ואז עושים LEFT JOIN עם users
        const [expenseRows] = await db.query('SELECT building_id, amount FROM expenses WHERE id = ?', [expenseId]);
        if (!expenseRows || expenseRows.length === 0) return [];
        const buildingId = expenseRows[0].building_id;

        const [rows] = await db.query(`
            SELECT
                u.idusers AS user_id,
                u.full_name AS name,
                u.apartmentnumber,
                COALESCE(p.status, 'unpaid') AS status,
                COALESCE(p.amount, ?) AS amount
            FROM users u
            LEFT JOIN payments p ON u.idusers = p.user_id AND p.expense_id = ?
            WHERE u.building_id = ?
            ORDER BY u.apartmentnumber + 0
        `, [expenseRows[0].amount || 0, expenseId, buildingId]);

        return rows;
    }
};

export default Payment;