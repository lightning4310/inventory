import React, { useState } from "react";
import axios from "axios";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    buyingPrice: "",
    lowStockAlert: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/products", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 201) {
        setSuccess(true);
        setForm({
          name: "",
          category: "",
          quantity: "",
          price: "",
          buyingPrice: "",
          lowStockAlert: "",
        });
        setError("");
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("Failed to add product. Please try again.");
      }
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="p-6 ml-64 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
          <div className="bg-indigo-800 h-12 w-1 rounded-full mr-4"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-800 to-indigo-900 bg-clip-text text-transparent mb-1">Add New Product</h1>
            <p className="text-sm sm:text-base text-indigo-600 opacity-75">Create a new product in your inventor</p>
          </div>
        </div>
        

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Product added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-group">
                <label htmlFor="name" className="block text-sm font-medium text-indigo-800 mb-1">
                  Product Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category" className="block text-sm font-medium text-indigo-800 mb-1">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-group">
                <label htmlFor="quantity" className="block text-sm font-medium text-indigo-800 mb-1">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lowStockAlert" className="block text-sm font-medium text-indigo-800 mb-1">
                  Low Stock Alert
                </label>
                <input
                  id="lowStockAlert"
                  type="number"
                  className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.lowStockAlert}
                  onChange={(e) => setForm({ ...form, lowStockAlert: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-group">
                <label htmlFor="buyingPrice" className="block text-sm font-medium text-indigo-800 mb-1">
                  Buying Price (₹)
                </label>
                <input
                  id="buyingPrice"
                  type="number"
                  className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.buyingPrice}
                  onChange={(e) => setForm({ ...form, buyingPrice: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price" className="block text-sm font-medium text-indigo-800 mb-1">
                  Selling Price (₹)
                </label>
                <input
                  id="price"
                  type="number"
                  className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-900 transition duration-300 font-medium flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Product
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">
              <span className="text-indigo-800">Tip:</span> Make sure to set appropriate low stock alerts to maintain inventory levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;