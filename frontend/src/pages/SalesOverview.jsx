import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaRupeeSign, FaBox, FaSearch, FaFilter, FaChevronDown, FaTimes } from "react-icons/fa";

const SalesOverview = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayLimit, setDisplayLimit] = useState(6);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: "all",
    minProfit: "",
    maxProfit: "",
    customStartDate: "",
    customEndDate: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await API.get("/sales");
        setSales(response.data);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [navigate]);

  // Sort sales by date in descending order (latest first)
  const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate total sales, total quantity, and total profit
  const totalSales = sortedSales.reduce((acc, sale) => acc + (sale.totalAmount || 0), 0);
  const totalQuantity = sortedSales.reduce((acc, sale) => acc + (sale.quantity || 0), 0);
  const totalProfit = sortedSales.reduce(
    (acc, sale) => acc + ((sale.sellingPrice || 0) - (sale.buyingPrice || 0)) * (sale.quantity || 0),
    0
  );
  const totalTransactions = sortedSales.length;

  // Apply filters to sales
  const filteredSales = sortedSales.filter((sale) => {
    // Search term filter
    if (searchTerm && !(sale.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Date range filter
    const saleDate = new Date(sale.date);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    switch (filters.dateRange) {
      case "7days":
        if (saleDate < sevenDaysAgo) return false;
        break;
      case "30days":
        if (saleDate < thirtyDaysAgo) return false;
        break;
      case "90days":
        if (saleDate < ninetyDaysAgo) return false;
        break;
      case "custom":
        const startDate = filters.customStartDate ? new Date(filters.customStartDate) : null;
        const endDate = filters.customEndDate ? new Date(filters.customEndDate) : null;
        if (startDate && saleDate < startDate) return false;
        if (endDate) {
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999);
          if (saleDate > endDate) return false;
        }
        break;
      default:
        // "all" - no date filtering
        break;
    }

    // Profit range filter
    const profit = ((sale.sellingPrice || 0) - (sale.buyingPrice || 0)) * (sale.quantity || 0);
    if (filters.minProfit && profit < parseFloat(filters.minProfit)) return false;
    if (filters.maxProfit && profit > parseFloat(filters.maxProfit)) return false;

    return true;
  });

  // Get top 5 profitable products
  const topProfitableProducts = [];
  const productMap = new Map();

  sortedSales.forEach((sale) => {
    const productName = sale.product?.name;
    if (productName) {
      const profit = ((sale.sellingPrice || 0) - (sale.buyingPrice || 0)) * (sale.quantity || 0);
      if (productMap.has(productName)) {
        productMap.set(productName, productMap.get(productName) + profit);
      } else {
        productMap.set(productName, profit);
      }
    }
  });

  Array.from(productMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .forEach(([product, profit]) => {
      topProfitableProducts.push({ product, profit });
    });

  // Function to handle "View All Sales" button click
  const handleViewAllSales = () => {
    if (displayLimit === 6) {
      setDisplayLimit(filteredSales.length); // Show all sales
    } else {
      setDisplayLimit(6); // Reset to showing only 6 records
    }
  };

  // Function to toggle filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Function to handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Function to reset filters
  const resetFilters = () => {
    setFilters({
      dateRange: "all",
      minProfit: "",
      maxProfit: "",
      customStartDate: "",
      customEndDate: ""
    });
  };

  return (
    <div className="ml-64 p-6  min-h-screen">
      <div className="bg-white p-6 shadow-md rounded-lg mb-6">
        <h2 className="text-3xl font-bold text-indigo-800">Sales Overview</h2>
        <p className="text-gray-600">Here's an overview of your sales transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Stock Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start border-l-4 border-blue-500">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FaBox className="text-blue-500 text-xl" />
          </div>
          <div className="ml-4">
            
            <h3 className="text-gray-600">Total Transactions</h3>
            <p className="text-3xl font-bold">{totalTransactions}</p>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start border-l-4 border-yellow-500">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <FaShoppingCart className="text-yellow-500 text-xl" />
          </div>
          <div className="ml-4">
            <h3 className="text-gray-600">Total Quantity Sold</h3>
            <p className="text-3xl font-bold">{totalQuantity}</p>
          </div>
        </div>

        {/* Total Profit Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start border-l-4 border-green-500">
          <div className="bg-green-100 p-3 rounded-lg">
            <FaRupeeSign className="text-green-500 text-xl" />
          </div>
          <div className="ml-4">
            <h3 className="text-gray-600">Total Profit</h3>
            <p className="text-3xl font-bold">₹{totalProfit.toFixed(2)}</p>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start border-l-4 border-green-500">
          <div className="bg-green-100 p-3 rounded-lg">
            <FaRupeeSign className="text-green-500 text-xl" />
          </div>
          <div className="ml-4">
            <h3 className="text-gray-600">Total Sales</h3>
            <p className="text-3xl font-bold">₹{totalSales.toFixed(2)}</p>
          </div>
        </div>

      </div>

      {/* Search Bar and Filters */}
      <div className="mb-8">
        <div className="flex">
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search products..."
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
          <button
            className={`ml-2 flex items-center gap-2 ${showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} border border-gray-300 text-sm rounded-lg px-4`}
            onClick={toggleFilters}
          >
            <FaFilter className={showFilters ? 'text-white' : 'text-gray-500'} />
            <span>Filters</span>
            <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filter Sales</h3>
              <button onClick={resetFilters} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                <FaTimes className="mr-1" /> Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  name="dateRange"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {filters.dateRange === "custom" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="customStartDate"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={filters.customStartDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="customEndDate"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={filters.customEndDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                </>
              )}

              {/* Profit Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Profit (₹)</label>
                <input
                  type="number"
                  name="minProfit"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="0.00"
                  value={filters.minProfit}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Profit (₹)</label>
                <input
                  type="number"
                  name="maxProfit"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="No limit"
                  value={filters.maxProfit}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaShoppingCart className="text-blue-600 mr-2" />
            Recent Sales
          </h3>
          {loading ? (
            <p className="text-center">Loading sales data...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-right">Profit</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length > 0 ? (
                    filteredSales.slice(0, displayLimit).map((sale) => {
                      const buyingPrice = sale.buyingPrice || 0;
                      const sellingPrice = sale.sellingPrice || 0;
                      const quantity = sale.quantity || 0;
                      const profit = (sellingPrice - buyingPrice) * quantity;
                      const totalAmount = sale.totalAmount || sellingPrice * quantity;

                      return (
                        <tr key={sale._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{sale.product?.name || "N/A"}</td>
                          <td className="px-4 py-3 text-right">{quantity}</td>
                          <td className="px-4 py-3 text-right">₹{sellingPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">₹{totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">₹{profit.toFixed(2)}</td>
                          <td className="px-4 py-3">{new Date(sale.date).toLocaleDateString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No sales data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {filteredSales.length > 6 && (
                <div className="mt-4 text-center">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={handleViewAllSales}
                  >
                    {displayLimit === 6 ? "View All Sales" : "Show Less"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top Profitable Products */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaRupeeSign className="text-green-600 mr-2" />
            Top Profitable Products
          </h3>
          <div className="space-y-4">
            {topProfitableProducts.length > 0 ? (
              topProfitableProducts.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b py-2">
                  <span className="font-medium">{item.product}</span>
                  <span className="text-green-600 font-medium">₹{item.profit.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No profit data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;