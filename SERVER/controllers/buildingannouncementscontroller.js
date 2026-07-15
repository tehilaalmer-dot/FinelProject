import Building_announcements from '../models/modelbuilding_announcements.js'; // ודאי שהנתיב למודל שלך מדויק!

// 1. שליפת כל הודעות הוועד
const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Building_announcements.getAllBuilding_announcements();
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'שגיאה בשליפת ההודעות', details: error.message });
    }
};

// 2. שליפת הודעה ספציפית לפי מזהה
const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params; // מקבל את ה-ID מתוך הנתיב (URL params)
        const announcement = await Building_announcements.findById(id);
        
        if (!announcement) {
            return res.status(404).json({ error: 'ההודעה המבוקשת לא נמצאה' });
        }
        
        res.json(announcement);
    } catch (error) {
        console.error('Error fetching announcement by ID:', error);
        res.status(500).json({ error: 'שגיאה בשליפת ההודעה', details: error.message });
    }
};

// 3. יצירת הודעה חדשה
const createAnnouncement = async (req, res) => {
    try {
        const { building_id, vaad_id, content } = req.body;

        // בדיקה בסיסית שכל השדות הנדרשים נשלחו
        if (!building_id || !vaad_id || !content) {
            return res.status(400).json({ 
                error: 'נא לספק את כל השדות הדרושים: building_id, vaad_id, content' 
            });
        }

        const newAnnouncement = await Building_announcements.create({
            building_id,
            vaad_id,
            content
        });

        // החזרת תשובה עם סטטוס 210 (Created) והאובייקט החדש
        res.status(201).json(newAnnouncement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'שגיאה ביצירת הודעה חדשה', details: error.message });
    }
};

export default {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement
};