import { useState, useEffect } from 'react';
import { getPOs, createPO, updatePOStatus, receivePO, deletePO } from '../api/api';
import { getSuppliers } from "../api/api";
import { getProducts } from '../api/api';
import { toast } from 'react-toastify';

export default function PurchaseOrderPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPO, setCurrentPO] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDate: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    status: 'Sent'
  });

  // Fetch all necessary data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [posRes, suppliersRes, productsRes] = await Promise.all([
        getPOs(),
        getSuppliers(),
        getProducts()
      ]);
      setPurchaseOrders(posRes.data);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle item changes - auto-fill buying price
  const handleItemChange = async (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    
    if (name === 'productId' && value) {
      const selectedProduct = products.find(p => p._id === value);
      newItems[index] = { 
        ...newItems[index], 
        productId: value,
        unitPrice: selectedProduct?.buyingPrice || 0 
      };
    } else {
      newItems[index] = { ...newItems[index], [name]: value };
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Add new item row with default values
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  // Remove item row
  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Submit PO
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        status: formData.status
      };
  
      if (currentPO) {
        await updatePO(currentPO._id, submissionData);
        toast.success('PO updated successfully');
      } else {
        await createPO(submissionData);
        toast.success('PO created successfully');
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Receive PO
  const handleReceive = async (id) => {
    if (window.confirm('Mark this PO as received and update inventory?')) {
      try {
        await receivePO(id);
        toast.success('PO received and inventory updated');
        fetchData();
      } catch (error) {
        toast.error('Receival failed');
      }
    }
  };

  // Delete PO
  const handleDelete = async (id) => {
    if (window.confirm('Delete this purchase order?')) {
      try {
        await deletePO(id);
        toast.success('PO deleted');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="pl-64 pr-6 py-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
        <div className="flex items-center mb-3 ">
          <div className="bg-indigo-800 h-12 w-1 rounded-full mr-4"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-800 to-indigo-900 bg-clip-text text-transparent mb-1">Purchase New Stock</h1>
            <p className="text-sm sm:text-base text-indigo-600 opacity-75">Update Inventory quantities for existing products</p>
          </div>
        </div>
       
          <button
            onClick={() => {
              setCurrentPO(null);
              setFormData({
                supplierId: '',
                expectedDate: '',
                items: [{ productId: '', quantity: 1, unitPrice: 0 }],
                status: 'Sent'
              });
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md shadow-sm transition-colors duration-200 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Purchase Order
          </button>
        </div>

        {/* PO Table with improved styling */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-100">
                
                  <th className="py-3.5 px-4 text-left text-sm font-medium text-slate-700">Supplier</th>
                  <th className="py-3.5 px-4 text-left text-sm font-medium text-slate-700">Items</th>
                  <th className="py-3.5 px-4 text-left text-sm font-medium text-slate-700">Total</th>
                  <th className="py-3.5 px-4 text-left text-sm font-medium text-slate-700">Status</th>
                  <th className="py-3.5 px-4 text-left text-sm font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                      No purchase orders found. Create your first one!
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map(po => (
                    <tr key={po._id} className="hover:bg-slate-50 transition-colors duration-150">
                    
                      <td className="py-4 px-4 text-sm text-slate-700">
                        {po.supplierId?.name || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-700">
                        {po.items.length} {po.items.length === 1 ? 'product' : 'products'}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-700 font-medium">
                        ₹{po.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          po.status === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                          po.status === 'Sent' ? 'bg-sky-100 text-sky-800' : 
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <div className="flex space-x-3">
                          {po.status !== 'Received' && (
                            <button
                              onClick={() => handleReceive(po._id)}
                              className="text-emerald-600 hover:text-emerald-800 font-medium"
                            >
                              Received
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(po._id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PO Modal with improved styling */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  {currentPO ? 'Edit Purchase Order' : 'Create New Purchase Order'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Supplier*</label>
                    <select
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery Date</label>
                    <input
                      type="date"
                      name="expectedDate"
                      value={formData.expectedDate}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-slate-800">Items</h3>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Item
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-12 gap-3 mb-2 text-xs font-medium text-slate-500 px-1">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-4">Unit Price (₹)</div>
                      <div className="col-span-1"></div>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-5">
                            <select
                              name="productId"
                              value={item.productId}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map(product => (
                                <option key={product._id} value={product._id}>
                                  {product.name} (Stock: {product.quantity})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              name="quantity"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              min="1"
                              required
                            />
                          </div>
                          <div className="col-span-4">
                            <input
                              type="number"
                              name="unitPrice"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              min="0"
                              step="0.01"
                              required
                            />
                            {item.productId && (
                              <p className="text-xs text-slate-500 mt-1 pl-1">
                                Standard price: ₹{
                                  products.find(p => p._id === item.productId)?.buyingPrice?.toFixed(2) || '0.00'
                                }
                              </p>
                            )}
                          </div>
                          <div className="col-span-1 flex justify-center pt-2.5">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <input type="hidden" name="status" value="Sent" />
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 font-medium shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium shadow-sm transition-colors duration-200"
                  >
                    {currentPO ? 'Update Purchase Order' : 'Buy New Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}