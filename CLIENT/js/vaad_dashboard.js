// הגדרת החיבור לשרת
// בראש הקובץ vaad_dashboard.js
// הגדרת החיבור לסוקט בצורה בטוחה
let socket; // משתמשים ב-let כדי שנוכל להציב בו ערך

if (!window.socketInstance) {
    window.socketInstance = io('http://localhost:3000', {
        transports: ['websocket'],
        upgrade: false
    });
    console.log("נוצר חיבור סוקט חדש");
}

socket = window.socketInstance; // הצבה לתוך ה-let
const token = localStorage.getItem('token'); // ודאי שהטוקן קיים

// אלמנטים מהדף
const sendBtn = document.getElementById('sendVaadMsg');
const msgInput = document.getElementById('vaadMsgInput');
const chatMessages = document.getElementById('chat-messages');
let currentTicketId = null;

// פונקציית עזר להוספת הודעה למסך
function appendMessage(message, senderRole) {
    const msgDiv = document.createElement('div');
    // ה-Class יהיה 'msg vaad' או 'msg tenant'
 
    msgDiv.className = (senderRole === 'vaad') ? 'msg-vaad' : 'msg-tenant';
    msgDiv.textContent = message;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 1. האזנה להודעות נכנסות מהסוקט
socket.on('receive_message', (data) => {
    // בדיקה: האם ההודעה שייכת לטיקט הפתוח?
    if (String(data.ticket_id) === String(currentTicketId)) {
        // בשרת הקוד שלך שולח sender_role, אז אנחנו משתמשים בזה
        appendMessage(data.message, data.sender_role);
    }
});

// 2. פתיחת צ'אט (נקראת מה-HTML כשלוחצים על שורה בטבלה)
function openChat(ticketId) {
    currentTicketId = ticketId;
    chatMessages.innerHTML = ''; // ניקוי צ'אט קודם
    document.getElementById('chat-section').style.display = 'grid';
    
    // הצטרפות לחדר בשרת
    socket.emit('join_ticket', { ticket_id: ticketId });
    
    // טעינת היסטוריה
    loadMessageHistory(ticketId);
}

// 3. טעינת היסטוריה מה-API
async function loadMessageHistory(ticketId) {
    console.log("פונקציית הטעינה הופעלה עבור טיקט:", ticketId); // נוודא שהיא בכלל רצה
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("קיבלנו תשובה מהשרת, סטטוס:", response.status); // נבדוק אם השרת עונה

        if (!response.ok) {
            console.error("שגיאת שרת:", response.statusText);
            return;
        }

        const messages = await response.json();
        console.log("ההודעות שהתקבלו:", messages);
        
        chatMessages.innerHTML = '';
        messages.forEach(m => {
            appendMessage(m.message, m.sender_role);
        });
    } catch (err) {
        console.error('שגיאה קריטית בטעינת היסטוריה:', err); // נראה אם משהו נזרק ל-catch
    }
}

// 4. שליחת הודעה
sendBtn.addEventListener('click', async () => {
    const message = msgInput.value;
    if (!message || !currentTicketId) return;

    socket.emit('send_message', {
        ticket_id: currentTicketId,
        message: message,
        sender_role: 'vaad' // אנחנו תמיד 'vaad' בדף הזה
    });

    // הוספה מידית למסך
    appendMessage(message, 'vaad');
    msgInput.value = '';
});
// פונקציה למשיכת כל התקלות של הבניין
async function fetchTickets() {
    try {
    // 1. קודם שולפים את האובייקט user מה-LocalStorage
const userString = localStorage.getItem('user');
const user = JSON.parse(userString); // הופכים את הטקסט לאובייקט שאפשר לעבוד איתו

// 2. עכשיו אפשר לגשת ל-building_id
const buildingId = user.building_id; 

// 3. עכשיו ה-fetch יעבוד עם המספר 3
const response = await fetch(`http://localhost:3000/api/tickets/building/${buildingId}`, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
});
      

        if (!response.ok) throw new Error('שגיאה בטעינת הטיקטים');

        const tickets = await response.json();

        // מציאת גוף הטבלה ב-HTML (תוודאי שיש לו ID מתאים)
        const tbody = document.querySelector('#tickets-table-body');
        tbody.innerHTML = ''; // ניקוי הטבלה לפני מילוי

        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ticket.apartment_number}</td>
                <td>${ticket.title}</td>
                <td>${ticket.status}</td>
                <td><button onclick="openChat('${ticket.id}')">צ'אט</button></td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('בעיה בטעינת הנתונים:', err);
    }
}

// הרצה אוטומטית ברגע שהדף נטען
document.addEventListener('DOMContentLoaded', fetchTickets);
// 5. עדכון סטטוס
document.getElementById('statusSelect').addEventListener('change', async (e) => {
    if (!currentTicketId) return;
    
    await fetch(`http://localhost:3000/api/tickets/status/${currentTicketId}`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify({ status: e.target.value })
    });
    alert("הסטטוס עודכן!");
});