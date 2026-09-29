import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, category, quantity, price, buyingPrice, lowStockAlert } = req.body;
    if (!name || !category || quantity == null || !price || !buyingPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a product with the same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: "This Product already exists" });
    }

    const product = await Product.create({ name, category, quantity, price, buyingPrice, lowStockAlert });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error adding product:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "This Product already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, category, quantity, price, buyingPrice, lowStockAlert } = req.body;
    if (!name || !category || quantity == null || !price || !buyingPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if another product already has the updated name
    const existingProduct = await Product.findOne({ name, _id: { $ne: req.params.id } });
    if (existingProduct) {
      return res.status(400).json({ message: "Product name must be unique" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, quantity, price, buyingPrice, lowStockAlert },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Product name must be unique" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};


// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete all sales linked to the product
    await Sale.deleteMany({ product: product._id });

    // Delete the product
    await product.deleteOne();

    res.json({ message: "Product and associated sales deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Increase product quantity by 1
export const increaseQuantity = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.quantity += 1; // Increase quantity by 1
    await product.save();

    res.json(product);
  } catch (error) {
    console.error("Error increasing quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Increase product quantity by a specific amount
export const addStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.quantity += quantity; // Add the specified quantity to stock
    await product.save();

    res.json(product);
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({ message: "Invalid ID" });
  }
};

// Decrease product quantity
export const decreaseQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.quantity >= quantity) {
      product.quantity -= quantity;
      await product.save();
      res.json(product);
    } else {
      res.status(400).json({ message: "Not enough stock available" });
    }
  } catch (error) {
    console.error("Error decreasing quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check low stock alert
export const checkLowStock = async (req, res) => {
  try {
    const products = await Product.find({ quantity: { $lte: req.body.lowStockAlert } });
    res.json(products);
  } catch (error) {
    console.error("Error checking low stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
