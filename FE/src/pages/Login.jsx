import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [apiLog, setApiLog] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const logApiEvent = (type, message, details = {}) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString(),
      details,
    };
    setApiLog((prev) => [newLog, ...prev].slice(0, 10));
    console.log(`[${type.toUpperCase()}]`, message, details);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      logApiEvent("request", "Login attempt initiated", { email });

      const success = await login(email, password); // Assuming login returns a boolean

      if (success) {
        logApiEvent("success", "Login successful", { email });

        if (onClose) onClose();
        navigate("/account");
      } else {
        const errorDetails = { code: "invalid_credentials" };
        logApiEvent("error", "Login failed", errorDetails);

        setError("Incorrect email or password");
      }
    } catch (err) {
      logApiEvent("exception", "Unexpected error during login", {
        message: err.message,
        stack: err.stack,
      });

      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 space-y-6 transform transition-all hover:scale-[1.02] hover:shadow-3xl">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 mb-4">
            Finance Tracker
          </h2>
          <p className="text-gray-500 mb-8">
            Manage your finances with precision
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 animate-pulse">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-md"
          >
            Sign In
          </button>
        </form>

        {/* Additional Links */}
        <div className="text-center">
          <a
            href="/forgot-password"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Forgot Password?
          </a>
          <p className="mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-500 font-medium hover:text-blue-700"
            >
              Sign Up
            </a>
          </p>
        </div>

        {/* API Console Log */}
        {apiLog.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              API Console
            </h3>
            {apiLog.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded-md mb-1 text-xs ${
                  log.type === "error"
                    ? "bg-red-50 text-red-700"
                    : log.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                [{log.type.toUpperCase()}] {log.message}
                <div className="text-xs text-gray-500">{log.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
