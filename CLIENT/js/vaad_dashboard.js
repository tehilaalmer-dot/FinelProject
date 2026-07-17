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
const user = JSON.parse(localStorage.getItem('user') || '{}');
const buildingId = user.building_id;

// Logout handler
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', logout);

// אלמנטים מהדף
const sendBtn = document.getElementById('sendVaadMsg');
const msgInput = document.getElementById('vaadMsgInput');
const chatMessages = document.getElementById('chat-messages');
let currentTicketId = null;

// פונקציית עזר להוספת הודעה למסך
function appendMessage(message, senderRole) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${senderRole === 'vaad' ? 'msg-vaad' : 'msg-tenant'}`;
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

    msgInput.value = '';
});
// פונקציה למשיכת כל התקלות של הבניין
async function fetchTickets() {
    try {
        const userString = localStorage.getItem('user');
        if (!userString) throw new Error("לא נמצא משתמש מחובר");
        
        const user = JSON.parse(userString);
        
        // תיקון: נשתמש בערך המדויק מה-user, ונוודא שהוא מגיע כערך בודד
        const buildingId = user.building_id; 

        console.log("מנסה למשוך טיקטים עבור בניין ID:", buildingId);

        // שימוש ב-Template Literal פשוט וברור
        const response = await fetch(`http://localhost:3000/api/tickets/building/${buildingId}`, {
            method: 'GET',
            headers: { 
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 403) {
            throw new Error('אין לך הרשאה לגשת למידע של בניין זה (403)');
        }
        
        if (!response.ok) {
            throw new Error('שגיאה בטעינת הטיקטים: ' + response.statusText);
        }

        const tickets = await response.json();
        console.log("הטיקטים שהתקבלו:", tickets);

        const tbody = document.querySelector('#tickets-table-body');
        tbody.innerHTML = ''; 

        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>דירה ${ticket.apartment_number}</td>
                <td>${ticket.title}</td>
                <td>
                    <select class="status-select" onchange="updateStatus('${ticket.id}', this.value)">
                        <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>🟢 פתוח</option>
                        <option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>🟡 בטיפול</option>
                        <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>🔴 סגור</option>
                    </select>
                </td>
                <td><button class="btn-arch" onclick="openChat('${ticket.id}')">צ'אט</button></td>
            `;
            tbody.appendChild(row);
            
            // הצטרפות לחדר הסוקט של הטיקט כדי לקבל עדכונים בזמן אמת
            socket.emit('join_ticket', { ticket_id: ticket.id });
        });

    } catch (err) {
        console.error('בעיה בטעינת הנתונים:', err);
    }
}
async function openChat(ticketId) {
    currentTicketId = ticketId;
    document.getElementById("chat-section").style.display = "grid";
    chatMessages.innerHTML = "";
    
    socket.emit("join_ticket", { ticket_id: ticketId });
    await loadMessageHistory(ticketId);
}

// פונקציה לעדכון סטטוס מה-Select
async function updateStatus(ticketId, newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/status/${ticketId}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token 
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            console.log("הסטטוס עודכן בשרת!");
        }
    } catch (err) {
        console.error("שגיאה בעדכון סטטוס:", err);
    }
}

async function loadResidentsTable() {
    if (!buildingId) return;
    try {
        const response = await fetch(`http://localhost:3000/api/users/building/${buildingId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const residents = await response.json();
        const tbody = document.getElementById('residents-table-body');
        tbody.innerHTML = '';
        residents.forEach(r => {
            const isVaad = r.role === 'vaad';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.apartmentnumber || 'לא מוגדר'}</td>
                <td>${r.full_name} ${isVaad ? '<strong style="color:var(--success-accent)"> (יו"ר)</strong>' : ''}</td>
                <td>${r.phone || '-'}</td>
                <td>
                    ${isVaad ? '-' : `<button class="btn-arch" onclick="transferVaad(${r.idusers || r.id})">הפוך לוועד</button>`}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('שגיאה בטעינת דיירים:', err);
    }
}

