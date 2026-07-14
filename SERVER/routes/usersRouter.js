import express from 'express';
import usersController from '../controllers/userscontroller.js';

const router = express.Router();

router.get("/users", usersController.getAllUsers);
router.get("/users/:id", usersController.getUserById);
router.post("/users", usersController.createUser);

export default router;
