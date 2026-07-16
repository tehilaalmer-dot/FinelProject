import Ticket from '../models/ticketModel.js';

const ALLOWED_TICKET_TYPES = ['maintenance', 'complaint', 'other'];
const ALLOWED_STATUSES = ['open', 'in_progress', 'resolved'];

const ticketController = {
    getBuildingTickets: async (req, res) => {
        const { buildingId } = req.params;
        if (req.user.role !== 'vaad' || String(req.user.building_id) !== String(buildingId)) {
            return res.status(403).json({ message: 'אין הרשאה לצפות בפניות הבניין' });
        }
        try {
            const tickets = await Ticket.getTicketsByBuilding(buildingId);
            res.status(200).json(tickets);
        } catch (error) {
            res.status(500).json({ message: 'שגיאה בקבלת פניות', error: error.message });
        }
    },

    getTenantTickets: async (req, res) => {
        const { tenantId } = req.params;
        if (String(req.user.id) !== String(tenantId) && req.user.role !== 'vaad') {
            return res.status(403).json({ message: 'אין הרשאה' });
        }
        try {
            const tickets = await Ticket.getTicketsByTenant(tenantId);
            res.status(200).json(tickets);
        } catch (error) {
            res.status(500).json({ message: 'שגיאה', error: error.message });
        }
    },

createNewTicket: async (req, res) => {
    // 1. קחי את כל הערכים מתוך ה-body, כולל ה-building_id שנשלח מהטופס
    const { ticket_type, title, description, image_path, building_id } = req.body;
    
    // 2. בדיקה: אם לא הגיע building_id מהגוף, קחי מה-user (גיבוי)
    const finalBuildingId = building_id || req.user.building_id;

    console.log("--- מנסה ליצור טיקט חדש ---");
    console.log("buildingId סופי לשימוש:", finalBuildingId);
    console.log("tenantId:", req.user.id);

    if (!title || !description || !ticket_type) 
        return res.status(400).json({ message: 'נא למלא שדות חובה' });
    
    try {
        // 3. תשתמשי ב-finalBuildingId שחילצנו
        const result = await Ticket.createTicket(
            finalBuildingId, 
            req.user.id, 
            ticket_type, 
            title, 
            description, 
            image_path
        );
        res.status(201).json({ message: 'הפנייה נפתחה!', ticketId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'שגיאה', error: error.message });
    }
},

    getTicketMessages: async (req, res) => {
        const { ticketId } = req.params;
        try {
            const ticket = await Ticket.getById(ticketId);
            if (!ticket) return res.status(404).json({ message: 'לא נמצא' });

            const isOwner = String(ticket.tenant_id) === String(req.user.id);
            const isVaad = req.user.role === 'vaad' && String(ticket.building_id) === String(req.user.building_id);

            if (!isOwner && !isVaad) return res.status(403).json({ message: 'אין הרשאה' });

            const messages = ticket.chat_log ? JSON.parse(ticket.chat_log) : [];
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ message: 'שגיאה', error: error.message });
        }
    },

    changeStatus: async (req, res) => {
        const { ticketId } = req.params;
        const { status } = req.body;
        if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ message: 'סטטוס לא תקין' });
        
        try {
            await Ticket.updateTicketStatus(ticketId, status);
            res.status(200).json({ message: 'עודכן בהצלחה' });
        } catch (error) {
            res.status(500).json({ message: 'שגיאה', error: error.message });
        }
    }
};

export default ticketController;