async function loadExpenses() {
    if (!buildingId) return;
    try {
        const response = await fetch(`http://localhost:3000/api/expenses/building/${buildingId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const expenses = await response.json();
        const tbody = document.getElementById('expenses-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        expenses.forEach(exp => {
            const row = document.createElement('tr');
            row.id = `expense-row-${exp.id}`;
            row.innerHTML = `
                <td>${exp.title}</td>
                <td>${exp.amount}</td>
                <td>${new Date(exp.expense_date).toLocaleDateString('he-IL')}</td>
                <td>
                    ${exp.receipt_path ? `<a href="${exp.receipt_path}" target="_blank">קבלה</a>` : '-'}
                    <button class="btn-arch" style="margin-inline-start:8px;" onclick="toggleExpenseDetails(${exp.id})">הצג דיירים</button>
                </td>
            `;
            tbody.appendChild(row);

            const detailRow = document.createElement('tr');
            detailRow.id = `expense-detail-${exp.id}`;
            detailRow.style.display = 'none';
            detailRow.innerHTML = `<td colspan="4"><div class="expense-residents" id="expense-residents-${exp.id}">טוען...</div></td>`;
            tbody.appendChild(detailRow);
        });
    } catch (err) {
        console.error('שגיאה בטעינת הוצאות:', err);
    }
}

async function transferVaad(newVaadUserId) {
    if (!confirm('להעביר את תפקיד יו"ר לדרוש זה? פעולה אינה ניתנת לביטול אוטומטית.')) return;
    try {
        const resp = await fetch('http://localhost:3000/api/users/transfer-vaad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ newVaadUserId, building_id: buildingId })
        });
        if (resp.ok) {
            alert('ההעברה בוצעה בהצלחה');
            await loadResidentsTable();
        } else {
            const txt = await resp.text();
            console.error('שגיאה בהעברת יו"ר:', txt);
            alert('שגיאה בהעברה');
        }
    } catch (err) {
        console.error('שגיאה ברשת בהעברת יו"ר:', err);
        alert('שגיאה ברשת');
    }
}

// Toggle and load residents for a specific expense
async function toggleExpenseDetails(expenseId) {
    const detail = document.getElementById(`expense-detail-${expenseId}`);
    if (!detail) return;
    if (detail.style.display === 'none') {
        detail.style.display = '';
        await loadExpenseResidents(expenseId);
    } else {
        detail.style.display = 'none';
    }
}

async function loadExpenseResidents(expenseId) {
    try {
        const resp = await fetch(`http://localhost:3000/api/payments/expense/${expenseId}/collection`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!resp.ok) {
            const txt = await resp.text();
            console.error('שגיאה בטעינת דיירים להוצאה:', resp.status, txt);
            document.getElementById(`expense-residents-${expenseId}`).innerText = 'שגיאה בטעינת רשימת דיירים';
            return;
        }
        const rows = await resp.json();
        const container = document.getElementById(`expense-residents-${expenseId}`);
        container.innerHTML = '';
        const tbl = document.createElement('table');
        tbl.className = 'arch-table';
        tbl.innerHTML = `
            <thead><tr><th>דירה</th><th>דייר</th><th>סטטוס</th><th>פעולות</th></tr></thead>
            <tbody></tbody>
        `;
        const tb = tbl.querySelector('tbody');
        rows.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>דירה ${r.apartmentnumber || '-'}</td>
                <td>${r.name || '-'}</td>
                <td><span class="badge ${r.status === 'paid' ? 'paid' : 'debt'}">${r.status === 'paid' ? 'שולם' : 'חייב'}</span></td>
                <td>${r.status !== 'paid' ? `<button class="btn-arch" onclick="markAsPaidForExpense(${r.user_id}, ${expenseId}, ${r.amount || 0})">סמן ששולם</button>` : '-'}</td>
            `;
            tb.appendChild(tr);
        });
        container.appendChild(tbl);
    } catch (err) {
        console.error('שגיאה בטעינת דיירים להוצאה:', err);
    }
}

async function markAsPaidForExpense(userId, expenseId, amount = 0) {
    try {
        const response = await fetch('http://localhost:3000/api/payments/mark-paid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ user_id: userId, building_id: buildingId, amount, payment_method: 'cash', expense_id: expenseId })
        });
        if (response.ok) {
            await loadExpenseResidents(expenseId);
        } else {
            console.error('שגיאה בסימון תשלום להוצאה', await response.text());
        }
    } catch (err) {
        console.error('שגיאה בסימון תשלום להוצאה:', err);
    }
}

async function markAsPaid(userId, amount = 0) {
    if (!buildingId) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
        const response = await fetch('http://localhost:3000/api/payments/mark-paid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                user_id: userId,
                building_id: buildingId,
                amount,
                payment_month: currentMonth,
                payment_method: 'cash'
            })
        });
        if (response.ok) {
            await loadBillingTable();
        } else {
            console.error('שגיאה בסימון תשלום כשולם', await response.text());
        }
    } catch (err) {
        console.error('שגיאה בסימון תשלום כשולם:', err);
    }
}

// הרצה של הכל ברגע שה-DOM מוכן
document.addEventListener('DOMContentLoaded', () => {
    console.log("דף ה-Dashboard נטען, מתחיל בטעינת נתונים...");
    
    fetchTickets();
    loadResidentsTable();
    loadExpenses();
});
// fetch and display building info in header for vaad
async function loadBuildingInfoVaad() {
    try {
        if (!buildingId) return;
        const resp = await fetch(`http://localhost:3000/api/buildings/public/${buildingId}`, { headers: { 'Authorization': 'Bearer ' + token } });
        if (!resp.ok) return;
        const b = await resp.json();
        const status = document.querySelector('.status');
        const street = b.street || b.address || '';
        if (status) status.textContent = `${street} ${b.city ? '/ ' + b.city : ''} / ממשק ועד הבית`;
    } catch (err) { console.error('Error loading building info', err); }
}
loadBuildingInfoVaad();

