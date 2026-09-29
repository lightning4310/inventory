import React, { useEffect, useState } from "react";
import API from "../api/api";
import { FaBoxes, FaExclamationTriangle, FaTrash, FaSearch, FaFilter, FaSortAmountDown, FaChartLine } from "react-icons/fa";

const ProductOverview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userName, setUserName] = useState("User");

  // Stats derived from products
  const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter((product) => product.quantity <= product.lowStockAlert);
  
  // Calculate total profit (example based on price difference)
  const totalProfit = products.reduce((sum, product) => 
    sum + ((product.price - product.buyingPrice) * product.quantity), 0);
  
  // Get top profitable products (based on total potential profit)
  const topProfitableProducts = [...products]
    .sort((a, b) => ((b.price - b.buyingPrice) * b.quantity) - ((a.price - a.buyingPrice) * a.quantity))
    .slice(0, 4);
  
  // Get unique categories for filter
  const categories = ["all", ...new Set(products.map(product => product.category))];

  useEffect(() => {
    fetchProducts();
    // Get username from local storage or other source
    const storedUserName = localStorage.getItem("userName") || "User";
    setUserName(storedUserName);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await API.get("/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data || []);
      setError("");
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, type) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = type === "increase" ? "increase" : "decrease";
      const response = await API.put(
        `/products/${id}/${endpoint}`,
        { quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === id
              ? {
                  ...product,
                  quantity: type === "increase" ? product.quantity + 1 : Math.max(0, product.quantity - 1),
                }
              : product
          )
        );
        setError("");
      }
    } catch (error) {
      console.error(`Error updating quantity:`, error);
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("Failed to update quantity.");
      }
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prevProducts) => prevProducts.filter((product) => product._id !== id));
      setError("");
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product.");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      (searchTerm === "" || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "all" || product.category === selectedCategory)
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-700">
             <span className="text-indigo-800">Product Overview</span> 
          </h2>
          <p className="text-gray-500 mt-2">Here's an overview of your Products</p>
        </div>
        
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
  {/* Total Stock */}
  <div className="bg-white rounded-lg shadow-sm border border-l-4 border-l-blue-500 overflow-hidden">
    <div className="p-5 flex items-center">
      <div className="mr-4 bg-blue-100 rounded-lg p-3">
        <FaBoxes className="text-blue-500 text-xl" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Total Stock</h3>
        <p className="text-2xl font-bold text-gray-800">{totalStock}</p>
      </div>
    </div>
  </div>

  {/* Low Stock Alerts */}
  <div className="bg-white rounded-lg shadow-sm border border-l-4 border-l-red-500 overflow-hidden">
    <div className="p-5 flex items-center">
      <div className="mr-4 bg-red-100 rounded-lg p-3">
        <FaExclamationTriangle className="text-red-500 text-xl" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
        <p className="text-2xl font-bold text-gray-800">{lowStockProducts.length}</p>
      </div>
    </div>
  </div>

  {/* Total Products */}
  <div className="bg-white rounded-lg shadow-sm border border-l-4 border-l-yellow-500 overflow-hidden">
    <div className="p-5 flex items-center">
      <div className="mr-4 bg-yellow-100 rounded-lg p-3">
        <FaBoxes className="text-yellow-500 text-xl" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
        <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
      </div>
    </div>
  </div>
</div>

        {/* Search and Filter Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition duration-200"
          >
            <FaFilter className="text-gray-500" />
            <span className="text-gray-600">Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Sort By</label>
                <div className="flex items-center gap-2">
                  <select 
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                  >
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="quantity">Quantity</option>
                    <option value="price">Price</option>
                  </select>
                  
                  <button 
                    onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                    className="p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <FaSortAmountDown className={`transform ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform text-gray-500`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Products and Top Profitable Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <h3 className="font-medium text-gray-700">Low Stock Products</h3>
            </div>
            <div className="p-4">
              {lowStockProducts.length > 0 ? (
                <ul className="divide-y">
                  {lowStockProducts.slice(0, 6).map(product => (
                    <li key={product._id} className="py-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800">{product.name}</span>
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                          Only {product.quantity} left!
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No low stock products
                </div>
              )}
            </div>
          </div>
          
          {/* Top Profitable Products */}
          
        
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm">
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">Category</th>
                    <th className="p-3 text-center font-medium">Quantity</th>
                    <th className="p-3 text-right font-medium">Buying Price</th>
                    <th className="p-3 text-right font-medium">Selling Price</th>
                    <th className="p-3 text-center font-medium">Low Stock Alert</th>
                    <th className="p-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr 
                        key={product._id} 
                        className={`border-b hover:bg-gray-50 transition duration-150 ${
                          product.quantity <= product.lowStockAlert ? "bg-gray-50" : ""
                        }`}
                      >
                        <td className="p-3 text-left">
                          <div className="font-medium text-gray-800">{product.name}</div>
                          <div className="text-xs text-gray-500">ID: {product._id}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center items-center space-x-2">
                            <button
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition duration-200"
                              onClick={() => updateQuantity(product._id, "decrease")}
                              disabled={product.quantity === 0}
                            >
                              <span className="text-lg font-medium">−</span>
                            </button>
                            <span className={`text-lg font-medium ${
                              product.quantity <= product.lowStockAlert ? "text-red-600" : "text-gray-800"
                            }`}>
                              {product.quantity}
                            </span>
                            <button
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition duration-200"
                              onClick={() => updateQuantity(product._id, "increase")}
                            >
                              <span className="text-lg font-medium">+</span>
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right text-gray-600">₹{product.buyingPrice}</td>
                        <td className="p-3 text-right font-medium text-gray-800">₹{product.price}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md text-sm ${
                            product.quantity <= product.lowStockAlert 
                              ? "bg-red-100 text-red-600" 
                              : "bg-gray-50 text-gray-600"
                          }`}>
                            {product.lowStockAlert}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            className="w-9 h-9 bg-gray-100 text-gray-500 rounded-md hover:bg-gray-200 transition duration-200 flex items-center justify-center"
                            onClick={() => deleteProduct(product._id)}
                            title="Delete Product"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center py-8">
                          <FaBoxes className="text-3xl text-gray-300 mb-3" />
                          <p className="text-base font-medium text-gray-600">No products found</p>
                          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOverview;