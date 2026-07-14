import db from '../config/db.js';
const Building_announcements = {
    // שליפת כל הבניינים
    getAllBuilding_announcements: async () => {
        const [rows] = await db.query('SELECT * FROM building_announcements');
        return rows;
    },
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM building_announcements WHERE idbuilding_announcements = ?', [id]);
        return rows[0]; // מחזיר את האיבר הראשון או undefined
    },
    findByBuildingId: async (buildingId) => {
        const [rows] = await db.query(
            'SELECT * FROM building_announcements WHERE building_id = ? ORDER BY idbuilding_announcements DESC',
            [buildingId]
        );
        return rows;
    },
   create: async (announcementData) => {
        // אנחנו מקבלים את המזהים של הבניין והוועד, ואת התוכן
        const { building_id, vaad_id, content } = announcementData;
        
        const [result] = await db.query(
            'INSERT INTO building_announcements (building_id, vaad_id, content) VALUES (?, ?, ?)',
            [building_id, vaad_id, content]
        );
        
        // מחזירים את האובייקט החדש שנוצר עם ה-ID האוטומטי שלו מהמסד
        return { 
            id: result.insertId, 
            building_id, 
            vaad_id, 
            content 
        };
    }
};

export default Building_announcements;
