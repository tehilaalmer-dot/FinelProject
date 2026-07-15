document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (!registerForm) return;

    registerForm.addEventListener('submit', async (event) => {
        // 1. מניעת התרעננות של העמוד
        event.preventDefault();

        // 2. איסוף הערכים מהשדות
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const phone = document.getElementById('phone').value.trim();
        const apartmentNumber = document.getElementById('apartmentNumber').value;
        const floor = document.getElementById('floor').value;
        const role = document.getElementById('role').value;
        const buildingId = 1;
        // שימי לב: ה-Controller דורש building_id כשדה חובה!
        // נשלוף אותו מהקלט של המשתמש, או נגדיר ערך דיפולטיבי (למשל 1) לבדיקות שלכן.
        // const buildingInput = document.getElementById('buildingId');
        // const buildingId = buildingInput ? buildingInput.value : "1"; 

   // 1. שליפת הערכים מהשדות החדשים ב-HTML
const city = document.getElementById('city').value.trim();
const streetAndNumber = document.getElementById('street_and_number').value.trim();

// 2. בניית אובייקט הנתונים עם השדות המפוצלים
const registerData = {
    name: fullName,
    full_name: fullName,
    email: email,
    password: password,
    user_password: password,
    phone: phone || null,
    apartmentnumber: apartmentNumber ? parseInt(apartmentNumber) : null,
    floor: floor ? parseInt(floor) : null,
    role: role,
    
    // שולחים את העיר ואת הרחוב בנפרד לשרת
    city: city,
    street_and_number: streetAndNumber,
    
    status: "active"
};

        try {
            // הדפסה לקונסול של הדפדפן כדי שתוכלו לעקוב אחרי מה שנשלח
            console.log("Sending data to server:", registerData);

            // 4. שליחת בקשת ה-POST לנתיב ההרשמה שלכן
            // ודאו שזהו הפורט הנכון (בדוגמה זו 3000) והנתיב (Route) המתאים
         // בתוך ה-fetch בקובץ register.html שלכן, ודאו שהכתובת מעודכנת כך:
// הקוד שרץ לאחר שליחת טופס ההרשמה (בתוך ה-addEventListener של ה-submit):
const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
});

const data = await response.json();

if (response.ok && data.success) {
    alert(data.message); // יקפיץ: "הבניין נוצר והוועד נרשם בהצלחה!"

    // 1. שמירת הטוקן ופרטי המשתמש בדפדפן לצורך התחברות אוטומטית
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // 2. ניתוב אוטומטי לפי תפקיד המשתמש (ועד בית או דייר)
    if (data.user.role === 'vaad') {
        // ניתוב לאזור האישי של ועד הבית
        window.location.href = 'vaad_dashboard.html'; // שנו לשם הקובץ האמיתי שלכן
    } else {
        // ניתוב לאזור האישי של הדייר
        window.location.href = 'dayar_dashboard.html'; // שנו לשם הקובץ האמיתי שלכן
    }
} else {
    alert(data.message || 'חלה שגיאה בתהליך ההרשמה.');
}

        } catch (error) {
            console.error('Error during registration request:', error);
            alert('לא ניתן להתחבר לשרת כרגע. ודאו שהשרת שלכן דולק ומאפשר CORS.');
        }
    });
});