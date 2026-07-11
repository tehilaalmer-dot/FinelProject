import express from 'express';
import db from './db.js';
const app = express();

app.use(express.json());

// נתיב לבדיקת חיבור למסד הנתונים
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1');
        res.json({ message: "החיבור למסד הנתונים עובד מצוין!" });
    } catch (err) {
        res.status(500).json({ error: "החיבור נכשל", details: err });
    }
});

app.listen(3000, () => {
    console.log('השרת רץ על פורט 3000');
});