document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        // 1. מניעת רענון העמוד בדיספצ' של הטופס
        event.preventDefault();

        // 2. שליפת הנתונים מהשדות בטופס
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            // 3. שליחת בקשת POST לשרת שלכן
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // === 4. שמירת המידע ב-LocalStorage ===
                // שומרים את הטוקן שקיבלנו לאימות עתידי בבקשות לשרת
                localStorage.setItem('token', data.token);
                
                // הופכים את אובייקט המשתמש לטקסט ושומרים אותו
                localStorage.setItem('user', JSON.stringify(data.user));

                alert('התחברת בהצלחה!');

                // === 5. ניתוב אוטומטי לפי תפקיד (Role) ===
                // אם המשתמש הוא ועד בית ('vaad'), נשלח אותו לדף המנהל, אחרת לדף דייר רגיל
                if (data.user.role === 'vaad') {
                    window.location.href = 'vaad_dashboard.html'; // או נתיב אחר שלכן לדף ועד הבית
                } else {
                    window.location.href = 'dashboard.html'; // או נתיב אחר שלכן לדף הדייר
                }

            } else {
                // במקרה של פרטים שגויים או שגיאה מהשרת
                alert(data.message || 'שגיאה בתהליך ההתחברות. ודאו שהאימייל והסיסמה נכונים.');
            }

        } catch (error) {
            console.error('Error during login:', error);
            alert('חלה שגיאה בחיבור לשרת. ודאו שהשרת שלכן רץ ומאפשר CORS.');
        }
    });
});