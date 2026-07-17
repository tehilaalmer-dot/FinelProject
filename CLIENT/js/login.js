document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (!registerForm) return;

    registerForm.addEventListener('submit', async (event) => {
        // 1. מניעת רענון העמוד
        event.preventDefault();

        // 2. איסוף כל הערכים מהטופס
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const phone = document.getElementById('phone').value.trim();
        const apartmentNumber = document.getElementById('apartmentNumber').value;
        const floor = document.getElementById('floor').value;
        const role = document.getElementById('role').value;
        const city = document.getElementById('city').value.trim();
        const streetAndNumber = document.getElementById('street_and_number').value.trim();
    let buildingId=3;    
//     if(role==="dayar")
//         {
            

// try {
//     const buildingResponse = await fetch(
//         `http://localhost:3000/api/buildings/street/${encodeURIComponent(streetAndNumber)}/city/${encodeURIComponent(city)}`
//     );

//     const building = await buildingResponse.json();

//     if (!buildingResponse.ok) {
//         alert("לא נמצא בניין בכתובת שהוזנה");
//         return;
//     }

//     buildingId = building.id;   // או building.building_id - תלוי מה השרת מחזיר
// }
// catch (err) {
//     console.error(err);
//     alert("שגיאה בחיפוש הבניין");
//     return;
// }

//         }


        // 4. בניית אובייקט הנתונים (מוודאים שאין ערכי null בשדות קריטיים)
        const registerData = {
            name: fullName,
            full_name: fullName,
            email: email,
            password: password,
            user_password: password,
            phone: phone || null,
            apartmentnumber: apartmentNumber ? parseInt(apartmentNumber) : 0,
            floor: floor ? parseInt(floor) : 0,
            role: role,
            city: city,
            street_and_number: streetAndNumber,
            building_id: buildingId,
            status: "active"
        };

        try {
            console.log("Sending data to server:", registerData);

            // 5. שליחת הבקשה לשרת
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            // 6. טיפול בתגובת השרת
            if (response.ok && data.success) {
                alert(data.message || "נרשמת בהצלחה!");
                
                // שמירת פרטי המשתמש
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // ניתוב לפי תפקיד
                window.location.href = data.user.role === 'vaad' ? 'vaad_dashboard.html' : 'dayar_dashboard.html';
            } else {
                console.error("Server error:", data);
                alert(data.message || 'חלה שגיאה בתהליך ההרשמה.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('לא ניתן להתחבר לשרת כרגע. ודאו שהוא דולק.');
        }
    });
});