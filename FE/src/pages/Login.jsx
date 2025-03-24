import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

const Login = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate(); // Khởi tạo useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password);
    if (success) {
      if (onClose) onClose(); // Đóng modal nếu có
      navigate("/account"); // Chuyển hướng đến /account
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
        Welcome Back
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="relative group">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-600 mb-2 transition-colors group-hover:text-blue-500"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
            placeholder="you@example.com"
            required
          />
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 top-8">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>

        {/* Password Field */}
        <div className="relative group">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-600 mb-2 transition-colors group-hover:text-blue-500"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
            placeholder="••••••••"
            required
          />
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 top-8">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5z"
              />
            </svg>
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md animate-pulse">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            Sign In
          </Button>
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Footer Link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Don’t have an account?{" "}
        <a
          href="/signup"
          className="text-blue-500 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          Sign up here
        </a>
      </p>
    </div>
  );
};

export default Login;
