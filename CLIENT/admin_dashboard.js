// 1. כתובת ה-API הבסיסית של השרת
const API_BASE_URL = 'http://localhost:3000/api';

// 2. ריצה מיד כשהדף נטען
window.onload = () => {
    loadUsers();
    loadBuildings(); // קריאה לפונקציה החדשה של הבניינים
};


// 1. שליפת משתמשים מהשרת והצגתם בטבלה
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        
        // אם אין טוקן בכלל - נעביר אותה ישר להתחברות
        if (!token) {
            alert('אינך מחוברת! מעבירה אותך לדף ההתחברות...');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // טיפול במצב של חוסר הרשאה (401 או 403)
        if (response.status === 401 || response.status === 403) {
            alert('פג תוקף החיבור, נא להתחבר מחדש');
            localStorage.removeItem('token'); // מנקות טוקן פג תוקף
            window.location.href = 'login.html';
            return;
        }

        const users = await response.json();
        
        // הגנה מפני קריסה: מוודאות שהשרת אכן החזיר מערך
        if (!Array.isArray(users)) {
            console.error('השרת לא החזיר מערך משתמשים:', users);
            return;
        }
        
        const tbody = document.querySelector('section:nth-of-type(2) tbody');
        tbody.innerHTML = ''; // ניקוי הנתונים הישנים
        
        users.forEach(user => {
            const statusClass = user.status === 'active' ? 'badge-active' : 'badge-blocked';
            const statusText = user.status === 'active' ? 'פעיל' : 'חסום';
            const nextAction = user.status === 'active' ? 'חסום משתמש' : 'שחרר חסימה';
            const shouldBlock = user.status === 'active';
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${user.full_name}</strong></td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${user.building_name || 'לא שוייך'}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-arch btn-secondary" onclick="toggleBlockUser('${user.idusers}', ${shouldBlock})">
                            ${nextAction}
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('שגיאה בטעינת משתמשים:', error);
    }
}

// 2. שליפת בניינים מהשרת והצגתם בטבלה
async function loadBuildings() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return; // הטיפול יתבצע כבר בפונקציה הראשונה

        const response = await fetch(`${API_BASE_URL}/buildings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            return; // הטיפול יתבצע כבר בפונקציה הראשונה
        }

        const buildings = await response.json();
        
        // הגנה מפני קריסה: מוודאות שהשרת אכן החזיר מערך
        if (!Array.isArray(buildings)) {
            console.error('השרת לא החזיר מערך בניינים:', buildings);
            return;
        }
        
        const tbody = document.querySelector('section:nth-of-type(1) tbody');
        tbody.innerHTML = ''; // ניקוי נתוני הדמה
        
        buildings.forEach(b => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>#B-${b.idbuildings}</strong></td>
                    <td>${b.address}</td>
                    <td>${b.city}</td>
                    <td>${b.num_apartments} דירות</td>
                    <td>
                        <button class="btn-arch" onclick="deleteBuilding('${b.idbuildings}')">מחק בניין</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('שגיאה בטעינת בניינים:', error);
    }
}

// 5. חסימה או שחרור של משתמש
async function toggleBlockUser(userId, shouldBlock) {
    const newStatus = shouldBlock ? 'blocked' : 'active';
    const actionText = shouldBlock ? 'לחסום' : 'לשחרר מחסימה';
    
    if (confirm(`האם את בטוחה שברצונך ${actionText} את המשתמש?`)) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                alert('סטטוס המשתמש עודכן בהצלחה!');
                loadUsers(); // טעינה מחדש ועדכון הטבלה על המסך
            } else {
                alert('שגיאה בעדכון הסטטוס בשרת');
            }
        } catch (error) {
            console.error('שגיאה בעדכון המשתמש:', error);
        }
    }
}

// 6. מחיקת בניין
async function deleteBuilding(buildingId) {
    if (confirm(`האם את בטוחה שברצונך למחוק את בניין #${buildingId} לחלוטין מהמערכת?`)) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/buildings/${buildingId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                alert('הבניין נמחק בהצלחה!');
                loadBuildings(); // רענון טבלת הבניינים
            } else {
                alert('שגיאה במחיקת הבניין מהשרת');
            }
        } catch (error) {
            console.error('שגיאה במחיקת הבניין:', error);
        }
    }
}