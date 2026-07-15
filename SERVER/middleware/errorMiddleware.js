/**
 * 🛡️ מידלוור גלובלי לטיפול בשגיאות (Global Error Handler)
 * אקספרס מזהה פונקציה עם 4 פרמטרים כמידלוור שגיאות באופן אוטומטי
 */
export const errorHandler = (err, req, res, next) => {
    console.error("❌ שגיאה שהתרחשה בשרת:", err);

    // קביעת קוד סטטוס (אם הוגדר בקונטרולר, נשתמש בו, אחרת ברירת מחדל היא 500)
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        error: "התרחשה שגיאה פנימית בשרת",
        message: err.message || "משהו השתבש, נסו שנית מאוחר יותר"
    });
};