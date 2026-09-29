import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Fetch total stock
    const totalStock = await Product.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);

    // Fetch total number of products
    const totalProducts = await Product.countDocuments();

    // Fetch low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$quantity", "$lowStockAlert"] }, // Compare quantity with lowStockAlert
    });

    // Fetch recent sales (last 5)
    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product");

    // Fetch top 4 selling products
    const topSelling = await Sale.aggregate([
      { $group: { _id: "$product", totalSold: { $sum: "$quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);

    // Calculate total profit directly from historical sales price
    const totalProfitResult = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ["$sellingPrice", "$buyingPrice"] },
                "$quantity",
              ],
            },
          },
        },
      },
    ]);

    const totalProfit = totalProfitResult[0]?.totalProfit || 0;

    // Fetch top 4 profitable products
    const topProfitableProducts = await Sale.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $group: {
          _id: "$product",
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ["$sellingPrice", "$buyingPrice"] },
                "$quantity",
              ],
            },
          },
          productDetails: { $first: { $arrayElemAt: ["$productDetails", 0] } },
        },
      },
      { $sort: { totalProfit: -1 } },
      { $limit: 4 },
    ]);

  

    res.json({
      totalStock: totalStock[0]?.total || 0,
      totalProducts,
      lowStockProducts,
      recentSales,
      topSelling,
      totalProfit,
      topProfitableProducts: topProfitableProducts.map((item) => ({
        _id: item._id,
        name: item.productDetails?.name || "Unknown Product", // Fallback for product name
        profit: item.totalProfit || 0, // Fallback for profit
      })),
      username: req.user?.name || "User",
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};