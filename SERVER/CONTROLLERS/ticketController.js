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
    // allow vaad to create on behalf of tenant by passing tenant_id
    const { ticket_type, title, description, image_path, building_id, tenant_id } = req.body;
    const finalBuildingId = building_id || req.user.building_id;

    // determine tenant id: if vaad provided tenant_id use it, otherwise use req.user.id
    let finalTenantId = req.user.id;
    if (tenant_id && req.user.role === 'vaad') {
        finalTenantId = tenant_id;
    }

    if (!title || !description || !ticket_type) 
        return res.status(400).json({ message: 'נא למלא שדות חובה' });

    try {
        const result = await Ticket.createTicket(
            finalBuildingId,
            finalTenantId,
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