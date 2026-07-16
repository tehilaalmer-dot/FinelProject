import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import expenseController from '../controllers/expenseController.js'; 
import { protect, restrictTo } from '../middleware/authMiddleware.js';
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads/receipts');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${timestamp}_${safeName}`);
    }
});

const upload = multer({ storage });

// נתיב ליצירת הוצאה חדשה (POST)
router.post('/create', protect, restrictTo('vaad'), upload.single('receipt'), expenseController.createExpense);

// נתיב לקבלת כל ההוצאות של בניין ספציפי (GET)
// מאפשר גם לדיירים לראות את הוצאות הבניין כדי לשלם
router.get('/building/:buildingId', protect, expenseController.getBuildingExpenses);
console.log("➡️ הגיע לראוטר! גוף הבקשה:", router);

export default router;