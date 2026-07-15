
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
            const { address, city, num_apartments } = req.body;
            
            //בדיקת תקינות
            if (!address || !city || !num_apartments) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const newBuilding = await Building.create({ address, city, num_apartments });
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
async deleteBuilding(req, res) {
    try {
        const { id } = req.params;
        await Building.delete(id); // הפעלת המחיקה במודל
        res.json({ success: true, message: "Building deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
};
export default buildingsController;

