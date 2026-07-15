import db from '../config/db.js';
const user = {
    // שליפת כל המשתמשים
    getAllUsers: async () => {
        const [rows] = await db.query('SELECT * FROM users');
        console.log("➡️ הגיע למודל! גוף הבקשה:", rows);
        return rows;
    },
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM users WHERE idusers = ?', [id]);
        return rows[0]; // מחזיר את האיבר הראשון או undefined
    },
    // פונקציה למציאת משתמש לפי אימייל
getByEmail: async (email) => {
    const [rows] = await db.query(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );
    return rows[0]; // מחזיר את המשתמש אם נמצא, או undefined אם לא נמצא
},
   create: async (userData) => {
    // שליפת הנתונים עם ערכי ברירת מחדל כדי למנוע קריסות של ה-SQL
    const { 
        full_name, 
        email, 
        user_password, 
        phone = null, 
        apartmentnumber = null, 
        floor = null, 
        role, 
        building_id = null, 
        status 
    } = userData;

    const userStatus = status || 'active'; 

    const [result] = await db.query(
        `INSERT INTO users 
        (full_name, email, user_password, phone, apartmentnumber, floor, role, status, building_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [full_name, email, user_password, phone, apartmentnumber, floor, role, userStatus, building_id]
    );

    return { 
        idusers: result.insertId, 
        full_name, 
        email, 
        phone, 
        apartmentnumber, 
        floor, 
        role, 
        status: userStatus,
        building_id 
    };
}
};

export default user;
