import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Rehydrate user state from localStorage on page reload
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      setUser({ role, token }); // Set user state if token and role exist
    }
  }, []);

  const login = (userData) => {
    console.log("User Data on Login:", userData); // Debugging
    setUser(userData.user); // Set the user object
    localStorage.setItem("token", userData.token);
    localStorage.setItem("role", userData.user.role); // Set the role
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);