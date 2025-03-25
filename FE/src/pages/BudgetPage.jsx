import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEllipsisH,
  FaTimes,
  FaPiggyBank,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const BudgetPage = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [isDealsModalOpen, setIsDealsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [createFormData, setCreateFormData] = useState({
    name: "",
    type: false,
    total: "",
    month: "",
  });
  const [editFormData, setEditFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const accountId = user?.id;

  // Hàm hiển thị toast
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Hàm lấy màu sắc cho toast
  const getToastColor = (type) => {
    switch (type) {
      case "create":
        return "green-500"; // Xanh lục cho tạo mới
      case "update":
        return "blue-500"; // Xanh dương cho cập nhật
      case "delete":
        return "red-500"; // Đỏ cho xóa
      case "error":
        return "red-500"; // Đỏ cho lỗi
      default:
        return "gray-500";
    }
  };

  const fetchBudgetsAndDeals = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const budgetResponse = await fetch(
        `http://localhost:8080/api/budget/findbyaccount?id=${accountId}`,
        { credentials: "include" }
      );
      if (!budgetResponse.ok)
        throw new Error("Không thể lấy dữ liệu ngân sách");
      const budgetData = await budgetResponse.json();

      const dealResponse = await fetch(
        `http://localhost:8080/api/deal/findbyaccount?id=${accountId}`,
        { credentials: "include" }
      );
      if (!dealResponse.ok) throw new Error("Không thể lấy dữ liệu giao dịch");
      const dealData = await dealResponse.json();

      const formattedBudgets = budgetData
        .map((budget) => {
          const relatedDeals = dealData.filter(
            (deal) => deal.budget?.id === budget.id
          );
          const spent = relatedDeals.reduce((sum, deal) => sum + deal.total, 0);
          return {
            id: budget.id,
            name: budget.name,
            type: budget.type,
            total: budget.total,
            month: budget.month,
            spent: spent,
          };
        })
        .slice()
        .reverse();

      setBudgets(formattedBudgets);
      setDeals(dealData);
      applyFilter(formattedBudgets, selectedType, selectedMonth);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      showToast(err.message, "error");
    }
  };

  const applyFilter = (budgetList, typeFilter, monthFilter) => {
    let filtered = [...budgetList];
    if (typeFilter !== "") {
      filtered = filtered.filter(
        (budget) => budget.type === (typeFilter === "true")
      );
    }
    if (monthFilter !== "") {
      filtered = filtered.filter(
        (budget) => budget.month === parseInt(monthFilter, 10)
      );
    }
    setFilteredBudgets(filtered);
  };

  useEffect(() => {
    if (user && accountId) {
      fetchBudgetsAndDeals();
    }
  }, [user, accountId]);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleTypeFilterChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);
    applyFilter(budgets, newType, selectedMonth);
  };

  const handleMonthFilterChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    applyFilter(budgets, selectedType, newMonth);
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name) errors.name = "Tên ngân sách không được để trống";
    if (!data.total || data.total <= 0)
      errors.total = "Số tiền phải là số dương";
    if (!data.month || data.month < 1 || data.month > 12)
      errors.month = "Tháng phải từ 1 đến 12";
    return errors;
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...createFormData, [name]: value };
    setCreateFormData(updatedFormData);
    setFormErrors(validateForm(updatedFormData));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...editFormData, [name]: value };
    setEditFormData(updatedFormData);
    setFormErrors(validateForm(updatedFormData));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      setFormErrors({ general: "Vui lòng đăng nhập để tạo ngân sách" });
      showToast("Vui lòng đăng nhập để tạo ngân sách", "error");
      return;
    }

    const errors = validateForm(createFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        name: createFormData.name,
        type: createFormData.type === "true" || createFormData.type === true,
        total: parseInt(createFormData.total, 10),
        month: parseInt(createFormData.month, 10),
        account: { id: accountId },
      };

      const response = await fetch("http://localhost:8080/api/budget/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Có lỗi xảy ra khi tạo ngân sách");
      }

      await fetchBudgetsAndDeals();
      setIsCreateModalOpen(false);
      setCreateFormData({
        name: "",
        type: false,
        total: "",
        month: "",
      });
      setFormErrors({});
      showToast("Ngân sách đã được tạo thành công!", "create");
    } catch (err) {
      console.error("Lỗi khi tạo ngân sách:", err.message);
      setFormErrors({ general: err.message });
      showToast(err.message, "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !editFormData.id) {
      setFormErrors({ general: "Dữ liệu không hợp lệ để cập nhật ngân sách" });
      showToast("Dữ liệu không hợp lệ để cập nhật ngân sách", "error");
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
        name: editFormData.name,
        type: editFormData.type === "true" || editFormData.type === true,
        total: parseInt(editFormData.total, 10),
        month: parseInt(editFormData.month, 10),
        account: { id: accountId },
      };

      const response = await fetch("http://localhost:8080/api/budget/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Có lỗi xảy ra khi cập nhật ngân sách"
        );
      }

      await fetchBudgetsAndDeals();
      setIsEditModalOpen(false);
      setEditFormData(null);
      setFormErrors({});
      showToast("Ngân sách đã được cập nhật thành công!", "update");
    } catch (err) {
      console.error("Lỗi khi cập nhật ngân sách:", err.message);
      setFormErrors({ general: err.message });
      showToast(err.message, "error");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/budget/delete?id=${budgetToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Kiểm tra lỗi khóa ngoại/khóa chính (thường là mã lỗi 400, 409 hoặc 500 tùy backend)
        if (
          errorData.message?.includes("foreign key") ||
          errorData.message?.includes("constraint")
        ) {
          throw new Error(
            "Không thể xóa ngân sách vì đang có giao dịch trong ngân sách. Vui lòng kiểm tra lại giao liên quan."
          );
        }
        throw new Error(
          errorData.message ||
            "Không thể xóa ngân sách vì đang có giao dịch trong ngân sách. Vui lòng kiểm tra lại giao liên quan."
        );
      }

      // Xóa thành công
      await fetchBudgetsAndDeals();
      showToast("Ngân sách đã được xóa thành công!", "delete");
    } catch (err) {
      console.error("Lỗi khi xóa ngân sách:", err.message);
      showToast(err.message, "error");
    } finally {
      // Luôn đóng modal và trở về màn chính dù thành công hay thất bại
      setOpenDropdown(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleConfirmDelete = (budgetId) => {
    setBudgetToDelete(budgetId);
    setIsDeleteModalOpen(true);
    setOpenDropdown(null);
  };

  const handleEdit = (budget) => {
    setEditFormData({
      id: budget.id,
      name: budget.name,
      type: budget.type,
      total: budget.total.toString(),
      month: budget.month.toString(),
    });
    setIsEditModalOpen(true);
    setOpenDropdown(null);
  };

  const handleOpenAddDealModal = (budgetId) => {
    setSelectedBudgetId(budgetId);
    setIsAddDealModalOpen(true);
    setOpenDropdown(null);
  };

  const handleOpenDealsModal = (budgetId) => {
    setSelectedBudgetId(budgetId);
    setIsDealsModalOpen(true);
  };

  const handleAddDealToBudget = async (dealId, budgetId) => {
    try {
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) throw new Error("Không tìm thấy giao dịch");

      const payload = {
        id: deal.id,
        type: deal.type,
        total: deal.total,
        description: deal.description,
        date: deal.date,
        method: deal.method,
        category: deal.category ? { id: deal.category.id } : null,
        account: { id: accountId },
        budget: { id: budgetId },
      };

      const response = await fetch("http://localhost:8080/api/deal/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật giao dịch");
      }

      await fetchBudgetsAndDeals();
      setIsAddDealModalOpen(false);
      showToast("Giao dịch đã được thêm vào ngân sách!", "update");
    } catch (err) {
      console.error("Lỗi khi thêm deal vào ngân sách:", err.message);
      showToast("Có lỗi xảy ra khi thêm deal: " + err.message, "error");
    }
  };

  const handleRemoveDealFromBudget = async (dealId) => {
    try {
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) throw new Error("Không tìm thấy giao dịch");

      const payload = {
        id: deal.id,
        type: deal.type,
        total: deal.total,
        description: deal.description,
        date: deal.date,
        method: deal.method,
        category: deal.category ? { id: deal.category.id } : null,
        account: { id: accountId },
        budget: null,
      };

      const response = await fetch("http://localhost:8080/api/deal/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật giao dịch");
      }

      await fetchBudgetsAndDeals();
      showToast("Giao dịch đã được gỡ khỏi ngân sách!", "update");
    } catch (err) {
      console.error("Lỗi khi gỡ deal khỏi ngân sách:", err.message);
      showToast("Có lỗi xảy ra khi gỡ deal: " + err.message, "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 flex items-center justify-center">
        <p className="text-gray-700 text-xl font-semibold">
          Vui lòng đăng nhập để xem ngân sách.
        </p>
        {toast.show && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`bg-${getToastColor(
                toast.type
              )} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in`}
            >
              <span>{toast.message}</span>
            </div>
          </div>
        )}
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
        {toast.show && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`bg-${getToastColor(
                toast.type
              )} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in`}
            >
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    );

  const hasErrors = (data) => Object.keys(validateForm(data)).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center space-x-2">
            <span>Ngân sách của bạn</span>
            <FaPiggyBank className="text-blue-600" />
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
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
                  setSelectedType("");
                  setSelectedMonth("");
                  applyFilter(budgets, "", "");
                }}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
              >
                Hiện tất cả
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
          {filteredBudgets.length === 0 ? (
            <p className="text-gray-600 text-center font-medium">
              Chưa có ngân sách nào.
            </p>
          ) : (
            filteredBudgets.map((budget) => {
              const spentPercentage =
                budget.total > 0 ? (budget.spent / budget.total) * 100 : 0;
              return (
                <div
                  key={budget.id}
                  className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between border border-gray-100 transform hover:scale-105 hover:z-10 relative"
                  onClick={() => handleOpenDealsModal(budget.id)}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        budget.type ? "bg-red-100" : "bg-green-100"
                      }`}
                    >
                      <span
                        className={`text-lg font-semibold ${
                          budget.type ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {budget.type ? "-" : "+"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">
                        {budget.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Tháng {budget.month}
                      </p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              spentPercentage > 100
                                ? "bg-red-600"
                                : budget.type
                                ? "bg-red-600"
                                : "bg-green-600"
                            }`}
                            style={{
                              width: `${Math.min(spentPercentage, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {budget.type ? "Đã chi" : "Đã thu"}:{" "}
                          {budget.spent.toLocaleString("vi-VN")} /{" "}
                          {budget.total.toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p
                      className={`text-lg font-semibold ${
                        budget.type ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {budget.total.toLocaleString("vi-VN")} VNĐ
                    </p>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(budget.id)}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 z-20"
                      >
                        <FaEllipsisH size={16} />
                      </button>
                      {openDropdown === budget.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
                          <ul className="py-1 text-sm text-gray-700">
                            <li
                              onClick={() => handleEdit(budget)}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                            >
                              Sửa ngân sách
                            </li>
                            <li
                              onClick={() => handleConfirmDelete(budget.id)}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 text-red-600"
                            >
                              Xóa
                            </li>
                            {deals.filter((deal) => !deal.budget).length >
                              0 && (
                              <li
                                onClick={() =>
                                  handleOpenAddDealModal(budget.id)
                                }
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                              >
                                Thêm giao dịch
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Toast */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`bg-${getToastColor(
                toast.type
              )} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in`}
            >
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Thêm ngân sách mới
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
                    Tên ngân sách
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Loại ngân sách
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
                    Tháng
                  </label>
                  <input
                    type="number"
                    name="month"
                    value={createFormData.month}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    min="1"
                    max="12"
                    required
                  />
                  {formErrors.month && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.month}
                    </p>
                  )}
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
                  Tạo ngân sách
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editFormData && (
          <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Sửa ngân sách
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
                    Tên ngân sách
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Loại ngân sách
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
                    Tháng
                  </label>
                  <input
                    type="number"
                    name="month"
                    value={editFormData.month}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    min="1"
                    max="12"
                    required
                  />
                  {formErrors.month && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.month}
                    </p>
                  )}
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
                  Cập nhật ngân sách
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Deal Modal */}
        {isAddDealModalOpen && selectedBudgetId && (
          <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Chọn giao dịch để thêm
                </h2>
                <button
                  onClick={() => setIsAddDealModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {(() => {
                  const selectedBudget = budgets.find(
                    (b) => b.id === selectedBudgetId
                  );
                  const budgetType = selectedBudget?.type;
                  const availableDeals = deals.filter(
                    (deal) => !deal.budget && deal.type === budgetType
                  );
                  return availableDeals.length === 0 ? (
                    <p className="text-gray-600 text-center font-medium">
                      Không có giao dịch {budgetType ? "chi tiêu" : "thu nhập"}{" "}
                      nào để thêm.
                    </p>
                  ) : (
                    availableDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() =>
                          handleAddDealToBudget(deal.id, selectedBudgetId)
                        }
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-gray-800 font-medium">
                            {deal.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(deal.date).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <p
                          className={`text-lg font-semibold ${
                            deal.type ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {deal.type ? "-" : "+"}
                          {deal.total.toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                    ))
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Deals Modal */}
        {isDealsModalOpen && selectedBudgetId && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Danh sách giao dịch
                </h2>
                <button
                  onClick={() => setIsDealsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {(() => {
                  const selectedBudget = budgets.find(
                    (b) => b.id === selectedBudgetId
                  );
                  const relatedDeals = deals.filter(
                    (deal) => deal.budget?.id === selectedBudgetId
                  );
                  return relatedDeals.length === 0 ? (
                    <p className="text-gray-600 text-center font-medium">
                      Chưa có giao dịch nào trong ngân sách "
                      {selectedBudget?.name}".
                    </p>
                  ) : (
                    relatedDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="text-gray-800 font-medium">
                            {deal.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(deal.date).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p
                            className={`text-lg font-semibold ${
                              deal.type ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {deal.type ? "-" : "+"}
                            {deal.total.toLocaleString("vi-VN")} VNĐ
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveDealFromBudget(deal.id);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  );
                })()}
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
                  Xác nhận xóa ngân sách
                </h2>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <p className="text-gray-700 mb-6">
                Bạn có chắc muốn xóa ngân sách này không?
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
      </div>
    </div>
  );
};

export default BudgetPage;
