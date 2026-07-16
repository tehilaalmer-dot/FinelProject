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
    // ב-paymentModel.js (או איפה שהגיוני לך)
    getCollectionStatus: async (buildingId, paymentMonth) => {
         const [rows] = await db.query (`
            SELECT u.name, p.status, p.amount
            FROM users u
            LEFT JOIN payments p ON u.id = p.user_id
            AND p.building_id = ?
            AND p.payment_month = ?
            WHERE u.building_id = ?`, [buildingId, paymentMonth, buildingId]
        );
        return rows;
    }
};

export default Payment;