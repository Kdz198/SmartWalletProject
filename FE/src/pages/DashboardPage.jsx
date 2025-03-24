import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import formatCurrency from "../utils/formatCurrency";
import formatDate from "../utils/formatDate"; // Import utilities

const Dashboard = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [deals, setDeals] = useState([]);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentMonth = 3; // Hard-coded for now
  const accountId = user?.id;

  // Enhanced error handling with detailed logging and user feedback
  const handleApiError = (error, context) => {
    const errorMessage = error.message || "An unexpected error occurred";
    console.error(`${context} Error:`, {
      message: errorMessage,
      stack: error.stack,
    });

    // Log detailed response if available (from BE)
    if (error.response) {
      console.error("API Response:", {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
      });
      toast.error(
        error.response.data.message ||
          `Failed to ${context}. Please try again.`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else {
      console.error("No response received:", error);
      toast.error(`Failed to ${context}. Check your connection and try again.`);
    }

    setLoading(false);
  };

  // Fetch data with detailed logging
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        console.log("Fetching budgets with params:", {
          currentMonth,
          accountId,
        });
        const response = await fetch(
          `http://localhost:8080/api/budget/findbymonthandaccount?month=${currentMonth}&id=${accountId}`,
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw Object.assign(new Error("Failed to fetch budgets"), {
            response: { data: errorData, status: response.status },
          });
        }

        const data = await response.json();
        console.log("Budgets fetched successfully:", data);
        setBudgets(data);
      } catch (error) {
        handleApiError(error, "fetch budgets");
      }
    };

    const fetchDeals = async () => {
      try {
        console.log("Fetching deals with params:", { accountId });
        const response = await fetch(
          `http://localhost:8080/api/deal/findbyaccount?id=${accountId}`,
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw Object.assign(new Error("Failed to fetch deals"), {
            response: { data: errorData, status: response.status },
          });
        }

        const data = await response.json();
        console.log("Deals fetched successfully:", data);
        setDeals(data);
      } catch (error) {
        handleApiError(error, "fetch deals");
      }
    };

    if (user && accountId) {
      setLoading(true);
      console.log("Initializing dashboard for user:", user.email);
      Promise.all([fetchBudgets(), fetchDeals()])
        .then(() => console.log("Dashboard data loaded successfully"))
        .catch((error) => {
          console.error("Dashboard initialization failed:", error);
          toast.error("Failed to load dashboard data. Please try again later.");
        })
        .finally(() => setLoading(false));
    }
  }, [user, accountId]);

  // UI for unauthenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
        <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-300">
            Access your financial insights securely
          </p>
        </div>
      </div>
    );
  }

  // UI for loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculations (unchanged logic)
  const totalIncome = deals
    .filter((deal) => !deal.type)
    .reduce((sum, deal) => sum + deal.total, 0);
  const totalExpense = deals
    .filter((deal) => deal.type)
    .reduce((sum, deal) => sum + deal.total, 0);
  const remaining = totalIncome - totalExpense;

  const recentDeals = deals
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const categorySummary = deals
    .filter((deal) => deal.type)
    .reduce((acc, deal) => {
      const categoryName = deal.category?.name || "Uncategorized";
      acc[categoryName] = (acc[categoryName] || 0) + deal.total;
      return acc;
    }, {});

  const toggleQuickMenu = () => setIsQuickMenuOpen(!isQuickMenuOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-gray-100 p-6">
      <ToastContainer
        theme="dark"
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent animate-pulse">
            Dashboard
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            Hello, {user.email}! Today is {formatDate(new Date(), "en-US")}
          </p>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Overview & Budget Progress */}
          <div className="space-y-6">
            {/* Account Overview */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">
                Account Overview (March 2025)
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Total Income</span>
                  <span className="text-cyan-400 font-bold">
                    {formatCurrency(totalIncome, "VND", "en-US")}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Total Expenses</span>
                  <span className="text-pink-500 font-bold">
                    {formatCurrency(totalExpense, "VND", "en-US")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Remaining</span>
                  <span className="text-cyan-400 font-bold">
                    {formatCurrency(remaining, "VND", "en-US")}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">
                Budget Progress
              </h2>
              <div className="space-y-3 text-sm">
                {budgets.length > 0 ? (
                  budgets.map((budget) => (
                    <div
                      key={budget.id}
                      className="flex justify-between items-center border-b border-gray-700 pb-2"
                    >
                      <span>{budget.name || "Unknown"}</span>
                      <span className="text-gray-300">
                        {formatCurrency(budget.spent || 0, "VND", "en-US")} /{" "}
                        {formatCurrency(budget.total || 0, "VND", "en-US")} (
                        {budget.total
                          ? ((budget.spent / budget.total) * 100).toFixed(0)
                          : 0}
                        %)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No budgets available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column: Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">
                Income vs Expenses (March 2025)
              </h2>
              <div className="h-96 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p>Pie Chart Placeholder:</p>
                  <p>
                    Income: {formatCurrency(totalIncome, "VND", "en-US")} (
                    {(
                      (totalIncome / (totalIncome + totalExpense)) * 100 || 0
                    ).toFixed(0)}
                    %)
                  </p>
                  <p>
                    Expenses: {formatCurrency(totalExpense, "VND", "en-US")} (
                    {(
                      (totalExpense / (totalIncome + totalExpense)) * 100 || 0
                    ).toFixed(0)}
                    %)
                  </p>
                  <p className="text-sm mt-2">
                    (Replace with Chart.js or similar library)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Category Summary, Recent Deals, Comparison */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">
              Category Summary (All Expenses)
            </h2>
            <div className="space-y-3 text-sm">
              {Object.keys(categorySummary).length > 0 ? (
                Object.entries(categorySummary).map(([category, total]) => (
                  <div
                    key={category}
                    className="flex justify-between items-center border-b border-gray-700 pb-2"
                  >
                    <span>{category}</span>
                    <span className="text-pink-500 font-bold">
                      {formatCurrency(total, "VND", "en-US")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No expense transactions yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">
              Recent Transactions
            </h2>
            <div className="space-y-3 text-sm">
              {recentDeals.length > 0 ? (
                recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex justify-between items-center border-b border-gray-700 pb-2"
                  >
                    <span>
                      {formatDate(deal.date, "en-US")} -{" "}
                      {deal.description || "No description"} (
                      {deal.category?.name || "Uncategorized"})
                    </span>
                    <span
                      className={
                        deal.type ? "text-pink-500 font-bold" : "text-cyan-400"
                      }
                    >
                      {deal.type ? "-" : "+"}
                      {formatCurrency(deal.total, "VND", "en-US")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No transactions yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">
              Compared to Last Month
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span>Income: 10M (Mar) vs 8M (Feb)</span>
                <span className="text-cyan-400 font-bold">
                  {formatCurrency(2000000, "VND", "en-US")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Expenses: 6M (Mar) vs 5M (Feb)</span>
                <span className="text-pink-500 font-bold">
                  {formatCurrency(1000000, "VND", "en-US")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Button */}
      <div
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform duration-300 z-50"
        onClick={toggleQuickMenu}
      >
        <span className="text-3xl text-white">+</span>
      </div>
      <div
        className={`fixed bottom-24 right-6 bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-2xl p-4 transition-all duration-300 z-40 ${
          isQuickMenuOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <ul className="space-y-2">
          {[
            "Add Transaction",
            "Add Budget",
            "View All Transactions",
            "View All Budgets",
            "Manage Categories",
            "Account Settings",
          ].map((item) => (
            <li key={item}>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80 hover:text-white rounded-lg transition-colors"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
