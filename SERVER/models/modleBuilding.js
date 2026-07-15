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
    // 1. אנחנו מקבלים את הכתובת (בין אם היא נשלחה כ-address או כ-street)
    const { address, street, city, num_apartments } = buildingData;
    
    // נחלץ את הכתובת הנכונה
    const finalStreet = street || address;

    // 2. מריצים את השאילתה מול העמודה הנכונה ב-DB (שהיא street!)
    const [result] = await db.query(
        'INSERT INTO buildings (street, city, num_apartments) VALUES (?, ?, ?)',
        [finalStreet, city, num_apartments]
    );
    
    // 3. מחזירים את האובייקט שנוצר
    return { 
        idbuildings: result.insertId, 
        street: finalStreet, 
        city, 
        num_apartments 
    };
},
    getByStreetAndCity: async (street, city) => {
    const [rows] = await db.query(
        `SELECT * FROM buildings WHERE street = ? AND city = ?`,
        [street, city]
    );
    return rows[0]; // מחזיר את אובייקט הבניין המלא, או undefined אם לא נמצא
}
};

export default Building;
