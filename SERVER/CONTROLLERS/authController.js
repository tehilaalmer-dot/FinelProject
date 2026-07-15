import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/modelusers.js';
// הגדרת המפתח הסודי לחתימת הטוקנים
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';
const authController = {
    // 1. פונקציית ההרשמה (מצפינה סיסמה ושומרת ב-DB)
    async register(req, res) {
        const { name, email, password, role, building_id } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "נא למלא את כל שדות החובה: name, email, password, role" });
        }

        try {
            // בדיקה אם המשתמש כבר קיים
            const existingUser = await User.getByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "כתובת האימייל הזו כבר רשומה במערכת" });
            }

            // הצפנת הסיסמה
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // יצירת המשתמש ב-DB עם הסיסמה המוצפנת
            await User.create({
               full_name: name,
                email,
                user_password: hashedPassword,
                role,
                 building_id: building_id || null
            });

            res.status(201).json({ success: true, message: "ההרשמה בוצעה בהצלחה!" });

        } catch (error) {
            res.status(500).json({ message: "שגיאה בתהליך ההרשמה", error: error.message });
        }
    },
    // 2. פונקציית ההתחברות (בודקת סיסמה ומנפיקה טוקן JWT)
    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "נא למלא אימייל וסיסמה" });
        }

        try {
            // חיפוש המשתמש
            const user = await User.getByEmail(email);
            if (!user) {
                return res.status(401).json({ message: "אימייל או סיסמה שגויים" });
            }

            // השוואת הסיסמה שהוזנה עם הסיסמה המוצפנת מה-DB
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "אימייל או סיסמה שגויים" });
            }

            // יצירת הטוקן
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    role: user.role, 
                    buildingId: user.building_id 
                },
                JWT_SECRET,
                { expiresIn: '24h' } // תוקף ל-24 שעות
            );

            // החזרת תשובה לקליינט יחד עם הטוקן
            res.status(200).json({
                success: true,
                message: "התחברת בהצלחה!",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    building_id: user.building_id
                }
            });

        } catch (error) {
            res.status(500).json({ message: "שגיאה בתהליך ההתחברות", error: error.message });
        }
    }
};

export default authController;