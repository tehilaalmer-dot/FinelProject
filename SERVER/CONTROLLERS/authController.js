import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../models/modelusers.js';
import buildingModel from '../models/modlebuilding.js';

// הגדרת המפתח הסודי לחתימת הטוקנים
console.log("➡️ JWT_SECRET:", process.env.JWT_SECRET);
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';
const authController = {
    // 1. פונקציית ההרשמה (מצפינה סיסמה ושומרת ב-DB)
    async register(req, res) {
    const { 
        name, 
        full_name, 
        email, 
        password, 
        user_password, 
        phone, 
        apartmentnumber, 
        floor, 
        role,               // 'vaad' או 'dayar'
        city,               
        street_and_number,  
        status 
    } = req.body;

    const finalName = name || full_name;
    const finalPassword = password || user_password;

    // 1. ולידציה בסיסית - בדיקת שדות חובה
    if (!finalName || !email || !finalPassword || !role || !city || !street_and_number) {
        return res.status(400).json({ message: "נא למלא את כל שדות החובה כולל עיר וכתובת בניין" });
    }

    // 2. בדיקת אורך סיסמה - חייבת להיות מעל 6 תווים (לפחות 7 תווים)
    if (String(finalPassword).length < 6) {
        return res.status(400).json({ message: "על הסיסמה להכיל מעל ל-6 תווים" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "כתובת האימייל אינה תקינה" });
}
if (apartmentnumber && (isNaN(apartmentnumber) || apartmentnumber <= 0)) {
    return res.status(400).json({ message: "מספר דירה חייב להיות מספר חיובי" });
}

// קומה יכולה להיות 0 (קרקע), אבל לא שלילית (אלא אם יש לכן דירות מרתף, ואז אפשר להחליט בהתאם)
if (floor && (isNaN(floor) || floor < 0)) {
    return res.status(400).json({ message: "מספר קומה אינו תקין" });
}
const phoneRegex = /^05\d{8}$/;
if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({ message: "מספר הטלפון אינו תקין. עליו להיות מספר סלולרי ישראלי (למשל 0501234567)" });
}

    try {
        // 3. בדיקה האם המשתמש (אימייל) כבר רשום במערכת
        const existingUser = await userModel.getByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "כתובת האימייל הזו כבר רשומה במערכת" });
        }

        // 4. בדיקה האם הבניין קיים כרגע במערכת
        const building = await buildingModel.getByStreetAndCity(street_and_number, city);
        
        let building_id = null;

        // מפצלים את הלוגיקה לפי תפקיד הנרשם (Role)
       // מפצלים את הלוגיקה לפי תפקיד הנרשם (Role)
        if (role === 'vaad') {
            // --- מקרה א': הנרשם הוא ועד בית ---
            if (building) {
                // אם הבניין כבר קיים, סימן שיש לו כבר ועד בית! נחזיר שגיאה
                return res.status(400).json({ 
                    message: `לא ניתן להירשם כוועד בית. הבניין ברחוב "${street_and_number}" בעיר "${city}" כבר רשום במערכת עם ועד בית פעיל.` 
                });
            } else {
                // אם הבניין לא קיים - ועד הבית יוצר אותו עכשיו!
                const defaultNumApartments = 12; 
                
                // 1. קוראים לפונקציה ושומרים את אובייקט הבניין המלא שחוזר
                const newBuilding = await buildingModel.create({ 
                    street: street_and_number, 
                    city, 
                    num_apartments: defaultNumApartments 
                });
                
                // 2. כאן התיקון החשוב! שולפים רק את ה-ID מתוך האובייקט שחזר
                building_id = newBuilding.idbuildings; 
                
                console.log(`בניין חדש נוצר בהצלחה עם מזהה: ${building_id}`);
            }

        }
         else {
            // --- מקרה ב': הנרשם הוא דייר רגיל (dayar) ---
            if (!building) {
                // דייר לא יכול ליצור בניין חדש
                return res.status(400).json({ 
                    message: `הבניין ברחוב "${street_and_number}" בעיר "${city}" אינו רשום במערכת. לא קיים ועד בית פעיל לבניין זה. אנא פנה לוועד הבית שלך.` 
                });
            } else {
                // הבניין קיים, נשלוף את ה-ID שלו כדי לשייך את הדייר אליו
                building_id = building.idbuildings;
            }
        }

        // 5. הצפנת סיסמת המשתמש החדש
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(finalPassword, salt);

        // 6. יצירת המשתמש החדש במסד הנתונים (ועד הבית או הדייר)
        await userModel.create({
            full_name: finalName,
            email,
            user_password: hashedPassword,
            phone: phone || null,
            apartmentnumber: apartmentnumber || null,
            floor: floor || null,
            role,
            building_id: building_id, // ישויך לבניין הישן (לדייר) או לבניין החדש שנוצר (לוועד)
            status: status || 'active'
        });

       // 5. הצפנת סיסמת המשתמש החדש... (קוד קיים שלכן)
        // 6. יצירת המשתמש החדש במסד הנתונים... (קוד קיים שלכן)
        const newUserResult = await userModel.create({
            full_name: finalName,
            email,
            user_password: hashedPassword,
            phone: phone || null,
            apartmentnumber: apartmentnumber || null,
            floor: floor || null,
            role,
            building_id: building_id,
            status: status || 'active'
        });

        // ==========================================
        // הוספה: יצירת טוקן להתחברות אוטומטית מיד לאחר הרישום
        // ==========================================
        // (ודאו שיש לכן ייבוא של jwt בראש הקובץ: import jwt from 'jsonwebtoken';)
        const userId = newUserResult.insertId; // שליפת ה-ID של המשתמש שנוצר הרגע
        
        const token = jwt.sign(
            { id: userId, role: role, building_id: building_id },
            process.env.JWT_SECRET || 'your_jwt_secret_key', // החליפו במפתח הסודי שלכן
            { expiresIn: '3h' }
        );

        // מחזירים את הטוקן, התפקיד והודעת ההצלחה
        res.status(201).json({ 
            success: true, 
            message: role === 'vaad' 
                ? "הבניין נוצר והוועד נרשם בהצלחה!" 
                : "ההרשמה כדייר בוצעה בהצלחה!",
            token,
            user: {
                id: userId,
                role: role,
                full_name: finalName,
                email: email
            }
        });

    } catch (error) {
        console.error('Error in registration:', error);
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
            const user = await userModel.getByEmail(email);
            if (!user) {
                return res.status(401).json({ message: "אימייל או סיסמה שגויים" });
            }

            // השוואת הסיסמה שהוזנה עם הסיסמה המוצפנת מה-DB
            const isMatch = await bcrypt.compare(password, user.user_password);
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
           // החזרת תשובה לקליינט יחד עם הטוקן
            res.status(200).json({
                success: true,
                message: "התחברת בהצלחה!",
                token,
                user: {
                    id: user.idusers, // מזהה המשתמש בבסיס הנתונים שלכן
                    name: user.full_name, // השם המלא בבסיס הנתונים שלכן
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