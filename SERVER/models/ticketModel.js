import db from '../config/db.js';

const Ticket = {
    // ... שאר הפונקציות (getTicketsByBuilding, getTicketsByTenant, createTicket, getById, updateTicketStatus)
    // נשארות ללא שינוי, רק תוודאי שהפונקציה getById מחזירה גם את chat_log (ה-SELECT * עושה זאת אוטומטית)

    /**
     * פונקציה חדשה: הוספת הודעה ל-chat_log של טיקט קיים
     */
   // בתוך ticketModel.js - הפונקציה appendMessage
appendMessage: async (ticketId, senderRole, message) => {
    const [rows] = await db.query('SELECT chat_log FROM private_tickets WHERE id = ?', [ticketId]);
    
    // בטיחות: אם אין עדיין log, נתחיל ממערך ריק
    let messages = (rows[0] && rows[0].chat_log) ? JSON.parse(rows[0].chat_log) : [];

    messages.push({
        // אנחנו שומרים את השם senderRole כי זה מה שהלקוח שלך מצפה לו
        senderRole: senderRole, 
        message: message,
        timestamp: new Date().toISOString()
    });

    await db.query('UPDATE private_tickets SET chat_log = ? WHERE id = ?', [JSON.stringify(messages), ticketId]);
},

    // הפונקציות הקיימות:
    getTicketsByBuilding: async (buildingId) => {
        const query = `
            SELECT t.*, u.full_name AS tenant_name, u.apartmentnumber AS apartment_number
            FROM private_tickets t
            JOIN users u ON t.tenant_id = u.idusers
            WHERE t.building_id = ?
            ORDER BY t.created_at DESC
        `;
        const [rows] = await db.query(query, [buildingId]);
        return rows;
    },

    getTicketsByTenant: async (tenantId) => {
        const query = `
            SELECT * FROM private_tickets
            WHERE tenant_id = ?
            ORDER BY created_at DESC
        `;
        const [rows] = await db.query(query, [tenantId]);
        return rows;
    },

    createTicket: async (buildingId, tenantId, ticketType, title, description, imagePath) => {
        // כאן הוספנו chat_log ריק בהתחלה
        const query = `
            INSERT INTO private_tickets (building_id, tenant_id, ticket_type, title, description, image_path, chat_log)
            VALUES (?, ?, ?, ?, ?, ?, '[]')
        `;
        const [result] = await db.query(query, [
            buildingId,
            tenantId,
            ticketType,
            title,
            description,
            imagePath || null,
        ]);
        return result;
    },

    getById: async (ticketId) => {
        const query = 'SELECT * FROM private_tickets WHERE id = ?';
        const [rows] = await db.query(query, [ticketId]);
        return rows[0];
    },

    updateTicketStatus: async (ticketId, status) => {
        const query = 'UPDATE private_tickets SET status = ? WHERE id = ?';
        const [result] = await db.query(query, [status, ticketId]);
        return result;
    },
};

export default Ticket;