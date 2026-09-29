import { useState } from "react";
import axios from "axios";

const RegisterUser = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("User registered!");
      setForm({ name: "", email: "", password: "", role: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center">
      <div className="flex flex-col items-left w-full max-w-md mt-5 p-8">
      <div className="flex items-center mb-2">
          <div className="bg-indigo-800 h-12 w-1 rounded-full mr-4"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-800 to-indigo-900 bg-clip-text text-transparent mb-1">Add New User</h1>
            <p className="text-sm sm:text-base text-indigo-600 opacity-75">Create a new user in your system</p>
          </div>
        </div>
        
        <div className="w-full bg-white p-8 shadow-lg rounded-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-indigo-800 font-medium">User Name</label>
              <input
                type="text"
                name="name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-indigo-800 font-medium">Email</label>
              <input
                type="email"
                name="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-indigo-800 font-medium">Password</label>
              <input
                type="password"
                name="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-indigo-800 font-medium">Role</label>
              <input
                type="text"
                name="role"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-900 transition duration-300 font-medium flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add User
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <p className="text-indigo-800">
              Tip: Make sure to assign appropriate roles to maintain proper access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;