import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import AddSale from "./pages/AddSale";
import RegisterUser from "./pages/RegisterUser";
import SalesOverview from "./pages/SalesOverview";
import Login from "./pages/Login";
import ProductOverview from "./pages/ProductOverview";

import UserList from "./pages/UserList";
import MonthlyYearlySalesReport from "./pages/MonthlyYearlySalesReport";
import ProtectedRoute from "./components/ProtectedRoute";
import SupplierList from "./pages/SupplierList";
import PurchaseOrderPage from "./pages/Purchase";



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login Route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes with Sidebar */}
          <Route
            path="/*"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <Routes>
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="add-product"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AddProduct />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="add-sale"
                      element={
                        <ProtectedRoute allowedRoles={["admin", "employee"]}>
                          <AddSale />
                        </ProtectedRoute>
                      }
                    />
                     <Route
                      path="/purchase"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          < PurchaseOrderPage/>
                        </ProtectedRoute>
                      }
                    />
                 
                    
                    <Route
                      path="register-user"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <RegisterUser />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="sales-overview"
                      element={
                        <ProtectedRoute allowedRoles={["admin", "employee"]}>
                          <SalesOverview />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/sales-report"
                      element={
                        <ProtectedRoute allowedRoles={["admin", "employee"]}>
                          <MonthlyYearlySalesReport />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="product-overview"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <ProductOverview />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user-overview"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <UserList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/suppliers"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          < SupplierList/>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                  
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;