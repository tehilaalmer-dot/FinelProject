import express from 'express';
import ticketController from '../controllers/ticketController.js'; // שימי לב להוסיף סיומת .js ב-import
import { protect, restrictTo } from '../middleware/authMiddleware.js';
const router = express.Router();

// הנתיבים שלך
router.get('/building/:buildingId', protect, restrictTo('vaad', 'dayar'), ticketController.getBuildingTickets);
router.get('/tenant/:tenantId', protect, restrictTo('vaad', 'dayar'), ticketController.getTenantTickets);
router.post('/create', protect, restrictTo('vaad', 'dayar'), ticketController.createNewTicket);
router.patch('/status/:ticketId', protect, restrictTo('vaad', 'dayar'), ticketController.changeStatus);

export default router;