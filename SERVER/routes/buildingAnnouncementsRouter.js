import express from "express";

import buildingannouncementscontroller from "../controllers/buildingannouncementscontroller.js";

const router = express.Router(); // תיקון הגדרת הראוטר
router.get("/building-announcements", buildingannouncementscontroller.getAllAnnouncements);
router.get("/building-announcements/:id", buildingannouncementscontroller.getAnnouncementById);
router.post("/building-announcements", buildingannouncementscontroller.createAnnouncement);


export default router;
