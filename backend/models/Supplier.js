import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  contactPerson: { 
    type: String,
    trim: true 
  },
  phone: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true 
  },
  address: { 
    type: String,
    trim: true 
  },
  notes: { 
    type: String,
    trim: true,
    default: "" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Supplier", SupplierSchema);