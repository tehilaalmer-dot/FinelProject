import BuildingModel from "../MODELS.js";

const getAllBuildings = async (req, res) => {
    try {
        // קריאה לפונקציה המעודכנת מהמודל
        const buildings = await BuildingModel.getAll();
        
        // החזרת מערך הבניינים ישירות לקליינט
        res.json(buildings);
    } catch (error) {
        console.error('Error fetching buildings:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

export default {
    getAllBuildings,
};