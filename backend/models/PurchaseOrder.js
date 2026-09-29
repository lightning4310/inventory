import mongoose from "mongoose";

const POItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

const PurchaseOrderSchema = new mongoose.Schema({
  supplierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Supplier",
    required: true 
  },
  status: { 
    type: String, 
    enum: [ "Sent", "Received", "Cancelled"], 
    default: "Sent" 
  },
  items: [POItemSchema],
  totalAmount: { type: Number },
}, { timestamps: true });

// Explicit default export
export default mongoose.model("PurchaseOrder", PurchaseOrderSchema);