import express from "express";
import BuildingsController from "../controllers/BuildingsController.js"; 
import { protect, restrictTo } from '../middleware/authMiddleware.js';
const router = express.Router(); // תיקון הגדרת הראוטר

router.get("/buildings/:id", protect, restrictTo( 'manager'), BuildingsController.getBuildingById);
router.get("/buildings/public/:id", protect, BuildingsController.getBuildingById); // public to authenticated users
router.get("/buildings", protect, restrictTo( 'manager'), BuildingsController.getAllBuildings);
router.post("/buildings", protect, restrictTo('vaad', 'manager'), BuildingsController.createBuilding);
router.delete('/buildings/:id', BuildingsController.deleteBuilding);
router.get("/buildings/street/:street/city/:city", protect, BuildingsController.getByStreetAndCity);


export default router;