document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // שליפת המשתמש מ-localStorage כדי למנוע את השגיאה שראית
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    try {
        const formData = new FormData();
        formData.append('building_id', userData.building_id);
        formData.append('title', document.getElementById('expType').value);
        formData.append('amount', document.getElementById('expAmount').value);
        formData.append('expense_date', new Date().toISOString().split('T')[0]);
        const fileInput = document.getElementById('receiptFile');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            formData.append('receipt', fileInput.files[0]);
        }

        const response = await fetch('http://localhost:3000/api/expenses/create', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });

        if (response.ok) {
            alert("ההוצאה נוספה לקופה!");
            document.getElementById('expenseForm').reset();
            await loadExpenses();
        } else {
            const errorText = await response.text();
            console.error('Expense upload failed:', errorText);
            alert("שגיאה בשמירת ההוצאה");
        }
    } catch (err) {
        console.error("שגיאה:", err);
    }
});
// טיפול בטופס פרסום הודעה
const announcementForm = document.getElementById('announcementForm');
if (announcementForm) {
    announcementForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('announcementContent').value.trim();
        if (!content) return alert('נא להזין תוכן להודעה');

        try {
            const resp = await fetch('http://localhost:3000/api/building-announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ building_id: buildingId, vaad_id: user.id, content })
            });
            if (resp.ok) {
                alert('ההודעה פורסמה בהצלחה');
                document.getElementById('announcementContent').value = '';
            } else {
                const txt = await resp.text();
                console.error('שגיאה בפרסום ההודעה:', txt);
                alert('שגיאה בפרסום ההודעה');
            }
        } catch (err) {
            console.error('שגיאה בפרסום הודעה:', err);
            alert('שגיאה ברשת');
        }
    });
}
async function loadBillingTable() {
    if (!buildingId) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
        const response = await fetch(`http://localhost:3000/api/payments/collection/${buildingId}/${currentMonth}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            console.error('שגיאה בטעינת מצב הגבייה:', response.status, await response.text());
            return;
        }

        const tenantsStatus = await response.json();
        const tbody = document.getElementById('billing-table-body');
        if (!tbody) return;

        tbody.innerHTML = tenantsStatus.length ? tenantsStatus.map(t => `
            <tr>
                <td>דירה ${t.apartmentnumber || 'לא מוגדר'}</td>
                <td>${t.name || 'לא ידוע'}</td>
                <td>
                    <span class="badge ${t.status === 'paid' ? 'paid' : 'debt'}">
                        ${t.status === 'paid' ? 'שולם' : 'חייב'}
                    </span>
                </td>
                <td>
                    ${t.status !== 'paid' ? `<button class="btn-arch" onclick="markAsPaid(${t.user_id}, ${t.amount || 0})">סימון כטופל</button>` : '-'}
                </td>
            </tr>
        `).join('') : `<tr><td colspan="4">לא נמצאו דיירים לתצוגה.</td></tr>`;
    } catch (err) {
        console.error('שגיאה בטעינת טבלת הגבייה:', err);
    }
}
// removed billing table function as requested
