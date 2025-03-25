import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEllipsisH,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransactionPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const transactionsPerPage = 10;
  const [createFormData, setCreateFormData] = useState({
    type: false,
    total: "",
    description: "",
    date: "",
    method: true,
    category: { id: "" },
    budget: { id: "" },
  });
  const [editFormData, setEditFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const accountId = user?.id;

  const fetchTransactions = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      let url = `http://localhost:8080/api/deal/findbyaccount?id=${accountId}`;
      if (selectedCategory && !selectedBudget) {
        url = `http://localhost:8080/api/deal/findbyaccountandcate?accountId=${accountId}&CateId=${selectedCategory}`;
      } else if (selectedBudget && !selectedCategory) {
        url = `http://localhost:8080/api/deal/findbybudgetandaccount?accountId=${accountId}&id=${selectedBudget}`;
      } else if (selectedCategory && selectedBudget) {
        url = `http://localhost:8080/api/deal/findbybudgetandaccount?accountId=${accountId}&id=${selectedBudget}`;
      }
      console.log(`API Request: GET ${url}`);
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(errorData.message || "Không thể lấy dữ liệu giao dịch");
      }
      const data = await response.json();
      console.log("API Response Success: Transactions fetched", data);
      const formattedData = data
        .map((item) => ({
          id: item.id,
          type: item.type ? "pay" : "earn",
          total: item.total,
          description: item.description,
          date: item.date,
          method: item.method ? "Bank" : "Cash",
          account: item.account
            ? { name: `Tài khoản ${item.account.id}` }
            : { name: "Chưa xác định" },
          category: item.category?.id || null,
          budget: item.budget?.id || null,
        }))
        .sort((a, b) => (sortOrder === "desc" ? b.id - a.id : a.id - b.id));
      setTransactions(formattedData);
      applyFilters(formattedData);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải giao dịch:", err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("API Request: GET /api/category");
      const systemResponse = await fetch("http://localhost:8080/api/category", {
        credentials: "include",
      });
      if (!systemResponse.ok) {
        const errorData = await systemResponse.json();
        console.error("API Response Error:", errorData);
        throw new Error(
          errorData.message || "Không thể lấy danh sách category hệ thống"
        );
      }
      const systemData = await systemResponse.json();
      console.log(
        "API Response Success: System categories fetched",
        systemData
      );
      const systemCategories = systemData.filter((cat) => !cat.account);

      let userCategories = [];
      if (accountId) {
        console.log(
          `API Request: GET /api/category/findbyaccountid?accountId=${accountId}`
        );
        const userResponse = await fetch(
          `http://localhost:8080/api/category/findbyaccountid?accountId=${accountId}`,
          {
            credentials: "include",
          }
        );
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          console.error("API Response Error:", errorData);
          throw new Error(
            errorData.message ||
              "Không thể lấy danh sách category của người dùng"
          );
        }
        userCategories = await userResponse.json();
        console.log(
          "API Response Success: User categories fetched",
          userCategories
        );
      }

      const combinedCategories = [...systemCategories, ...userCategories];
      setCategories(combinedCategories);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách category:", err.message);
    }
  };

  const fetchBudgets = async () => {
    if (!accountId) return;
    try {
      console.log(`API Request: GET /api/budget/findbyaccount?id=${accountId}`);
      const response = await fetch(
        `http://localhost:8080/api/budget/findbyaccount?id=${accountId}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(
          errorData.message || "Không thể lấy danh sách ngân sách"
        );
      }
      const data = await response.json();
      console.log("API Response Success: Budgets fetched", data);
      setBudgets(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách budget:", err.message);
    }
  };

  const applyFilters = (data) => {
    let filtered = [...data];
    if (selectedType !== "") {
      filtered = filtered.filter((t) =>
        selectedType === "true" ? t.type === "pay" : t.type === "earn"
      );
    }
    if (selectedMonth !== "") {
      filtered = filtered.filter(
        (t) => new Date(t.date).getMonth() + 1 === parseInt(selectedMonth, 10)
      );
    }
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (user && accountId) {
      setLoading(true);
      Promise.all([
        fetchTransactions(),
        fetchCategories(),
        fetchBudgets(),
      ]).finally(() => setLoading(false));
    }
  }, [user, accountId, selectedCategory, selectedBudget, sortOrder]);

  useEffect(() => {
    applyFilters(transactions);
  }, [selectedType, selectedMonth, transactions]);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleBudgetFilterChange = (e) => {
    setSelectedBudget(e.target.value);
  };

  const handleTypeFilterChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleMonthFilterChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const validateForm = (data) => {
    const errors = {};
    if (data.type === null || data.type === undefined || data.type === "")
      errors.type = "Loại giao dịch không được để trống";
    if (!data.total || data.total <= 0)
      errors.total = "Số tiền phải là số dương";
    if (!data.date) errors.date = "Ngày không được để trống";
    if (data.method === null || data.method === undefined || data.method === "")
      errors.method = "Phương thức không được để trống";
    return errors;
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "category" || name === "budget" ? { id: value } : value;
    const updatedFormData = { ...createFormData, [name]: newValue };
    setCreateFormData(updatedFormData);
    setFormErrors(validateForm(updatedFormData));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "category" || name === "budget" ? { id: value } : value;
    const updatedFormData = { ...editFormData, [name]: newValue };
    setEditFormData(updatedFormData);
    setFormErrors(validateForm(updatedFormData));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      setFormErrors({ general: "Vui lòng đăng nhập để tạo giao dịch" });
      console.error("Lỗi: Người dùng chưa đăng nhập");
      return;
    }

    const errors = validateForm(createFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        type: createFormData.type === "true" || createFormData.type === true,
        total: parseInt(createFormData.total, 10),
        description: createFormData.description,
        date: createFormData.date,
        method:
          createFormData.method === "true" || createFormData.method === true,
        category: createFormData.category.id
          ? { id: parseInt(createFormData.category.id, 10) }
          : null,
        account: { id: accountId },
        budget: createFormData.budget.id
          ? { id: parseInt(createFormData.budget.id, 10) }
          : null,
      };
      console.log("API Request: POST /api/deal/create", payload);

      const response = await fetch("http://localhost:8080/api/deal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(errorData.message || "Có lỗi xảy ra khi tạo giao dịch");
      }

      const responseData = await response.json();
      console.log("API Response Success: Transaction created", responseData);
      await fetchTransactions();
      setIsCreateModalOpen(false);
      setCreateFormData({
        type: false,
        total: "",
        description: "",
        date: "",
        method: true,
        category: { id: "" },
        budget: { id: "" },
      });
      setFormErrors({});
      toast.success("Giao dịch đã được tạo thành công!");
    } catch (err) {
      console.error("Lỗi khi tạo giao dịch:", err.message);
      setFormErrors({ general: err.message });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !editFormData.id) {
      setFormErrors({ general: "Dữ liệu không hợp lệ để cập nhật giao dịch" });
      console.error("Lỗi: Dữ liệu không hợp lệ");
      return;
    }

    const errors = validateForm(editFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        id: editFormData.id,
        type: editFormData.type === "true" || editFormData.type === true,
        total: parseInt(editFormData.total, 10),
        description: editFormData.description,
        date: editFormData.date,
        method: editFormData.method === "true" || editFormData.method === true,
        category: editFormData.category.id
          ? { id: parseInt(editFormData.category.id, 10) }
          : null,
        account: { id: accountId },
        budget: editFormData.budget.id
          ? { id: parseInt(editFormData.budget.id, 10) }
          : null,
      };
      console.log("API Request: POST /api/deal/update", payload);

      const response = await fetch(`http://localhost:8080/api/deal/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(
          errorData.message || "Có lỗi xảy ra khi cập nhật giao dịch"
        );
      }

      const responseData = await response.json();
      console.log("API Response Success: Transaction updated", responseData);
      await fetchTransactions();
      setIsEditModalOpen(false);
      setEditFormData(null);
      setFormErrors({});
      toast.success("Giao dịch đã được cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật giao dịch:", err.message);
      setFormErrors({ general: err.message });
    }
  };

  const handleDelete = async () => {
    try {
      console.log(`API Request: DELETE /api/deal/delete?id=${dealToDelete}`);
      const response = await fetch(
        `http://localhost:8080/api/deal/delete?id=${dealToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(errorData.message || "Không thể xóa giao dịch");
      }
      console.log("API Response Success: Transaction deleted", dealToDelete);
      await fetchTransactions();
      setOpenDropdown(null);
      setIsDeleteModalOpen(false);
      toast.success("Giao dịch đã được xóa thành công!");
    } catch (err) {
      console.error("Lỗi khi xóa giao dịch:", err.message);
      toast.error("Có lỗi xảy ra khi xóa giao dịch: " + err.message);
    }
  };

  const handleConfirmDelete = (dealId) => {
    setDealToDelete(dealId);
    setIsDeleteModalOpen(true);
    setOpenDropdown(null);
  };

  const handleEdit = (deal) => {
    setEditFormData({
      id: deal.id,
      type: deal.type === "pay",
      total: deal.total.toString(),
      description: deal.description,
      date: deal.date,
      method: deal.method === "Bank",
      category: { id: deal.category || "" },
      budget: { id: deal.budget || "" },
    });
    setIsEditModalOpen(true);
    setOpenDropdown(null);
  };

  const handleAddCategory = async (dealId, categoryId) => {
    try {
      const deal = transactions.find((t) => t.id === dealId);
      if (!deal) throw new Error("Không tìm thấy giao dịch");
      const payload = {
        id: deal.id,
        type: deal.type === "pay",
        total: deal.total,
        description: deal.description,
        date: deal.date,
        method: deal.method === "Bank",
        category: { id: parseInt(categoryId, 10) },
        account: { id: accountId },
        budget: deal.budget ? { id: deal.budget } : null,
      };
      console.log("API Request: POST /api/deal/update (Add Category)", payload);

      const response = await fetch(`http://localhost:8080/api/deal/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(errorData.message || "Không thể cập nhật giao dịch");
      }

      const responseData = await response.json();
      console.log("API Response Success: Category added", responseData);
      await fetchTransactions();
      setIsAddCategoryModalOpen(false);
      setOpenDropdown(null);
      toast.success("Phân loại đã được thêm thành công!");
    } catch (err) {
      console.error("Lỗi khi thêm phân loại:", err.message);
      toast.error("Có lỗi xảy ra khi thêm phân loại: " + err.message);
    }
  };

  const handleAddBudget = async (dealId, budgetId) => {
    try {
      const deal = transactions.find((t) => t.id === dealId);
      if (!deal) throw new Error("Không tìm thấy giao dịch");
      const payload = {
        id: deal.id,
        type: deal.type === "pay",
        total: deal.total,
        description: deal.description,
        date: deal.date,
        method: deal.method === "Bank",
        category: deal.category ? { id: deal.category } : null,
        account: { id: accountId },
        budget: { id: parseInt(budgetId, 10) },
      };
      console.log("API Request: POST /api/deal/update (Add Budget)", payload);

      const response = await fetch(`http://localhost:8080/api/deal/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(errorData.message || "Không thể cập nhật giao dịch");
      }

      const responseData = await response.json();
      console.log("API Response Success: Budget added", responseData);
      await fetchTransactions();
      setIsAddBudgetModalOpen(false);
      setOpenDropdown(null);
      toast.success("Ngân sách đã được thêm thành công!");
    } catch (err) {
      console.error("Lỗi khi thêm vào ngân sách:", err.message);
      toast.error("Có lỗi xảy ra khi thêm vào ngân sách: " + err.message);
    }
  };

  const openAddCategoryModal = (dealId) => {
    setSelectedDealId(dealId);
    setIsAddCategoryModalOpen(true);
    setOpenDropdown(null);
  };

  const openAddBudgetModal = (dealId) => {
    setSelectedDealId(dealId);
    setIsAddBudgetModalOpen(true);
    setOpenDropdown(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 flex items-center justify-center">
        <p className="text-gray-700 text-xl font-semibold">
          Vui lòng đăng nhập để xem giao dịch.
        </p>
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 flex items-center justify-center">
        <p className="text-gray-700 text-xl font-semibold">Đang tải...</p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 flex items-center justify-center">
        <p className="text-red-600 text-xl font-semibold">Lỗi: {error}</p>
      </div>
    );

  const hasErrors = (data) => Object.keys(validateForm(data)).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Phân loại:
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryFilterChange}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Tất cả</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Ngân sách:
                </label>
                <select
                  value={selectedBudget}
                  onChange={handleBudgetFilterChange}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="">Tất cả</option>
                  {budgets.map((bud) => (
                    <option key={bud.id} value={bud.id}>
                      {bud.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Loại:
                </label>
                <select
                  value={selectedType}
                  onChange={handleTypeFilterChange}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="">Tất cả</option>
                  <option value="false">Thu nhập</option>
                  <option value="true">Chi tiêu</option>
                </select>
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Tháng:
                </label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthFilterChange}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                >
                  <option value="">Tất cả</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Tháng {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedBudget("");
                  setSelectedType("");
                  setSelectedMonth("");
                }}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
              >
                Hiện tất cả
              </button>
              <button
                onClick={toggleSortOrder}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                {sortOrder === "desc" ? (
                  <FaArrowDown size={16} />
                ) : (
                  <FaArrowUp size={16} />
                )}
              </button>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-3 rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              <FaPlus size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {currentTransactions.length === 0 ? (
            <p className="text-gray-600 text-center font-medium">
              Chưa có giao dịch nào.
            </p>
          ) : (
            currentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between border border-gray-100 transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "earn"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <span
                      className={`text-lg font-semibold ${
                        transaction.type === "earn"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "earn" ? "+" : "-"}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString("vi-VN")} •{" "}
                      {transaction.method} •{" "}
                      <span className="text-gray-600 font-medium">
                        {transaction.account.name}
                      </span>
                      {transaction.category && (
                        <span className="ml-2 text-blue-500">
                          #
                          {categories.find(
                            (cat) => cat.id === transaction.category
                          )?.name || transaction.category}
                        </span>
                      )}
                      {transaction.budget && (
                        <span className="ml-2 text-purple-500">
                          #
                          {budgets.find((bud) => bud.id === transaction.budget)
                            ?.name || transaction.budget}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p
                    className={`text-lg font-semibold ${
                      transaction.type === "earn"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "earn" ? "+" : ""}
                    {Math.abs(transaction.total).toLocaleString("vi-VN")} VNĐ
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(transaction.id)}
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                    >
                      <FaEllipsisH size={16} />
                    </button>
                    {openDropdown === transaction.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                        <ul className="py-1 text-sm text-gray-700">
                          <li
                            onClick={() => handleEdit(transaction)}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          >
                            Sửa giao dịch
                          </li>
                          <li
                            onClick={() => handleConfirmDelete(transaction.id)}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 text-red-600"
                          >
                            Xóa
                          </li>
                          {!transaction.category && (
                            <li
                              onClick={() =>
                                openAddCategoryModal(transaction.id)
                              }
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                            >
                              Thêm phân loại
                            </li>
                          )}
                          {!transaction.budget && (
                            <li
                              onClick={() => openAddBudgetModal(transaction.id)}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                            >
                              Thêm ngân sách
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

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Thêm giao dịch mới
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Loại giao dịch
                  </label>
                  <select
                    name="type"
                    value={createFormData.type}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  >
                    <option value={false}>Thu nhập</option>
                    <option value={true}>Chi tiêu</option>
                  </select>
                  {formErrors.type && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.type}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="total"
                    value={createFormData.total}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.total && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.total}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={createFormData.description}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngày
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={createFormData.date}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.date && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phương thức
                  </label>
                  <select
                    name="method"
                    value={createFormData.method}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  >
                    <option value={true}>Ngân hàng</option>
                    <option value={false}>Tiền mặt</option>
                  </select>
                  {formErrors.method && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.method}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phân loại (tuỳ chọn)
                  </label>
                  <select
                    name="category"
                    value={createFormData.category.id || ""}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  >
                    <option value="">-- Chọn phân loại --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngân sách (tuỳ chọn)
                  </label>
                  <select
                    name="budget"
                    value={createFormData.budget.id || ""}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  >
                    <option value="">-- Chọn ngân sách --</option>
                    {budgets.map((bud) => (
                      <option key={bud.id} value={bud.id}>
                        {bud.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.general && (
                  <p className="text-red-500 text-sm">{formErrors.general}</p>
                )}
                <button
                  type="submit"
                  disabled={hasErrors(createFormData)}
                  className={`w-full py-3 rounded-lg transition-all duration-300 font-semibold shadow-md ${
                    hasErrors(createFormData)
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:from-blue-700 hover:to-indigo-600"
                  }`}
                >
                  Tạo giao dịch
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Sửa giao dịch
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Loại giao dịch
                  </label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  >
                    <option value={false}>Thu nhập</option>
                    <option value={true}>Chi tiêu</option>
                  </select>
                  {formErrors.type && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.type}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="total"
                    value={editFormData.total}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.total && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.total}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngày
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.date && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phương thức
                  </label>
                  <select
                    name="method"
                    value={editFormData.method}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  >
                    <option value={true}>Ngân hàng</option>
                    <option value={false}>Tiền mặt</option>
                  </select>
                  {formErrors.method && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.method}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phân loại (tuỳ chọn)
                  </label>
                  <select
                    name="category"
                    value={editFormData.category.id || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  >
                    <option value="">-- Chọn phân loại --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngân sách (tuỳ chọn)
                  </label>
                  <select
                    name="budget"
                    value={editFormData.budget.id || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  >
                    <option value="">-- Chọn ngân sách --</option>
                    {budgets.map((bud) => (
                      <option key={bud.id} value={bud.id}>
                        {bud.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.general && (
                  <p className="text-red-500 text-sm">{formErrors.general}</p>
                )}
                <button
                  type="submit"
                  disabled={hasErrors(editFormData)}
                  className={`w-full py-3 rounded-lg transition-all duration-300 font-semibold shadow-md ${
                    hasErrors(editFormData)
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:from-blue-700 hover:to-indigo-600"
                  }`}
                >
                  Cập nhật giao dịch
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {isAddCategoryModalOpen && selectedDealId && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Chọn phân loại
                </h2>
                <button
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {categories.length === 0 ? (
                  <p className="text-gray-600 text-center font-medium">
                    Không có phân loại nào.
                  </p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleAddCategory(selectedDealId, cat.id)}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200"
                    >
                      {cat.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Budget Modal */}
        {isAddBudgetModalOpen && selectedDealId && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Chọn ngân sách
                </h2>
                <button
                  onClick={() => setIsAddBudgetModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {budgets.length === 0 ? (
                  <p className="text-gray-600 text-center font-medium">
                    Không có ngân sách nào.
                  </p>
                ) : (
                  budgets.map((bud) => (
                    <div
                      key={bud.id}
                      onClick={() => handleAddBudget(selectedDealId, bud.id)}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200"
                    >
                      {bud.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Xác nhận xóa giao dịch
                </h2>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <p className="text-gray-700 mb-6">
                Bạn có chắc muốn xóa giao dịch này không?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center gap-2"
                >
                  <FaCheck />
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
        />
      </div>
    </div>
  );
};

export default TransactionPage;
