import express from "express";
import {
  createPO,
  getPOs,
  updatePOStatus,
  receivePO,
  deletePO,
} from "../controllers/purchaseOrderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPO);
router.get("/", protect, getPOs);
router.put("/:id/status", protect, updatePOStatus);
router.put("/:id/receive", protect, receivePO);
router.delete("/:id", protect, deletePO);

export default router;