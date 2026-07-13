import express from 'express';
import cors from 'cors';
import db from './db.js'; // נקודה וסלאש בתחילת הנתיב
// תמחקי את ה- .js מאמצע הנתיב ותוודאי שהוא נמצא רק בסוף!
import buildingsRouter from './ROUTES.js'; // נקודה וסלאש בתחילת הנתיב
const app = express();
app.use(cors());
app.use(express.json());

// 4. חיבור הראוטר לאפליקציה עם הקידומת /api
// זה מה שיגרום ל- http://localhost:3000/api/buildings לעבוד!
app.use('/api', buildingsRouter);

// נתיב לבדיקת חיבור למסד הנתונים
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1');
        res.json({ message: "החיבור למסד הנתונים עובד מצוין!" });
    } catch (err) {
        res.status(500).json({ error: "החיבור נכשל", details: err });
    }
});

// 5. הרמת השרת
app.listen(3000, () => {
    console.log('השרת רץ על פורט 3000');
});