// בדיקה שהמשתמש אכן מחובר ויש לו טוקן
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    alert('אינך מחובר! מועבר לדף ההתחברות.');
    window.location.href = 'login.html';
}

// ודואים שרק ועד בית נכנס לעמוד של הועד
if (window.location.pathname.includes('vaad_dashboard') && user.role !== 'vaad') {
    alert('אין לך הרשאה לגשת לעמוד זה!');
    window.location.href = 'dayar_dashboard.html';
}