// --- הגדרות ראשוניות ---
let socket;
if (!window.socketInstance) {
    window.socketInstance = io('http://localhost:3000', { auth: { token: localStorage.getItem('token') } });
}
socket = window.socketInstance;

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
const newTicketFields = document.getElementById('newTicketFields');
const titleInput = document.getElementById('ticketTitle');

let currentTicketId = null;
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// Logout: clear localStorage and redirect to login
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', logout);

// Hide status card if there's no balance info
const statusCard = document.getElementById('statusCard');
try {
    const balance = localStorage.getItem('balance');
    if (statusCard && (!balance || Number(balance) === 0)) {
        statusCard.style.display = 'none';
    }
} catch (e) { /* ignore */ }

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
    const title = document.getElementById('ticketTitle').value;
    const content = document.getElementById('chatInput').value;
    console.log("Title value:", title);
    console.log("Content value:", content);

    const messageText = chatInput.value.trim();
    if (!messageText) return alert("לא ניתן לשלוח הודעה ריקה");

    // א. הודעה בטיקט קיים
    // ב-dashboard.js, בתוך ה-submit:
if (currentTicketId) {
    socket.emit('send_message', { 
        ticket_id: currentTicketId, 
        message: messageText, 
        sender_role: 'tenant' 
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
    // יוצרים מיכל לכל שורה
    const rowDiv = document.createElement('div');
    rowDiv.className = 'ticket-row'; // תוכלי לעצב את זה ב-CSS
    rowDiv.style.display = "flex";
    rowDiv.style.justifyContent = "space-between";
    rowDiv.style.padding = "10px";
    rowDiv.style.borderBottom = "1px solid #ccc";

    // טקסט הפנייה
    const infoSpan = document.createElement('span');
    infoSpan.innerText = `${ticket.title} [${ticket.status}]`;
    
        // כפתור הצ'אט - אם הסטטוס resolved, נ disables ונוסיף טקסט סטטוס
        const chatBtn = document.createElement('button');
        chatBtn.innerText = "פתח צ'אט";
        chatBtn.className = 'arch-btn-chat'; // עיצוב נפרד לכפתור הצ'אט
        if (ticket.status === 'resolved') {
            chatBtn.classList.add('btn-disabled');
            chatBtn.title = 'הפנייה סגורה';
        } else {
            chatBtn.onclick = () => switchChat(ticket.id);
        }

    // הוספה למיכל
    rowDiv.appendChild(infoSpan);
    rowDiv.appendChild(chatBtn);
    
    // הוספה לרשימה הכללית
    listDiv.appendChild(rowDiv);
});
    } catch (err) { console.error("שגיאה בטעינת הרשימה:", err); }
}



// 5. עזרים
async function loadMessageHistory(ticketId) {
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/messages`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const messages = await response.json();
        chatBox.innerHTML = '';
        if (Array.isArray(messages)) messages.forEach(m => appendMessage(m.message, m.sender_role));
    } catch (err) { console.error('שגיאה בטעינת היסטוריה:', err); }
}

function startNewTicket() {
    currentTicketId = null; // אנחנו במצב של פנייה חדשה
    
    // 1. הצגת כרטיס הצ'אט
    const supportCard = document.getElementById('supportCard');
    if (supportCard) supportCard.style.display = "block";
    
    // 2. הצגת שדות הנושא והסוג
    const newTicketFields = document.getElementById('newTicketFields');
    if (newTicketFields) {
        newTicketFields.style.display = "block"; // וודאי שזה מוצג!
    }
    
    // 3. איפוס השדות כדי שהמשתמש יוכל לכתוב
    const titleInput = document.getElementById('ticketTitle');
    if (titleInput) titleInput.value = '';
    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.value = '';
    
    // 4. ניקוי חלון ההודעות הקודמות
    chatBox.innerHTML = ''; 
    
    console.log("מצב: פנייה חדשה מוכנה למילוי");
}

// 6. טעינה ראשונית - המפתח לתיקון שלך
async function initApp() {
    await loadTicketsList();
    await loadExpensesForTenant();
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
// fetch and display building info in header
async function loadBuildingInfo() {
    try {
        if (!user || !user.building_id) return;
        const resp = await fetch(`http://localhost:3000/api/buildings/public/${user.building_id}`, { headers: { 'Authorization': 'Bearer ' + token } });
        if (!resp.ok) return;
        const b = await resp.json();
        const tag = document.getElementById('userTag');
        const street = b.street || b.address || '';
        if (tag) tag.textContent = `${street} ${b.city ? '/ ' + b.city : ''}`;
    } catch (err) { console.error('Error loading building info', err); }
}
loadBuildingInfo();



