import express from "express";
import BuildingsController from "../controllers/BuildingsController.js"; 

const router = express.Router(); // תיקון הגדרת הראוטר

router.get("/buildings/:id", BuildingsController.getBuildingById);
router.get("/buildings", BuildingsController.getAllBuildings);
router.post("/buildings", BuildingsController.createBuilding);


export default router;
