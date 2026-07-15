
import Building from "../models/modleBuilding.js";

const buildingsController = {
    // קבלת בניין לפי מזהה
    async getBuildingById(req, res) {
        try {  
            const building = await Building.findById(req.params.id);
            if (!building) {
                return res.status(404).json({ message: "Building not found" });
            }
            res.json(building);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
   async createBuilding(req, res) {
    try {
        // 1. אנחנו מקבלים את הכתובת כ-street_and_number מהטופס או כ-street
        const { street_and_number, street, address, city, num_apartments } = req.body;
        
        // נחלץ את הרחוב הנכון (נבדוק את כל האפשרויות שעלולות להישלח מהפרונט)
        const finalStreet = street_and_number || street || address;
        
        // בדיקת תקינות
        if (!finalStreet || !city || !num_apartments) {
            return res.status(400).json({ message: "All fields are required (street, city, num_apartments)" });
        }

        // 2. שולחים למודל 'street' במקום 'address' כדי שיתאים בדיוק לעמודה ב-DB!
        const newBuilding = await Building.create({ 
            street: finalStreet, 
            city, 
            num_apartments 
        });
        
        res.status(201).json(newBuilding);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
},
    async getAllBuildings(req, res) {
    try {
        const buildings = await Building.getAllBuildings();
        res.json(buildings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
},
};
export default buildingsController;

