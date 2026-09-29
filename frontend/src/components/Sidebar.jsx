import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaShoppingCart,
  FaBoxOpen,
  FaUserPlus,
  FaChartLine,
  FaBoxes,
  FaUsers,
  FaSignOutAlt,
  FaFileInvoice,
  FaTruck,
  FaWarehouse,
  FaClipboardList,
  FaMoneyBillWave,
  FaUserTie,
  FaBuilding,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavItem = ({ to, icon, label }) => (
    <Link
      to={to}
      className={`p-3 rounded-lg transition-all duration-200 flex items-center ${
        isActive(to)
          ? "bg-indigo-900/30 text-indigo-200 border-l-4 border-indigo-400"
          : "hover:bg-slate-700/50 text-slate-300 hover:text-white"
      } ${isCollapsed ? "justify-center" : ""}`}
    >
      <span className="text-lg">{icon}</span>
      {!isCollapsed && <span className="ml-3 font-medium">{label}</span>}
    </Link>
  );

  return (
    <div className="h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col fixed border-r border-slate-700/50 shadow-xl transition-all duration-300 ease-in-out"
         style={{ width: isCollapsed ? "5rem" : "16rem" }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
        {!isCollapsed && (
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-teal-300">
            Inventory System
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <FaArrowRight /> : <FaArrowLeft />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-grow overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* Admin Navigation */}
        {user?.role === "admin" && (
          <>
            <NavItem to="/dashboard" icon={<FaTachometerAlt />} label="Dashboard" />
            <NavItem to="/add-product" icon={<FaPlusCircle />} label="Add Product" />
            <NavItem to="/add-sale" icon={<FaShoppingCart />} label="Add New Sale" />
            <NavItem to="/purchase" icon={<FaTruck />} label="Purchase Stock" />
            <NavItem to="/register-user" icon={<FaUserPlus />} label="Register User" />
            <NavItem to="/sales-overview" icon={<FaChartLine />} label="Sales Overview" />
            <NavItem to="/sales-report" icon={<FaFileInvoice />} label="Sales Report" />
            <NavItem to="/product-overview" icon={<FaBoxes />} label="Product Overview" />
            <NavItem to="/user-overview" icon={<FaUserTie />} label="User Overview" />
            <NavItem to="/suppliers" icon={<FaBuilding />} label="Supplier Overview" />
          </>
        )}

        {/* Employee Navigation */}
        {user?.role === "employee" && (
          <>
            <NavItem to="/add-sale" icon={<FaShoppingCart />} label="New Sale" />
            <NavItem to="/sales-overview" icon={<FaChartLine />} label="Sales Overview" />
            <NavItem to="/sales-report" icon={<FaFileInvoice />} label="Sales Report" />
          </>
        )}
      </div>

      {/* Footer with logout */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="w-full p-3 rounded-lg hover:bg-red-900/30 text-slate-300 hover:text-red-200 transition-colors flex items-center"
        >
          <span className="text-lg"><FaSignOutAlt /></span>
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;