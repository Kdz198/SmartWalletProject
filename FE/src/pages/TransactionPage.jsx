import React, { useState, useEffect } from "react";
import { FaPlus, FaEllipsisH, FaTimes } from "react-icons/fa";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    type: true,
    total: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // Default là ngày hiện tại
    method: true,
    category: { id: "" },
    account: { id: "1" }, // Default account ID là 1
    budget: { id: "" },
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      console.log("API Request: GET /api/deal");
      const response = await fetch("http://localhost:8080/api/deal", {
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể lấy dữ liệu giao dịch: ${errorText}`);
      }
      const data = await response.json();
      console.log("API Response: Transactions fetched successfully", data);
      const formattedData = data.map((item) => ({
        id: item.id,
        type: item.type ? "earn" : "pay",
        total: item.total,
        description: item.description || "No description",
        date: item.date,
        method: item.method ? "Bank" : "Cash",
        account: item.account
          ? { name: `Account ${item.account.id}` }
          : { name: "Not specified" },
        category: item.category?.id || null,
        budget: item.budget?.id || null,
      }));
      setTransactions(formattedData);
    } catch (err) {
      console.error("Fetch Transactions Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log("API Request: GET /api/category");
      const response = await fetch("http://localhost:8080/api/category", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Không thể lấy danh sách phân loại");
      const data = await response.json();
      console.log("API Response: Categories fetched successfully", data);
      setCategories(data);
    } catch (err) {
      console.error("Fetch Categories Error:", err.message);
    }
  };

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      console.log("API Request: GET /api/budget/findbyaccount?id=1");
      const response = await fetch(
        "http://localhost:8080/api/budget/findbyaccount?id=1",
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Không thể lấy danh sách ngân sách");
      const data = await response.json();
      console.log("API Response: Budgets fetched successfully", data);
      setBudgets(data);
    } catch (err) {
      console.error("Fetch Budgets Error:", err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchBudgets();
  }, []);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "category" || name === "account" || name === "budget"
          ? { id: value }
          : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type: formData.type === "true" || formData.type === true,
      total: parseInt(formData.total, 10),
      description: formData.description || "No description",
      date: formData.date,
      method: formData.method === "true" || formData.method === true,
      category: formData.category.id
        ? { id: parseInt(formData.category.id, 10) }
        : null,
      account: formData.account.id
        ? { id: parseInt(formData.account.id, 10) }
        : null,
      budget: formData.budget.id
        ? { id: parseInt(formData.budget.id, 10) }
        : null,
    };

    try {
      console.log("API Request: POST /api/deal/create", payload);
      const response = await fetch("http://localhost:8080/api/deal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw errorData;
      }

      const result = await response.json();
      console.log("API Response: Transaction created successfully", result);
      await fetchTransactions();
      setIsModalOpen(false);
      setFormData({
        type: true,
        total: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        method: true,
        category: { id: "" },
        account: { id: "1" },
        budget: { id: "" },
      });
      setFormErrors({});
    } catch (err) {
      console.error("Create Transaction Error:", err);
      if (err.errors) {
        const errorMap = {};
        err.errors.forEach((error) => {
          errorMap[error.field] = error.defaultMessage; // Giữ nguyên message từ BE bằng tiếng Anh
        });
        setFormErrors(errorMap);
        console.log("Validation Errors from BE:", errorMap);
      } else {
        setFormErrors({
          general:
            err.message || "An error occurred while creating the transaction",
        });
        console.log("General Error:", err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-lg font-medium">
          Loading data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg shadow-md text-red-600 text-lg font-medium">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Transaction Management
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-full hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FaPlus size={18} />
            <span className="font-semibold">Add Transaction</span>
          </button>
        </div>

        {/* Transaction List */}
        <div className="space-y-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-500 text-lg font-medium">
                No transactions recorded yet.
              </p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex items-center justify-between group"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                      transaction.type === "earn"
                        ? "bg-teal-100"
                        : "bg-rose-100"
                    }`}
                  >
                    <span
                      className={`text-xl font-bold ${
                        transaction.type === "earn"
                          ? "text-teal-600"
                          : "text-rose-600"
                      }`}
                    >
                      {transaction.type === "earn" ? "+" : "-"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-800">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(transaction.date, "en-US")} •{" "}
                      {transaction.method} •{" "}
                      <span className="text-gray-600 font-medium">
                        {transaction.account.name}
                      </span>
                      {transaction.category && (
                        <span className="ml-2 text-teal-500 font-medium">
                          #
                          {categories.find(
                            (cat) => cat.id === transaction.category
                          )?.name || transaction.category}
                        </span>
                      )}
                      {transaction.budget && (
                        <span className="ml-2 text-indigo-500 font-medium">
                          #
                          {budgets.find((bud) => bud.id === transaction.budget)
                            ?.name || transaction.budget}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <p
                    className={`text-xl font-semibold ${
                      transaction.type === "earn"
                        ? "text-teal-600"
                        : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(transaction.total, "VND", "en-US")}
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(transaction.id)}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                    >
                      <FaEllipsisH size={18} />
                    </button>
                    {openDropdown === transaction.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-10 border border-gray-100 overflow-hidden">
                        <ul className="py-2 text-sm text-gray-700">
                          <li className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150 font-medium">
                            Edit Transaction
                          </li>
                          <li className="px-4 py-2.5 hover:bg-rose-50 cursor-pointer transition-colors duration-150 text-rose-600 font-medium">
                            Delete Transaction
                          </li>
                          {!transaction.budget && (
                            <li className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150 font-medium">
                              Add to Budget
                            </li>
                          )}
                          {!transaction.category && (
                            <li className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150 font-medium">
                              Add Category
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create New Transaction
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                  >
                    <option value={true}>Income</option>
                    <option value={false}>Expense</option>
                  </select>
                  {formErrors.type && (
                    <p className="text-rose-500 text-sm mt-1 font-medium">
                      {formErrors.type}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Amount (VND)
                  </label>
                  <input
                    type="number"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                    required
                    placeholder="Enter amount"
                  />
                  {formErrors.total && (
                    <p className="text-rose-500 text-sm mt-1 font-medium">
                      {formErrors.total}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                    placeholder="e.g., Shopping, Monthly Salary"
                  />
                  {formErrors.description && (
                    <p className="text-rose-500 text-sm mt-1 font-medium">
                      {formErrors.description}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.date && (
                    <p className="text-rose-500 text-sm mt-1 font-medium">
                      {formErrors.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                  >
                    <option value={true}>Bank</option>
                    <option value={false}>Cash</option>
                  </select>
                  {formErrors.method && (
                    <p className="text-rose-500 text-sm mt-1 font-medium">
                      {formErrors.method}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category.id || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-rose-500 text-sm mt-1 font-medium">
                      {formErrors.category}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Account
                  </label>
                  <input
                    type="number"
                    name="account"
                    value={formData.account.id}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                    placeholder="Enter account ID"
                  />
                  {formErrors.account && (
                    <p className="text-rose-500 text-sm mt-1 font-medium">
                      {formErrors.account}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Budget
                  </label>
                  <select
                    name="budget"
                    value={formData.budget.id || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                  >
                    <option value="">No budget selected</option>
                    {budgets.map((bud) => (
                      <option key={bud.id} value={bud.id}>
                        {bud.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.budget && (
                    <p className="text-rose-500 text-sm mt-1 font-medium">
                      {formErrors.budget}
                    </p>
                  )}
                </div>
                {formErrors.general && (
                  <div className="bg-rose-50 p-3 rounded-lg text-rose-600 text-sm font-medium">
                    {formErrors.general}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 font-semibold"
                >
                  Create Transaction
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
