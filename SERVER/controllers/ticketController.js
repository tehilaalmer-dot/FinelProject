import Ticket from '../models/ticketModel.js';

const ticketController = {
    // לקבל את כל הפניות של בניין ספציפי
    getBuildingTickets: async (req, res) => {
        const { buildingId } = req.params;
        try {
            const tickets = await Ticket.getTicketsByBuilding(buildingId);
            res.status(200).json(tickets);
        } catch (error) {
            res.status(500).json({ message: 'שגיאה בקבלת פניות הבניין', error: error.message });
        }
    },

    // לקבל את הפניות של דייר ספציפי בלבד
    getTenantTickets: async (req, res) => {
        const { tenantId } = req.params;
        try {
            const tickets = await Ticket.getTicketsByTenant(tenantId);
            res.status(200).json(tickets);
        } catch (error) {
            res.status(500).json({ message: 'שגיאה בקבלת פניות הדייר', error: error.message });
        }
    },

    // פתיחת פנייה חדשה
    createNewTicket: async (req, res) => {
        const { building_id, tenant_id, ticket_type, title, description, image_path } = req.body;
        try {
            const result = await Ticket.createTicket(building_id, tenant_id, ticket_type, title, description, image_path);
            res.status(201).json({ message: 'הפנייה נפתחה בהצלחה!', ticketId: result.insertId });
        } catch (error) {
            res.status(500).json({ message: 'שגיאה בפתיחת הפנייה', error: error.message });
        }
    },

    // עדכון סטטוס הפנייה
    changeStatus: async (req, res) => {
        const { ticketId } = req.params;
        const { status } = req.body; // מקבלים open, in_progress, או resolved
        try {
            await Ticket.updateTicketStatus(ticketId, status);
            res.status(200).json({ message: 'סטטוס הפנייה עודכן בהצלחה!' });
        } catch (error) {
            res.status(500).json({ message: 'שגיאה בעדכון הסטטוס', error: error.message });
        }
    }
};

export default ticketController;