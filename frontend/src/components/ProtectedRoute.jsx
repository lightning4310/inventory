import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />; // Redirect to login if not authenticated
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/sales-overview" replace />; // Redirect if role is not allowed
  }

  return children;
};

export default ProtectedRoute;