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
    }
};

export default Payment;