import db from'../config/db.js';

const Ticket = {
    // 1. שליפת כל הפניות של בניין מסוים (בשביל ועד הבית)
getTicketsByBuilding: async (buildingId) => {
    const query = `
        SELECT t.*, u.full_name AS tenant_name 
        FROM private_tickets t
        JOIN users u ON t.tenant_id = u.idusers
        WHERE t.building_id = ?
        ORDER BY t.created_at DESC
    `;
    const [rows] = await db.query(query, [buildingId]);
    return rows;
},

    // 2. שליפת פניות של דייר ספציפי (בשביל הדייר שרוצה לראות את הפניות שלו)
    getTicketsByTenant: async (tenantId) => {
        const query = 'SELECT * FROM private_tickets WHERE tenant_id = ? ORDER BY created_at DESC';
        const [rows] = await db.query(query, [tenantId]);
        return rows;
    },

    // 3. יצירת פנייה חדשה על ידי דייר
    createTicket: async (buildingId, tenantId, ticketType, title, description, imagePath) => {
        const query = `
            INSERT INTO private_tickets (building_id, tenant_id, ticket_type, title, description, image_path) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [buildingId, tenantId, ticketType, title, description, imagePath || null]);
        return result;
    },

    // 4. עדכון סטטוס הפנייה (למשל מ-'open' ל-'resolved' על ידי הוועד)
    updateTicketStatus: async (ticketId, status) => {
        const query = 'UPDATE private_tickets SET status = ? WHERE id = ?';
        const [result] = await db.query(query, [status, ticketId]);
        return result;
    }
};

export default Ticket;