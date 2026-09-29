import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Auth helper function
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

// ==================== AUTH API ====================
// These don't need auth headers as they're for login/registration
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// ==================== PRODUCTS API ====================
export const getProducts = () => API.get("/products", getAuthHeaders());
export const addProduct = (data) => API.post("/products", data, getAuthHeaders());
export const updateProduct = (id, data) => API.put(`/products/${id}`, data, getAuthHeaders());
export const deleteProduct = (id) => API.delete(`/products/${id}`, getAuthHeaders());

// ==================== SALES API ====================
export const getSales = () => API.get("/sales", getAuthHeaders());
export const recordSale = (data) => API.post("/sales", data, getAuthHeaders());

// ==================== SUPPLIERS API ====================
export const getSuppliers = () => API.get("/suppliers", getAuthHeaders());
export const createSupplier = (data) => API.post("/suppliers", data, getAuthHeaders());
export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data, getAuthHeaders());
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`, getAuthHeaders());

// ==================== PURCHASE ORDERS API ====================
export const getPOs = () => API.get("/purchase-orders", getAuthHeaders());
export const createPO = (data) => API.post("/purchase-orders", data, getAuthHeaders());
export const updatePOStatus = (id, status) => 
  API.put(`/purchase-orders/${id}/status`, { status }, getAuthHeaders());
export const receivePO = (id) => API.put(`/purchase-orders/${id}/receive`, {}, getAuthHeaders());
export const deletePO = (id) => API.delete(`/purchase-orders/${id}`, getAuthHeaders());



export default API;