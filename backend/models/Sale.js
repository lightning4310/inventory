import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  buyingPrice: { type: Number, required: true }, // Include buying price
  sellingPrice: { type: Number, required: true }, // Include selling price
  totalAmount: { type: Number, required: true }, // Ensure this field is required
  date: { type: Date, default: Date.now },
},{ timestamps: true });

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;