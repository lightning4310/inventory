import express from "express";
import { recordSale, getSales, getSalesReport, deleteSale,  } from "../controllers/salesController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, recordSale); // Record a sale (protected)
router.get("/", protect, getSales); // Get all sales (protected)
router.get("/report", protect, getSalesReport); // Get sales report (protected)

router.delete("/:id", protect, deleteSale); // Delete a sale (protected)

export default router;
