import db from '../config/db.js';

const user = {
    // שליפת כל המשתמשים
    getAllUsers: async () => {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM users WHERE idusers = ?', [id]);
        return rows[0]; // מחזיר את האיבר הראשון או undefined
    },

    // פונקציה למציאת משתמש לפי אימייל
    // ⚠️ מוסיפים alias: idusers AS id, full_name AS name
    // כדי ששאר הקוד (למשל ב-login) שמצפה לשדות "id" ו-"name" יעבוד,
    // בלי לשנות את שמות העמודות האמיתיים בטבלה
    getByEmail: async (email) => {
        const [rows] = await db.query(
            `SELECT *, idusers AS id, full_name AS name
             FROM users
             WHERE email = ?`,
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
            id: result.insertId,
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

    updateStatus: async (userId, status) => {
        const [result] = await db.query(
            'UPDATE users SET status = ? WHERE idusers = ?',
            [status, userId]
        );
        return result;
    },
    getUsersByBuilding: async (buildingId) => {
        const [rows] = await db.query('SELECT * FROM users WHERE building_id = ?', [buildingId]);
        return rows;
    }
};

export default user;