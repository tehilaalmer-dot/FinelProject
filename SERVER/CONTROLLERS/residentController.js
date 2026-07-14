import userModel from '../models/modelusers.js';
import Building_announcements from '../models/modelbuilding_announcements.js';

const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.idusers);

        if (!user) {
            return res.status(404).json({ error: 'המשתמש לא נמצא' });
        }

        const { user_password, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        console.error('Error fetching resident profile:', error);
        res.status(500).json({ error: 'שגיאה בשליפת פרופיל', details: error.message });
    }
};

const getMyAnnouncements = async (req, res) => {
    try {
        const { building_id } = req.user;

        if (!building_id) {
            return res.status(400).json({ error: 'לא נמצא שיוך בניין למשתמש' });
        }

        const announcements = await Building_announcements.findByBuildingId(building_id);
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching resident announcements:', error);
        res.status(500).json({ error: 'שגיאה בשליפת הודעות', details: error.message });
    }
};

export default {
    getProfile,
    getMyAnnouncements
};
