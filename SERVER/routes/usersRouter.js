import express from 'express';
import usersController from '../controllers/userscontroller.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get("/users", protect, restrictTo('vaad', 'manager'), usersController.getAllUsers);
router.get("/users/building/:buildingId", protect, restrictTo('vaad', 'manager'), usersController.getUsersByBuilding);
router.get("/users/:id", protect, usersController.getUserById);
router.post("/users", usersController.createUser);
router.put('/users/:id/status', usersController.updateUserStatus);
router.post('/users/transfer-vaad', protect, restrictTo('vaad', 'manager'), usersController.transferVaad);

export default router;
