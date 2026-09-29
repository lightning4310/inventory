import express from "express";
import {
    registerUser,
    loginUser,
    getAllUsers,
    deleteUser, // Import the deleteUser function
  } from "../controllers/authController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js"; // Fixed middleware names

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", protect, isAdmin, getAllUsers); // Fixed middleware names
router.delete("/users/:id", protect, isAdmin, deleteUser); // Ensure this route exists
export default router;
