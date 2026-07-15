import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();
console.log("➡️ הגיע לראוטר authRoutes! גוף הבקשה:", router);
// נתיב להרשמה
router.post('/register', authController.register);

// נתיב להתחברות
router.post('/login', authController.login);

export default router;