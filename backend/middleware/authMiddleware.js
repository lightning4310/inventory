import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify JWT token
export const protect = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password"); // Fetch user without password

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if user is an admin
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error in role verification" });
  }
};
