import express from 'express';
import ticketController from '../controllers/ticketController.js'; // שימי לב להוסיף סיומת .js ב-import

const router = express.Router();

// הנתיבים שלך
router.get('/building/:buildingId', ticketController.getBuildingTickets);
router.get('/tenant/:tenantId', ticketController.getTenantTickets);
router.post('/create', ticketController.createNewTicket);
router.patch('/status/:ticketId', ticketController.changeStatus);

export default router;