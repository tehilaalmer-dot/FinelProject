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
   create: async (userData) => {
    const { 
        full_name, 
        email, 
        user_password, 
        phone, 
        apartmentnumber, 
        floor, 
        role, 
        building_id, // מתקבל מהטופס ב-Frontend
        status 
    } = userData;

    // קביעת סטטוס ברירת מחדל אם לא נשלח סטטוס ספציפי
    const userStatus = status || 'active'; // או 'active' בהתאם להחלטה שלך

    const [result] = await db.query(
        `INSERT INTO users 
        (full_name, email, user_password, phone, apartmentnumber, floor, role, status, building_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [full_name, email, user_password, phone, apartmentnumber, floor, role, userStatus, building_id]
    );

    // טיפ אבטחה: מחזירים את האובייקט שנוצר, אבל *בלי* הסיסמה (לא בריא להחזיר סיסמה בקליינט!)
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
},
getByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0]; // מחזיר את המשתמש או undefined אם הוא לא קיים
},
updateStatus: async (userId, status) => {
    const [result] = await db.query(
        'UPDATE users SET status = ? WHERE idusers = ?',
        [status, userId]
    );
    return result;
}
};

export default user;
