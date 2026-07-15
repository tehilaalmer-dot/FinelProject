import express from "express";
import BuildingsController from "../controllers/BuildingsController.js"; 
import { protect, restrictTo } from '../middleware/authMiddleware.js';
const router = express.Router(); // תיקון הגדרת הראוטר

router.get("/buildings/:id", protect, restrictTo( 'manager'), BuildingsController.getBuildingById);
router.get("/buildings", protect, restrictTo( 'manager'), BuildingsController.getAllBuildings);
router.post("/buildings", protect, restrictTo('vaad', 'manager'), BuildingsController.createBuilding);
router.delete('/buildings/:id', BuildingsController.deleteBuilding);


export default router;
