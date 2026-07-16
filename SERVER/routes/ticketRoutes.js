import express from 'express';
import ticketController from '../controllers/ticketController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
const router = express.Router();

// רק ועד רואה את כל הפניות של הבניין
router.get('/building/:buildingId', protect, restrictTo('vaad'), ticketController.getBuildingTickets);

// דייר רואה רק את הפניות שלו; ועד יכול גם (הבדיקה המדויקת קורית בקונטרולר)
router.get('/tenant/:tenantId', protect, restrictTo('vaad', 'dayar'), ticketController.getTenantTickets);

// רק דייר פותח פנייה חדשה בשם עצמו
router.post('/create', protect, restrictTo('dayar'), ticketController.createNewTicket);

// רק ועד מעדכן סטטוס
router.patch('/status/:ticketId', protect, restrictTo('vaad'), ticketController.changeStatus);

// היסטוריית הודעות - גם דייר וגם ועד (בדיקת בעלות מדויקת בקונטרולר)
router.get('/:ticketId/messages', protect, restrictTo('vaad', 'dayar'), ticketController.getTicketMessages);

export default router;