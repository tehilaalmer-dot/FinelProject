import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';

/**
 * 🔒 1. בדיקה שהמשתמש בכלל מחובר (Authentication)
 * מגן על הראוט ומוודא שיש טוקן (JWT) תקין
 */
export const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            // שומרים את פרטי המשתמש המחובר על ה-req כדי שהקונטרולר ידע מי מבצע את הפעולה
            req.user = decoded;
            return next();
        } catch (error) {
            return res.status(401).json({ error: "אינך מורשה, הטוקן פג תוקף או שגוי" });
        }
    }

    if (!token) {
        return res.status(401).json({ error: "גישה נדחתה, לא נשלח טוקן אבטחה" });
    }
};

/**
 * 🔑 2. בדיקת תפקיד המשתמש (Authorization)
 * חוסם גישה דינמית לפי התפקידים שתגדירי לו בראוטר!
 */
export const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({ error: "שגיאת שרת: יש להריץ אימות protect לפני בדיקת תפקיד" });
        }

        // בדיקה אם תפקיד המשתמש (למשל 'dayar' או 'vaad') מורשה לבצע את הפעולה
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `גישה חסומה! הפעולה מיועדת רק לדרג: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};