// פונקציה להצגת הצ'אט (נקראת מהכפתור ברשימת הפניות)
async function switchChat(ticketId) {
    // נביא את רשימת הפניות כדי לבדוק את הסטטוס של הטיקט הספציפי
    // (אפשר גם לעשות Fetch לטיקט בודד, אבל זה חוסך שאילתות)
    const response = await fetch(`http://localhost:3000/api/tickets/tenant/${user.id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const tickets = await response.json();
    const ticket = tickets.find(t => String(t.id) === String(ticketId));

    // בדיקה: האם הטיקט קיים והאם הוא סגור?
    

    // אם הכל תקין - פותחים את הצ'אט
    const ticketFields = document.getElementById('newTicketFields');
    if (ticketFields) ticketFields.style.display = 'none';

    const supportCard = document.getElementById('supportCard');
    if (supportCard) supportCard.style.display = "block";
    
    currentTicketId = ticketId;
    chatBox.innerHTML = ''; 
    socket.emit('join_ticket', { ticket_id: currentTicketId });
    await loadMessageHistory(currentTicketId);
}


socket.on('receive_message', (data) => {
    if (String(data.ticket_id) === String(currentTicketId)) appendMessage(data.message, data.sender_role);
});

// הרצה
// --- תשלומים: טעינת הוצאות ודחיפת מודאל תשלום ---
let currentExpenseId = null;
let currentExpenseAmount = null;

async function loadExpensesForTenant() {
    try {
        const resp = await fetch(`http://localhost:3000/api/expenses/building/${user.building_id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const expenses = await resp.json();
        const container = document.getElementById('expensesList');
        const tbody = document.getElementById('tenant-expenses-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!Array.isArray(expenses) || expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">אין הוצאות פתוחות כרגע.</td></tr>';
            return;
        }

        // בדוק במקביל עבור כל הוצאה האם המשתמש שילם לה
        const statusPromises = expenses.map(exp =>
            fetch(`http://localhost:3000/api/payments/expense/${exp.id}/status`, {
                headers: { 'Authorization': 'Bearer ' + token }
            }).then(r => r.ok ? r.json().catch(() => ({ status: 'unpaid' })) : ({ status: 'unpaid' }))
        );

        const statuses = await Promise.all(statusPromises);
        const unpaidExpenses = expenses.filter((exp, i) => statuses[i] && statuses[i].status !== 'paid');

        if (unpaidExpenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">כל ההוצאות שולמו או אין הוצאות פתוחות.</td></tr>';
            return;
        }

        unpaidExpenses.forEach(exp => {
            const tr = document.createElement('tr');
            // חילוץ שם הקובץ בלבד
const fileName = exp.receipt_path ? exp.receipt_path.split(/[\\/]/).pop() : '';

// בניית הקישור

            tr.innerHTML = `
                <td>${exp.title}</td>
                <td>${exp.amount}</td>
                <td>${new Date(exp.expense_date).toLocaleDateString('he-IL')}</td>
                <td>${fileName ? `<a href="http://localhost:3000${exp.receipt_path}" target="_blank">${fileName}</a>` : 'אין קבלה'}</td>
                <td><button class="arch-btn" onclick="openPayModal(${exp.id}, ${exp.amount})">שלם באמצעות אשראי</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('שגיאה בטעינת הוצאות:', err);
    }
}

function openPayModal(expenseId, amount) {
    currentExpenseId = expenseId;
    currentExpenseAmount = amount;
    document.getElementById('archPaymentModal').style.display = 'flex';
}

const mockPaymentForm = document.getElementById('mockPaymentForm');
if (mockPaymentForm) {
    mockPaymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, '');
        const cardCvv = document.getElementById('cardCvv').value;
        if (cardNumber.length < 12) return alert('מספר כרטיס לא תקין');
        if (cardCvv.length < 3) return alert('CVV לא תקין');

        if (!currentExpenseId || !currentExpenseAmount) return alert('לא נבחרה הוצאה לתשלום');

        try {
            const resp = await fetch('http://localhost:3000/api/payments/pay-expense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ expense_id: currentExpenseId, amount: currentExpenseAmount, payment_method: 'credit' })
            });
            const data = await resp.json();
            if (resp.ok) {
                alert('תשלום בוצע בהצלחה');
                document.getElementById('archPaymentModal').style.display = 'none';
                await loadExpensesForTenant();
            } else {
                alert(data.message || 'שגיאה בביצוע התשלום');
            }
        } catch (err) {
            console.error('payment error', err);
            alert('שגיאה בשרת בעת ביצוע תשלום');
        }
    });
}

initApp();
// load announcements for tenant
async function loadAnnouncements() {
    try {
        const resp = await fetch('http://localhost:3000/api/building-announcements', { headers: { 'Authorization': 'Bearer ' + token } });
        if (!resp.ok) return;
        const all = await resp.json();
        const my = all.filter(a => String(a.building_id) === String(user.building_id));
        const container = document.getElementById('announcementsContainer');
        if (!container) return;
        container.innerHTML = my.length ? my.map(a => `
            <div class="arch-list-item">
                <span class="arch-date">${new Date(a.created_at || Date.now()).toLocaleDateString()}</span>
                <h4 class="arch-item-title">הודעה מהוועד</h4>
                <p class="arch-item-desc">${a.content}</p>
            </div>
        `).join('') : '<p>אין הודעות חדשות.</p>';
    } catch (err) { console.error('שגיאה בטעינת הודעות:', err); }
}
// call loadAnnouncements on init
loadAnnouncements();