import userModel from '../models/modelusers.js'; // ודאי שהנתיב והשם של קובץ המודל שלך מדויקים!

// 1. שליפת כל המשתמשים
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        
        // אבטחה: הסרת הסיסמה מכל המשתמשים לפני שליחתם לקליינט
        const safeUsers = users.map(({ user_password, ...safeUser }) => safeUser);
        
        res.json(safeUsers);
        console.log("➡️ הגיע לקונטרולר! גוף הבקשה:", req.body);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'שגיאה בשליפת המשתמשים', details: error.message });
    }
};

// 2. שליפת משתמש ספציפי לפי מזהה (idusers)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params; // מקבל את ה-ID מתוך הנתיב (URL params)
        const foundUser = await userModel.findById(id);
        
        if (!foundUser) {
            return res.status(404).json({ error: 'המשתמש המבוקש לא נמצא' });
        }
        
        // אבטחה: הסרת הסיסמה מהמשתמש הספציפי
        const { user_password, ...safeUser } = foundUser;
        
        res.json(safeUser);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ error: 'שגיאה בשליפת פרטי המשתמש', details: error.message });
    }
};

// 3. יצירת משתמש חדש (הרשמה)
const createUser = async (req, res) => {
    try {
        const { 
            full_name, 
            email, 
            user_password, 
            phone, 
            apartmentnumber, 
            floor, 
            role, 
            building_id,
            status 
        } = req.body;

        // ולידציה בסיסית: בדיקה ששדות החובה הנדרשים אכן נשלחו
        if (!full_name || !email || !user_password || !role || !building_id) {
            return res.status(400).json({ 
                error: 'נא למלא את כל שדות החובה: שם מלא, אימייל, סיסמה, תפקיד וקוד בניין' 
            });
        }

        // שליחת הנתונים ליצירה במודל
        const newUser = await userModel.create({
            full_name,
            email,
            user_password,
            phone,
            apartmentnumber,
            floor,
            role,
            building_id,
            status
        });

        // החזרת תשובה מוצלחת (201 Created) עם פרטי המשתמש החדש (המודל כבר מחזיר אותו ללא סיסמה)
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'שגיאה ביצירת המשתמש החדש', details: error.message });
    }
};

export default {
    getAllUsers,
    getUserById,
    createUser
};