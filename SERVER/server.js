import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/db.js';
import Ticket from './models/ticketModel.js'; // הוספנו ייבוא של המודל
import Building from './models/modleBuilding.js';
import { protect } from './middleware/authMiddleware.js';

// נתיבים
import buildingRoutes from './routes/buildingRoutes.js';
import buildingAnnouncementsRouter from './routes/buildingAnnouncementsRouter.js';
import usersRouter from './routes/usersRouter.js';
import ticketRoutes from './routes/ticketRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Static files directory:", path.join(__dirname, 'uploads'));
// נוודא שהנתיב לתיקיית הקבצים מוגדר בצורה רחבה
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
    if (req.url.startsWith('/uploads')) {
        console.log("📥 ניסיון גישה לקובץ:", req.url);
    }
    next();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());


// הגדרת הנתיבים
app.use('/api', buildingRoutes);
app.use('/api', buildingAnnouncementsRouter);
app.use('/api', usersRouter);
app.use('/api/tickets', ticketRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);


// לוגיקת הסוקט - כאן אנחנו מנהלים את ההודעות ישירות
io.on('connection', (socket) => {
    console.log("משתמש מחובר לשרת הסוקטים:", socket.id);

    // הצטרפות לחדר של טיקט ספציפי
    socket.on('join_ticket', (data) => {
        socket.join(data.ticket_id);
        console.log(`Socket ${socket.id} joined ticket ${data.ticket_id}`);
    });

    // שליחת הודעה ושמירה ב-DB
    // בתוך index.js (לוגיקת ה-Socket)
socket.on('send_message', async (data) => {
    const { ticket_id, message, sender_role } = data; // ודאי שזה השם שנשלח מהלקוח
    
    try {
        // מעבירים את sender_role שקיבלנו מהלקוח לפונקציה
        await Ticket.appendMessage(ticket_id, sender_role, message);
        
        io.to(ticket_id).emit('receive_message', {
            ticket_id,
            message,
            sender_role: sender_role, // מעבירים ללקוח את התפקיד
            timestamp: new Date()
        });
    } catch (err) {
        console.error("שגיאה:", err);
    }
});

    socket.on('disconnect', () => {
        console.log("משתמש התנתק");
    });
});

server.listen(3000, () => {
    console.log('השרת והסוקט רצים יחד על פורט 3000');
});