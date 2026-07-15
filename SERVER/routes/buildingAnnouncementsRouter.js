import express from "express";

import buildingannouncementscontroller from "../controllers/buildingannouncementscontroller.js";
import { protect, restrictTo } from '../middleware/authMiddleware.js';
const router = express.Router(); // תיקון הגדרת הראוטר
router.get("/building-announcements", protect, buildingannouncementscontroller.getAllAnnouncements);
router.get("/building-announcements/:id", protect, buildingannouncementscontroller.getAnnouncementById);
router.post("/building-announcements", protect, restrictTo('vaad', 'manager'), buildingannouncementscontroller.createAnnouncement);


export default router;
