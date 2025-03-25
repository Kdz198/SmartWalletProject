import React, { useState, useEffect } from 'react';
import { FaPlus, FaEllipsisH, FaTimes, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

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
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [createFormData, setCreateFormData] = useState({
    name: '',
    type: false,
    total: '',
    month: '',
  });
  const [editFormData, setEditFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const accountId = user?.id;

  const fetchBudgetsAndDeals = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const budgetResponse = await fetch(`http://localhost:8080/api/budget/findbyaccount?id=${accountId}`, {
        credentials: 'include',
      });
      if (!budgetResponse.ok) throw new Error('Không thể lấy dữ liệu ngân sách');
      const budgetData = await budgetResponse.json();

      const dealResponse = await fetch(`http://localhost:8080/api/deal/findbyaccount?id=${accountId}`, {
        credentials: 'include',
      });
      if (!dealResponse.ok) throw new Error('Không thể lấy dữ liệu giao dịch');
      const dealData = await dealResponse.json();

      const formattedBudgets = budgetData.map((budget) => {
        const relatedDeals = dealData.filter((deal) => deal.budget?.id === budget.id);
        const spent = relatedDeals.reduce((sum, deal) => sum + deal.total, 0);
        return {
          id: budget.id,
          name: budget.name,
          type: budget.type,
          total: budget.total,
          month: budget.month,
          spent: spent,
        };
      });

      setBudgets(formattedBudgets);
      setDeals(dealData);
      applyFilter(formattedBudgets, selectedType, selectedMonth);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const applyFilter = (budgetList, typeFilter, monthFilter) => {
    let filtered = budgetList;
    if (typeFilter !== '') {
      filtered = filtered.filter((budget) => budget.type === (typeFilter === 'true'));
    }
    if (monthFilter !== '') {
      filtered = filtered.filter((budget) => budget.month === parseInt(monthFilter, 10));
    }
    setFilteredBudgets(filtered);
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

  useEffect(() => {
    if (user && accountId) {
      fetchBudgetsAndDeals();
    }
  }, [user, accountId]);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({ ...createFormData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      setFormErrors({ general: 'Vui lòng đăng nhập để tạo ngân sách' });
      return;
    }
    try {
      const payload = {
        name: createFormData.name,
        type: createFormData.type === 'true' || createFormData.type === true,
        total: parseInt(createFormData.total, 10),
        month: parseInt(createFormData.month, 10),
        account: { id: accountId },
      };

      const response = await fetch('http://localhost:8080/api/budget/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      await fetchBudgetsAndDeals();
      setIsCreateModalOpen(false);
      setCreateFormData({
        name: '',
        type: false,
        total: '',
        month: '',
      });
      setFormErrors({});
    } catch (err) {
      if (err.errors) {
        const errorMap = {};
        err.errors.forEach((error) => {
          errorMap[error.field] = error.defaultMessage;
        });
        setFormErrors(errorMap);
      } else {
        setFormErrors({ general: 'Có lỗi xảy ra khi tạo ngân sách' });
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !editFormData.id) {
      setFormErrors({ general: 'Dữ liệu không hợp lệ để cập nhật ngân sách' });
      return;
    }
    try {
      const payload = {
        id: editFormData.id,
        name: editFormData.name,
        type: editFormData.type === 'true' || editFormData.type === true,
        total: parseInt(editFormData.total, 10),
        month: parseInt(editFormData.month, 10),
        account: { id: accountId },
      };

      const response = await fetch('http://localhost:8080/api/budget/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      await fetchBudgetsAndDeals();
      setIsEditModalOpen(false);
      setEditFormData(null);
      setFormErrors({});
    } catch (err) {
      if (err.errors) {
        const errorMap = {};
        err.errors.forEach((error) => {
          errorMap[error.field] = error.defaultMessage;
        });
        setFormErrors(errorMap);
      } else {
        setFormErrors({ general: 'Có lỗi xảy ra khi cập nhật ngân sách' });
      }
    }
  };

  const handleDelete = async (budgetId) => {
    if (!confirm('Bạn có chắc muốn xóa ngân sách này không?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/budget/delete?id=${budgetId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Không thể xóa ngân sách');
      await fetchBudgetsAndDeals();
      setOpenDropdown(null);
    } catch (err) {
      console.error('Lỗi khi xóa ngân sách:', err.message);
      alert('Có lỗi xảy ra khi xóa ngân sách');
    }
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
      if (!deal) throw new Error('Không tìm thấy giao dịch');

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

      const response = await fetch('http://localhost:8080/api/deal/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      await fetchBudgetsAndDeals();
      setIsAddDealModalOpen(false);
    } catch (err) {
      console.error('Lỗi khi thêm deal vào ngân sách:', err.message);
      alert('Có lỗi xảy ra khi thêm deal vào ngân sách');
    }
  };

  const handleRemoveDealFromBudget = async (dealId) => {
    try {
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) throw new Error('Không tìm thấy giao dịch');

      const payload = {
        id: deal.id,
        type: deal.type,
        total: deal.total,
        description: deal.description,
        date: deal.date,
        method: deal.method,
        category: deal.category ? { id: deal.category.id } : null,
        account: { id: accountId },
        budget: null, // Gỡ liên kết với ngân sách
      };

      const response = await fetch('http://localhost:8080/api/deal/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      await fetchBudgetsAndDeals();
    } catch (err) {
      console.error('Lỗi khi gỡ deal khỏi ngân sách:', err.message);
      alert('Có lỗi xảy ra khi gỡ deal khỏi ngân sách');
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 text-lg">Vui lòng đăng nhập để xem ngân sách.</p></div>;
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 text-lg">Đang tải...</p></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-red-600 text-lg">Lỗi: {error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ngân sách của bạn</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Loại:</label>
                <select
                  value={selectedType}
                  onChange={handleTypeFilterChange}
                  className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 ease-in-out"
                >
                  <option value="">Tất cả</option>
                  <option value="false">Thu nhập</option>
                  <option value="true">Chi tiêu</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Tháng:</label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthFilterChange}
                  className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 ease-in-out"
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
                  setSelectedType('');
                  setSelectedMonth('');
                  applyFilter(budgets, '', '');
                }}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
              >
                Hiện tất cả
              </button>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
            >
              <FaPlus size={16} /> <span className="font-medium">Thêm ngân sách</span>
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {filteredBudgets.length === 0 ? (
            <p className="text-gray-500 text-center">Chưa có ngân sách nào.</p>
          ) : (
            filteredBudgets.map((budget) => {
              const spentPercentage = budget.total > 0 ? (budget.spent / budget.total) * 100 : 0;
              const availableDeals = deals.filter((deal) => !deal.budget);
              return (
                <div
                  key={budget.id}
                  className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between border border-gray-100 cursor-pointer"
                  onClick={() => handleOpenDealsModal(budget.id)}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        budget.type ? 'bg-red-100' : 'bg-green-100'
                      }`}
                    >
                      <span
                        className={`text-lg font-semibold ${budget.type ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {budget.type ? '-' : '+'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-800">{budget.name}</p>
                      <p className="text-sm text-gray-500">Tháng {budget.month}</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              spentPercentage > 100 ? 'bg-red-600' : budget.type ? 'bg-red-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {budget.type ? 'Đã chi' : 'Đã thu'}: {budget.spent.toLocaleString('vi-VN')} /{' '}
                          {budget.total.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                    <p
                      className={`text-lg font-semibold ${budget.type ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {budget.total.toLocaleString('vi-VN')} VNĐ
                    </p>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(budget.id)}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                      >
                        <FaEllipsisH size={16} />
                      </button>
                      {openDropdown === budget.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                          <ul className="py-1 text-sm text-gray-700">
                            <li
                              onClick={() => handleEdit(budget)}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                            >
                              Sửa ngân sách
                            </li>
                            <li
                              onClick={() => handleDelete(budget.id)}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 text-red-600"
                            >
                              Xóa
                            </li>
                            {availableDeals.length > 0 && (
                              <li
                                onClick={() => handleOpenAddDealModal(budget.id)}
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                              >
                                Thêm deal vào ngân sách
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

        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Thêm ngân sách mới</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên ngân sách</label>
                  <input
                    type="text"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại ngân sách</label>
                  <select
                    name="type"
                    value={createFormData.type}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={false}>Thu nhập</option>
                    <option value={true}>Chi tiêu</option>
                  </select>
                  {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    name="total"
                    value={createFormData.total}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {formErrors.total && <p className="text-red-500 text-sm mt-1">{formErrors.total}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tháng</label>
                  <input
                    type="number"
                    name="month"
                    value={createFormData.month}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    min="1"
                    max="12"
                    required
                  />
                  {formErrors.month && <p className="text-red-500 text-sm mt-1">{formErrors.month}</p>}
                </div>
                {formErrors.general && <p className="text-red-500 text-sm">{formErrors.general}</p>}
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-300"
                >
                  Tạo ngân sách
                </button>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && editFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Sửa ngân sách</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên ngân sách</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại ngân sách</label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={false}>Thu nhập</option>
                    <option value={true}>Chi tiêu</option>
                  </select>
                  {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    name="total"
                    value={editFormData.total}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {formErrors.total && <p className="text-red-500 text-sm mt-1">{formErrors.total}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tháng</label>
                  <input
                    type="number"
                    name="month"
                    value={editFormData.month}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    min="1"
                    max="12"
                    required
                  />
                  {formErrors.month && <p className="text-red-500 text-sm mt-1">{formErrors.month}</p>}
                </div>
                {formErrors.general && <p className="text-red-500 text-sm">{formErrors.general}</p>}
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-300"
                >
                  Cập nhật ngân sách
                </button>
              </form>
            </div>
          </div>
        )}

        {isAddDealModalOpen && selectedBudgetId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Chọn giao dịch để thêm vào ngân sách</h2>
                <button onClick={() => setIsAddDealModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {(() => {
                  const selectedBudget = budgets.find((b) => b.id === selectedBudgetId);
                  const budgetType = selectedBudget?.type;
                  const availableDeals = deals.filter(
                    (deal) => !deal.budget && deal.type === budgetType
                  );
                  return availableDeals.length === 0 ? (
                    <p className="text-gray-500 text-center">
                      Không có giao dịch {budgetType ? 'chi tiêu' : 'thu nhập'} nào để thêm.
                    </p>
                  ) : (
                    availableDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => handleAddDealToBudget(deal.id, selectedBudgetId)}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-gray-800 font-medium">{deal.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(deal.date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <p
                          className={`text-lg font-semibold ${
                            deal.type ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {deal.type ? '-' : '+'}
                          {deal.total.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    ))
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {isDealsModalOpen && selectedBudgetId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách giao dịch của ngân sách</h2>
                <button onClick={() => setIsDealsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {(() => {
                  const selectedBudget = budgets.find((b) => b.id === selectedBudgetId);
                  const relatedDeals = deals.filter((deal) => deal.budget?.id === selectedBudgetId);
                  return relatedDeals.length === 0 ? (
                    <p className="text-gray-500 text-center">
                      Chưa có giao dịch nào trong ngân sách "{selectedBudget?.name}".
                    </p>
                  ) : (
                    relatedDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="text-gray-800 font-medium">{deal.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(deal.date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p
                            className={`text-lg font-semibold ${
                              deal.type ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {deal.type ? '-' : '+'}
                            {deal.total.toLocaleString('vi-VN')} VNĐ
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Bạn có chắc muốn gỡ giao dịch này khỏi ngân sách không?')) {
                                handleRemoveDealFromBudget(deal.id);
                              }
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
      </div>
    </div>
  );
};

export default BudgetPage;