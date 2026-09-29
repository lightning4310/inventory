import express from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSupplier);
router.get("/", protect, getSuppliers);
router.get("/:id", protect, getSupplierById);
router.put("/:id", protect, updateSupplier);
router.delete("/:id", protect, deleteSupplier);

export default router;