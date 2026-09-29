import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Ensure names are unique
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Selling price
  buyingPrice: { type: Number, required: true }, // Add buying price
  lowStockAlert: { type: Number, required: true },
});

const Product = mongoose.model("Product", productSchema);
export default Product;