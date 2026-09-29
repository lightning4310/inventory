import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  increaseQuantity,
  addStock,
  decreaseQuantity,
  checkLowStock,
} from "../controllers/productController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/", protect, isAdmin, createProduct);
router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

// New routes for quantity update
router.put("/:id/increase", protect, increaseQuantity);
router.put("/:id/add-stock", protect, addStock);
router.put("/:id/decrease", protect, decreaseQuantity);

// Low stock check
router.post("/low-stock", protect, checkLowStock);

export default router;