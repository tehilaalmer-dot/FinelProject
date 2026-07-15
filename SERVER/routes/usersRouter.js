import express from 'express';
import usersController from '../controllers/userscontroller.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get("/users", protect, restrictTo('vaad', 'manager'), usersController.getAllUsers);
router.get("/users/:id", protect, usersController.getUserById);
router.post("/users", usersController.createUser);
router.put('/users/:id/status', usersController.updateUserStatus);

export default router;
