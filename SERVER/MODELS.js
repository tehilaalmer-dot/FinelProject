import db from './db.js';

const BuildingModel = {
    // הפונקציה מחזירה ישירות את השורות מהמסד בעזרת await
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM buildings");
        return rows;
    },
    
    create: async (buildingData) => {
        const [result] = await db.query(
            "INSERT INTO buildings (address, floors) VALUES (?, ?)", 
            [buildingData.address, buildingData.floors]
        );
        return result;
    }
};

export default BuildingModel;