import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// Updated recordSale function to handle multiple products
export const recordSale = async (req, res) => {
  try {
    // Accept either single product or array of products
    const items = Array.isArray(req.body.items) ? req.body.items : [req.body];

    // Validate at least one item exists
    if (items.length === 0) {
      return res.status(400).json({ message: "At least one product is required" });
    }

    const sales = [];
    const errors = [];

    // Process each product
    for (const item of items) {
      try {
        const { productId, quantity } = item;

        // Validate individual item
        if (!productId || !quantity || quantity <= 0) {
          errors.push({ productId, error: "Invalid input: productId and positive quantity are required" });
          continue;
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: "Product not found" });
          continue;
        }

        // Check stock
        if (product.quantity < quantity) {
          errors.push({ productId, error: "Not enough stock available" });
          continue;
        }

        // Create sale record (using your existing model)
        const sale = await Sale.create({
          product: productId,
          quantity,
          buyingPrice: product.buyingPrice,
          sellingPrice: product.price,
          totalAmount: product.price * quantity
        });

        // Update product stock
        product.quantity -= quantity;
        await product.save();

        sales.push(sale);
      } catch (error) {
        errors.push({ productId: item.productId, error: error.message });
      }
    }

    // Return results
    if (sales.length === 0) {
      return res.status(400).json({
        message: "No sales were processed successfully",
        errors
      });
    }

    res.status(201).json({
      message: `Processed ${sales.length} product(s)`,
      sales,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("Error recording sales:", error);
    res.status(500).json({ message: "Error recording sales", error: error.message });
  }
};


export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("product", "name price buyingPrice") // Include buyingPrice
      .lean();

    // Filter out sales with deleted products
    const filteredSales = sales.filter((sale) => sale.product);

    // Include buyingPrice, sellingPrice, and totalAmount in the response
    const salesWithPrices = filteredSales.map((sale) => ({
      ...sale,
      buyingPrice: sale.product.buyingPrice,
      sellingPrice: sale.product.price,
      totalAmount: sale.totalAmount, // Ensure totalAmount is included
      profit: (sale.product.price - sale.product.buyingPrice) * sale.quantity, // Calculate profit
    }));

    res.json(salesWithPrices);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ message: "Error fetching sales", error: error.message });
  }
};
// Get sales report (product-wise)
export const getSalesReport = async (req, res) => {
  try {
    const { period } = req.query; // daily, monthly, yearly

    let startDate, endDate;
    const now = new Date();

    if (period === "daily") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    } else if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === "yearly") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    } else {
      return res.status(400).json({ message: "Invalid period" });
    }

    // Aggregate sales data to calculate total quantity sold and total money earned for each product
    const salesReport = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }, // Filter sales within the specified period
        },
      },
      {
        $lookup: {
          from: "products", // Join with the products collection
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Flatten the productDetails array
      {
        $group: {
          _id: "$product", // Group by product ID
          totalQuantitySold: { $sum: "$quantity" }, // Calculate total quantity sold
          totalMoneyEarned: { $sum: { $multiply: ["$quantity", "$productDetails.price"] } }, // Calculate total money earned
          productName: { $first: "$productDetails.name" }, // Include product name
          price: { $first: "$productDetails.price" }, // Include product price
          buyingPrice: { $first: "$productDetails.buyingPrice" }, // Include buying price
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          productId: "$_id", // Include product ID
          productName: 1, // Include product name
          price: 1, // Include product price
          buyingPrice: 1, // Include buying price
          totalQuantitySold: 1, // Include total quantity sold
          totalMoneyEarned: 1, // Include total money earned
        },
      },
    ]);

    res.json(salesReport);
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Error generating sales report", error: error.message });
  }
};

// Delete sale record
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // Restore stock
    const product = await Product.findById(sale.product);
    if (product) {
      product.quantity += sale.quantity;
      await product.save();
    }

    await sale.deleteOne();
    res.json({ message: "Sale deleted" });
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ message: "Error deleting sale", error: error.message });
  }
};