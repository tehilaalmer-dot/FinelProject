import jwt from 'jsonwebtoken';
import Ticket from './models/ticketModel.js';
import TicketMessage from './models/ticketMessageModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';

// פונקציה שמחברת את כל לוגיקת הסוקטים ל-io.
// לקרוא לה מ-server.js אחרי יצירת ה-io: setupSocket(io);
export function setupSocket(io) {

    // 🔒 מידלוור אימות לסוקט - רץ פעם אחת כשלקוח מתחבר
    // מוודא שיש טוקן תקין ושומר את המשתמש על ה-socket (בדיוק כמו req.user ב-Express)
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('לא נשלח טוקן אימות'));
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.user = decoded; // { id, role, building_id }
            next();
        } catch (error) {
            next(new Error('טוקן לא תקין או פג תוקף'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`מחובר לסוקט: ${socket.user.role} (id: ${socket.user.id})`);

        // הצטרפות לחדר של טיקט ספציפי - נדרש כדי לקבל/לשלוח הודעות עליו
        socket.on('join_ticket', async ({ ticket_id }) => {
            try {
                const ticket = await Ticket.getById(ticket_id);
                if (!ticket) return;

                const isOwner = String(ticket.tenant_id) === String(socket.user.id);
                const isVaadOfBuilding =
                    socket.user.role === 'vaad' && String(ticket.building_id) === String(socket.user.building_id);

                if (!isOwner && !isVaadOfBuilding) {
                    return; // בשקט מתעלמים - לא נותנים לאף אחד להצטרף לחדר שלא שייך לו
                }

                socket.join(`ticket_${ticket_id}`);
            } catch (error) {
                console.error('שגיאה בהצטרפות לחדר:', error);
            }
        });

        // שליחת הודעה - ה-sender נקבע מהטוקן (socket.user), לא מהלקוח
        socket.on('send_message', async ({ ticket_id, message }) => {
            if (!message || !ticket_id) return;

            try {
                const ticket = await Ticket.getById(ticket_id);
                if (!ticket) return;

                const isOwner = String(ticket.tenant_id) === String(socket.user.id);
                const isVaadOfBuilding =
                    socket.user.role === 'vaad' && String(ticket.building_id) === String(socket.user.building_id);

                if (!isOwner && !isVaadOfBuilding) return;

                // שמירה ל-DB כדי שההיסטוריה תישאר אחרי רענון
                const saved = await TicketMessage.create(ticket_id, socket.user.role, socket.user.id, message);

                // שליחה רק לחדר של הטיקט הזה - לא broadcast גלובלי
                io.to(`ticket_${ticket_id}`).emit('receive_message', {
                    ticket_id,
                    message: saved.message,
                    sender_role: saved.sender_role,
                    created_at: new Date().toISOString(),
                });
            } catch (error) {
                console.error('שגיאה בשליחת הודעה:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`מנותק מהסוקט: ${socket.user?.role} (id: ${socket.user?.id})`);
        });
    });
}