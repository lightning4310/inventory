import { useState, useEffect } from "react";
import { recordSale, getProducts } from "../api/api";
import Select from "react-select";

const AddSale = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([{ product: null, quantity: 1 }]); // Initialize with one product entry
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        const productOptions = response.data.map((product) => ({
          value: product._id,
          label: product.name,
          price: product.price,
          stock: product.quantity
        }));
        setProducts(productOptions);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products. Please try again.");
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { product: null, quantity: 1 }]);
  };

  const handleProductChange = (index, selectedOption) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].product = selectedOption;
    setSelectedProducts(updatedProducts);
  };

  const handleQuantityChange = (index, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = Math.max(1, Number(value));
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate selected products
    if (selectedProducts.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    for (const item of selectedProducts) {
      if (!item.product) {
        setError("Please select a product for all items.");
        return;
      }
      if (item.quantity <= 0) {
        setError("Quantity must be at least 1 for all products.");
        return;
      }
      if (item.quantity > item.product.stock) {
        setError(`Not enough stock for ${item.product.label}. Available: ${item.product.stock}`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const items = selectedProducts.map(item => ({
        productId: item.product.value,
        quantity: item.quantity
      }));

      const response = await recordSale({ items });
  
      if (response.status === 201) {
        setSuccess("Sales recorded successfully!");
        setSelectedProducts([{ product: null, quantity: 1 }]); // Reset to one default entry
      } else {
        setError("Failed to record sales. Please try again.");
      }
    } catch (error) {
      console.error("Error adding sales:", error);
      setError(
        error.response?.data?.message || "Failed to record sales. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total value of current sale
  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      if (item.product && item.quantity) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0).toFixed(2);
  };

  return (
    <div className="ml-0 md:ml-64  min-h-screen p-4 sm:p-6">
      <div className="max-w-3xl mx-auto md:mx-0 lg:mx-auto">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-800 h-12 w-1 rounded-full mr-4"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-800 to-indigo-900 bg-clip-text text-transparent mb-1">Record Sale</h1>
            <p className="text-sm sm:text-base text-indigo-600 opacity-75">Record new sales transactions and update your revenue data effortlessly</p>
          </div>
        </div>
        
        <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-lg shadow-indigo-100/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm animate-fadeIn flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg text-sm animate-fadeIn flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <button
                type="button"
                onClick={handleAddProduct}
                className="flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition duration-300 mb-6 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Another Product
              </button>

              <div className="mb-6 overflow-hidden rounded-lg border border-indigo-100">
                <div className="bg-indigo-50 px-4 py-2 text-indigo-800 font-semibold text-sm">
                  Products in this sale
                </div>
                
                {selectedProducts.map((item, index) => (
                  <div key={index} className="p-4 border-t border-indigo-100 hover:bg-indigo-50/50 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      <div className="lg:col-span-5">
                        <label className="block text-indigo-800 font-medium mb-2 text-sm">Product</label>
                        <Select
                          options={products.filter(p => 
                            !selectedProducts.some((sp, i) => i !== index && sp.product?.value === p.value)
                          )}
                          value={item.product}
                          onChange={(selectedOption) => handleProductChange(index, selectedOption)}
                          placeholder="Select product..."
                          isClearable
                          isSearchable
                          className="w-full"
                          classNamePrefix="select"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              borderColor: '#e5e7eb',
                              minHeight: '42px',
                              borderRadius: '0.5rem',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white',
                              color: state.isSelected ? 'white' : '#1e1b4b',
                            }),
                          }}
                        />
                      </div>
                      
                      <div className="lg:col-span-3">
                        <label className="block text-indigo-800 font-medium mb-2 text-sm">Quantity</label>
                        <input
                          type="number"
                          placeholder="Quantity"
                          className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-indigo-800 shadow-sm"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          min="1"
                        />
                      </div>

                      <div className="lg:col-span-2 flex items-end">
                        {item.product && (
                          <div className="text-sm text-indigo-800">
                            <span className="block font-medium">Price</span>
                            <span className="text-lg font-semibold">₹{item.product.price}</span>
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-2">
                        {selectedProducts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(index)}
                            className="w-full bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition duration-300 font-medium flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-indigo-50 p-4 flex justify-between items-center border-t border-indigo-100">
                  <span className="font-medium text-indigo-800">Total Sale Value:</span>
                  <span className="text-xl font-bold text-indigo-900">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || selectedProducts.length === 0}
                className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-900 transition duration-300 font-medium flex items-center justify-center shadow-md shadow-indigo-500/20 ${
                  isSubmitting || selectedProducts.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Record Sale
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSale;