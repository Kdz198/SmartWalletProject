import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import AccountPage from "../pages/AccountPage";
import TransactionPage from "../pages/TransactionPage";
import Dashboard from "../pages/DashboardPage";
import BudgetPage from "../pages/BudgetPage";
import CategoryPage from "../pages/CategoryPage";
import NotificationPage from "../pages/NotificationPage";
// Placeholder components for pages that need backend
const PlaceholderPage = ({ title, description }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-gray-600">{description}</p>
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Backend Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This page requires backend data to function properly. UI
                  components are ready but await API integration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/signup" element={<SignUp />} />{" "}
      {/* Thêm route cho SignUp */}
      <Route path="/transactions" element={<TransactionPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/budgets" element={<BudgetPage />} />
      <Route path="/categories" element={<CategoryPage />} />
      <Route path="/notifications" element={<NotificationPage />} />
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
