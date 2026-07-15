import db from '../config/db.js';
const Building = {
    // שליפת כל הבניינים
    getAllBuildings: async () => {
        const [rows] = await db.query('SELECT * FROM buildings');
        return rows;
    },
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM buildings WHERE idbuildings = ?', [id]);
        return rows[0]; // מחזיר את האיבר הראשון או undefined
    },
    create: async (buildingData) => {
        const { address, city, num_apartments } = buildingData;
        const [result] = await db.query(
            'INSERT INTO buildings (address, city, num_apartments) VALUES (?, ?, ?)',
            [address, city, num_apartments]
        );
        return { idbuildings: result.insertId, address, city, num_apartments };
    },
    delete: async (id) => {
    const [result] = await db.query('DELETE FROM buildings WHERE idbuildings = ?', [id]);
    return result;
}
};

export default Building;
