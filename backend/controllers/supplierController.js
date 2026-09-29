import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

// 1. Create Supplier
export const createSupplier = async (req, res) => {
    try {
      const { name, contactPerson, phone, email, address, notes } = req.body;
      
      const supplier = new Supplier({
        name,
        contactPerson,
        phone,
        email,
        address,
        notes: notes || "" // Handle undefined notes
      });
  
      await supplier.save();
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ 
        error: error.message,
        fields: ["name", "phone"] // Highlight required fields
      });
    }
  };
// 2. Get All Suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// 3. Get Supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// 4. Update Supplier
export const updateSupplier = async (req, res) => {
    try {
      const updates = {
        name: req.body.name,
        contactPerson: req.body.contactPerson,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        notes: req.body.notes || "" // Handle undefined notes
      };
  
      const supplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );
  
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.status(200).json(supplier);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// 5. Delete Supplier
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    // Optional: Delete associated POs
    await PurchaseOrder.deleteMany({ supplierId: req.params.id });
    res.status(200).json({ message: "Supplier deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};