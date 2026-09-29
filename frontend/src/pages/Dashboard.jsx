import { useState, useEffect } from "react";
import axios from "axios";
import { FaBoxes, FaExclamationTriangle, FaShoppingCart, FaChartLine, FaRupeeSign } from "react-icons/fa";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStock: 0,
    lowStockProducts: [],
    recentSales: [],
    topSelling: [],
    username: "",
    totalProducts: 0,
    totalProfit: 0,
    topProfitableProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(data);
      } catch (err) {
        setError("Error fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">{error}</div>;

  return (
    <div className="ml-64 p-8 bg-gray-100 min-h-screen">
      {/* Welcome Message */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-800">
          Welcome, <span className="text-indigo-800 font-bold">{stats.username}</span>
          <span className="ml-2 inline-block animate-bounce">👋</span>
        </h2>
        <p className="text-gray-500 mt-1">Here's an overview of your inventory system</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Stock */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FaBoxes className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Stock</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalStock}</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.lowStockProducts.length}</p>
            </div>
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <FaRupeeSign className="text-green-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Profit</h3>
              <p className="text-2xl font-bold text-gray-800">₹{stats.totalProfit?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </div>

        {/* Total Number of Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-amber-500 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="bg-amber-100 p-3 rounded-lg mr-4">
              <FaBoxes className="text-amber-500 text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Low Stock Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <FaExclamationTriangle className="text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Low Stock Products</h3>
          </div>
          
          {stats.lowStockProducts.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {stats.lowStockProducts.map((product) => (
                <li key={product._id} className="py-3 flex justify-between items-center">
                  <span className="text-gray-700">{product.name}</span>
                  <span className="text-white font-medium text-sm px-3 py-1 bg-red-400 rounded">
                    Only {product.quantity} left!
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-gray-500">No low stock products!</div>
          )}
        </div>

        {/* Top 4 Profitable Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FaChartLine className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Top Profitable Products</h3>
          </div>
          
          {stats.topProfitableProducts?.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {stats.topProfitableProducts.slice(0, 4).map((product) => (
                <li key={product._id} className="py-3 flex justify-between items-center">
                  <span className="text-gray-700">{product.name}</span>
                  <span className="text-green-600 font-medium">₹{(product.profit || 0).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-gray-500">No profitable products yet.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FaShoppingCart className="text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Recent Sales</h3>
          </div>
          
          {stats.recentSales.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {stats.recentSales
                .filter((sale) => sale.product)
                .map((sale) => {
                  const saleDate = sale.date ? new Date(sale.date).toLocaleDateString() : "Invalid Date";
                  return (
                    <li key={sale._id} className="py-3 flex justify-between items-center">
                      <span className="text-gray-700">{sale.product?.name || "Unknown Product"}</span>
                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium mr-2">{sale.quantity} sold</span>
                        <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
                          {saleDate}
                        </span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <div className="py-6 text-center text-gray-500">No recent sales.</div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-amber-100 p-2 rounded-lg mr-3">
              <FaBoxes className="text-amber-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Top Selling Products</h3>
          </div>
          
          {stats.topSelling.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {stats.topSelling.slice(0, 4).map((item, index) => (
                <li key={item._id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-gray-700 font-medium text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{item.productDetails[0]?.name || "Unknown"}</span>
                  </div>
                  <span className="text-gray-700 font-medium">{item.totalSold} sold</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-gray-500">No top-selling products yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;