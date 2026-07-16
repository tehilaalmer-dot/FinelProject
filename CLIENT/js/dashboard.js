// --- הגדרות ראשוניות ---
const socket = io('http://localhost:3000', { 
    auth: { token: localStorage.getItem('token') } 
});

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
const newTicketFields = document.getElementById('newTicketFields');
const titleInput = document.getElementById('ticketTitle');

let currentTicketId = null;
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// 1. פונקציית תצוגה מעוצבת
function appendMessage(text, role) {
    const msgDiv = document.createElement('div');
    msgDiv.className = (role === 'vaad') ? 'msg-vaad' : 'msg-tenant';
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 2. פונקציית עדכון UI (מראה/מסתירה שדות נושא)
function updateUIState() {
    if (currentTicketId) {
        newTicketFields.style.display = 'none';
        titleInput.required = false;
    } else {
        newTicketFields.style.display = 'block';
        titleInput.required = true;
    }
}

// 3. לוגיקת שליחה
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageText = chatInput.value.trim();
    if (!messageText) return alert("לא ניתן לשלוח הודעה ריקה");

    // א. הודעה בטיקט קיים
    // ב-dashboard.js, בתוך ה-submit:
if (currentTicketId) {
    socket.emit('send_message', { 
        ticket_id: currentTicketId, 
        message: messageText, 
        senderRole: 'tenant' 
    });
    chatInput.value = '';
    // תמחקי את ה-appendMessage(messageText, 'tenant') מכאן!
    return;
}

    // ב. פתיחת טיקט חדש
    try {
        const title = titleInput.value.trim();
        if (!title) return alert("נא למלא נושא לפנייה");

        const response = await fetch('http://localhost:3000/api/tickets/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({
                ticket_type: document.getElementById('ticketType').value,
                title: title,
                description: messageText,
                building_id: user.building_id
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            currentTicketId = data.ticketId;
            socket.emit('join_ticket', { ticket_id: currentTicketId });
            chatBox.innerHTML = '';
            appendMessage(messageText, 'tenant');
            chatInput.value = '';
            titleInput.value = '';
            await loadTicketsList();
            updateUIState();
        }
    } catch (err) { console.error("שגיאה ביצירת טיקט:", err); }
});

// 4. ניהול רשימת טיקטים ומעבר ביניהם
async function loadTicketsList() {
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/tenant/${user.id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const tickets = await response.json();
        const listDiv = document.getElementById('ticketsList');
        listDiv.innerHTML = '';
        
        tickets.forEach(ticket => {
            const btn = document.createElement('button');
            btn.className = 'arch-btn-list';
            btn.innerText = `${ticket.title} [${ticket.status}]`;
            btn.onclick = () => switchChat(ticket.id);
            listDiv.appendChild(btn);
        });
    } catch (err) { console.error("שגיאה בטעינת הרשימה:", err); }
}

async function switchChat(ticketId) {
    currentTicketId = ticketId;
    updateUIState();
    chatBox.innerHTML = ''; 
    socket.emit('join_ticket', { ticket_id: currentTicketId });
    await loadMessageHistory(currentTicketId);
}

// 5. עזרים
async function loadMessageHistory(ticketId) {
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/messages`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const messages = await response.json();
        chatBox.innerHTML = '';
        if (Array.isArray(messages)) messages.forEach(m => appendMessage(m.message, m.senderRole));
    } catch (err) { console.error('שגיאה בטעינת היסטוריה:', err); }
}

function startNewTicket() {
    currentTicketId = null;
    updateUIState();
    chatBox.innerHTML = '';
    chatInput.value = '';
}

// 6. טעינה ראשונית - המפתח לתיקון שלך
async function initApp() {
    await loadTicketsList();
    // בדיקה אם יש טיקט פעיל לטעינה אוטומטית
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/tenant/${user.id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const tickets = await response.json();
        const active = tickets.find(t => t.status !== 'closed');
        if (active) {
            switchChat(active.id);
        }
    } catch (err) { console.error(err); }
}

socket.on('receive_message', (data) => {
    if (String(data.ticket_id) === String(currentTicketId)) appendMessage(data.message, data.senderRole);
});

// הרצה
initApp();