import PurchaseOrder from "../models/PurchaseOrder.js";
import Product from "../models/Product.js";

// 1. Create Purchase Order
export const createPO = async (req, res) => {
  try {
    // Destructure status along with other fields
    const { items, status = 'Sent', ...otherData } = req.body; // Default to Draft if not provided

    // Debug log to check incoming status
    console.log('Incoming status:', status);

    // Fetch buying prices for all products
    const itemsWithPrices = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId);
      return {
        ...item,
        unitPrice: item.unitPrice || product.buyingPrice // Use provided price or fallback to buyingPrice
      };
    }));

    const totalAmount = itemsWithPrices.reduce(
      (sum, item) => sum + (item.unitPrice * item.quantity),
      0
    );

    // Debug log before creation
    console.log('Creating PO with status:', status);

    const po = await PurchaseOrder.create({
      status, // Now properly included
      ...otherData,
      items: itemsWithPrices,
      totalAmount
    });

    // Debug log after creation
    console.log('Created PO with status:', po.status);

    res.status(201).json(po);
  } catch (error) {
    console.error('Error creating PO:', error); // Detailed error logging
    res.status(400).json({ 
      message: error.message,
      ...(error.errors && { errors: error.errors }) // Include validation errors if available
    });
  }
};

// 2. Get All POs
export const getPOs = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate("supplierId")
      .sort({ dateCreated: -1 });
    res.status(200).json(pos);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// 3. Update PO Status (e.g., "Draft" → "Sent")
export const updatePOStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("supplierId");
    if (!po) {
      return res.status(404).json({ error: "PO not found" });
    }
    res.status(200).json(po);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 4. Receive PO (Update Inventory)
export const receivePO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ error: "PO not found" });
    }

    // Update product quantities
    for (const item of po.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: item.quantity } }
      );
    }

    // Mark PO as received
    po.status = "Received";
    await po.save();
    res.status(200).json(po);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 5. Delete PO
export const deletePO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!po) {
      return res.status(404).json({ error: "PO not found" });
    }
    res.status(200).json({ message: "PO deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};