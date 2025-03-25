import React, { useState, useEffect } from 'react';
import { FaPlus, FaEllipsisH, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const TransactionPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false); // Modal thêm phân loại
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false); // Modal thêm ngân sách
  const [selectedDealId, setSelectedDealId] = useState(null); // Deal đang chọn để thêm category/budget
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const [createFormData, setCreateFormData] = useState({
    type: false,
    total: '',
    description: '',
    date: '',
    method: true,
    category: { id: '' },
    budget: { id: '' },
  });
  const [editFormData, setEditFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const accountId = user?.id;

  // Fetch transactions from API
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

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Không thể lấy dữ liệu giao dịch');
      const data = await response.json();
      const formattedData = data
        .map((item) => ({
          id: item.id,
          type: item.type ? 'pay' : 'earn',
          total: item.total,
          description: item.description,
          date: item.date,
          method: item.method ? 'Bank' : 'Cash',
          account: item.account ? { name: `Tài khoản ${item.account.id}` } : { name: 'Chưa xác định' },
          category: item.category?.id || null,
          budget: item.budget?.id || null,
        }))
        .sort((a, b) => b.id - a.id); // Sắp xếp giảm dần theo id
      setTransactions(formattedData);
      applyFilters(formattedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const systemResponse = await fetch('http://localhost:8080/api/category', { credentials: 'include' });
      if (!systemResponse.ok) throw new Error('Không thể lấy danh sách category hệ thống');
      const systemData = await systemResponse.json();
      const systemCategories = systemData.filter((cat) => !cat.account);

      let userCategories = [];
      if (accountId) {
        const userResponse = await fetch(`http://localhost:8080/api/category/findbyaccountid?accountId=${accountId}`, {
          credentials: 'include',
        });
        if (!userResponse.ok) throw new Error('Không thể lấy danh sách category của người dùng');
        userCategories = await userResponse.json();
      }

      const combinedCategories = [...systemCategories, ...userCategories];
      setCategories(combinedCategories);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách category:', err.message);
    }
  };

  // Fetch budgets from API
  const fetchBudgets = async () => {
    if (!accountId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/budget/findbyaccount?id=${accountId}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Không thể lấy danh sách ngân sách');
      const data = await response.json();
      setBudgets(data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách budget:', err.message);
    }
  };

  // Apply filters (type, month) and update filtered transactions
  const applyFilters = (data) => {
    let filtered = [...data];
    if (selectedType !== '') {
      filtered = filtered.filter((t) => (selectedType === 'true' ? t.type === 'pay' : t.type === 'earn'));
    }
    if (selectedMonth !== '') {
      filtered = filtered.filter((t) => new Date(t.date).getMonth() + 1 === parseInt(selectedMonth, 10));
    }
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  // Load initial data
  useEffect(() => {
    if (user && accountId) {
      setLoading(true);
      Promise.all([fetchTransactions(), fetchCategories(), fetchBudgets()]).finally(() => setLoading(false));
    }
  }, [user, accountId, selectedCategory, selectedBudget]);

  // Re-apply filters when type or month changes
  useEffect(() => {
    applyFilters(transactions);
  }, [selectedType, selectedMonth, transactions]);

  // Toggle dropdown for each transaction
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Handle filter changes
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

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Validate form data
  const validateForm = (data) => {
    const errors = {};
    if (data.type === null || data.type === undefined || data.type === '') errors.type = 'Type không được để trống';
    if (!data.total || data.total <= 0) errors.total = 'Total phải là số dương';
    if (!data.date) errors.date = 'Date không được để trống';
    if (data.method === null || data.method === undefined || data.method === '') errors.method = 'Method không được để trống';
    return errors;
  };

  // Handle input changes for create/edit forms
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'category' || name === 'budget' ? { id: value } : value;
    const updatedFormData = { ...createFormData, [name]: newValue };
    setCreateFormData(updatedFormData);
    setFormErrors(validateForm(updatedFormData));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'category' || name === 'budget' ? { id: value } : value;
    const updatedFormData = { ...editFormData, [name]: newValue };
    setEditFormData(updatedFormData);
    setFormErrors(validateForm(updatedFormData));
  };

  // Handle create form submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      setFormErrors({ general: 'Vui lòng đăng nhập để tạo giao dịch' });
      return;
    }

    const errors = validateForm(createFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        type: createFormData.type === 'true' || createFormData.type === true,
        total: parseInt(createFormData.total, 10),
        description: createFormData.description,
        date: createFormData.date,
        method: createFormData.method === 'true' || createFormData.method === true,
        category: createFormData.category.id ? { id: parseInt(createFormData.category.id, 10) } : null,
        account: { id: accountId },
        budget: createFormData.budget.id ? { id: parseInt(createFormData.budget.id, 10) } : null,
      };

      const response = await fetch('http://localhost:8080/api/deal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Có lỗi xảy ra khi tạo giao dịch');

      await fetchTransactions();
      setIsCreateModalOpen(false);
      setCreateFormData({
        type: false,
        total: '',
        description: '',
        date: '',
        method: true,
        category: { id: '' },
        budget: { id: '' },
      });
      setFormErrors({});
    } catch (err) {
      setFormErrors({ general: err.message });
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !editFormData.id) {
      setFormErrors({ general: 'Dữ liệu không hợp lệ để cập nhật giao dịch' });
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
        type: editFormData.type === 'true' || editFormData.type === true,
        total: parseInt(editFormData.total, 10),
        description: editFormData.description,
        date: editFormData.date,
        method: editFormData.method === 'true' || editFormData.method === true,
        category: editFormData.category.id ? { id: parseInt(editFormData.category.id, 10) } : null,
        account: { id: accountId },
        budget: editFormData.budget.id ? { id: parseInt(editFormData.budget.id, 10) } : null,
      };

      const response = await fetch(`http://localhost:8080/api/deal/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Có lỗi xảy ra khi cập nhật giao dịch');

      await fetchTransactions();
      setIsEditModalOpen(false);
      setEditFormData(null);
      setFormErrors({});
    } catch (err) {
      setFormErrors({ general: err.message });
    }
  };

  // Handle delete deal
  const handleDelete = async (dealId) => {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này không?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/deal/delete?id=${dealId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Không thể xóa giao dịch');
      await fetchTransactions();
      setOpenDropdown(null);
    } catch (err) {
      console.error('Lỗi khi xóa giao dịch:', err.message);
      alert('Có lỗi xảy ra khi xóa giao dịch');
    }
  };

  // Handle edit deal
  const handleEdit = (deal) => {
    setEditFormData({
      id: deal.id,
      type: deal.type === 'pay',
      total: deal.total.toString(),
      description: deal.description,
      date: deal.date,
      method: deal.method === 'Bank',
      category: { id: deal.category || '' },
      budget: { id: deal.budget || '' },
    });
    setIsEditModalOpen(true);
    setOpenDropdown(null);
  };

  // Handle add category to deal
  const handleAddCategory = async (dealId, categoryId) => {
    try {
      const deal = transactions.find((t) => t.id === dealId);
      if (!deal) throw new Error('Không tìm thấy giao dịch');

      const payload = {
        id: deal.id,
        type: deal.type === 'pay',
        total: deal.total,
        description: deal.description,
        date: deal.date,
        method: deal.method === 'Bank',
        category: { id: parseInt(categoryId, 10) },
        account: { id: accountId },
        budget: deal.budget ? { id: deal.budget } : null,
      };

      const response = await fetch(`http://localhost:8080/api/deal/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Không thể cập nhật giao dịch');

      await fetchTransactions();
      setIsAddCategoryModalOpen(false);
      setOpenDropdown(null);
    } catch (err) {
      console.error('Lỗi khi thêm phân loại:', err.message);
      alert('Có lỗi xảy ra khi thêm phân loại: ' + err.message);
    }
  };

  // Handle add budget to deal
  const handleAddBudget = async (dealId, budgetId) => {
    try {
      const deal = transactions.find((t) => t.id === dealId);
      if (!deal) throw new Error('Không tìm thấy giao dịch');

      const payload = {
        id: deal.id,
        type: deal.type === 'pay',
        total: deal.total,
        description: deal.description,
        date: deal.date,
        method: deal.method === 'Bank',
        category: deal.category ? { id: deal.category } : null,
        account: { id: accountId },
        budget: { id: parseInt(budgetId, 10) },
      };

      const response = await fetch(`http://localhost:8080/api/deal/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Không thể cập nhật giao dịch');

      await fetchTransactions();
      setIsAddBudgetModalOpen(false);
      setOpenDropdown(null);
    } catch (err) {
      console.error('Lỗi khi thêm vào ngân sách:', err.message);
      alert('Có lỗi xảy ra khi thêm vào ngân sách: ' + err.message);
    }
  };

  // Open modals for adding category or budget
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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 text-lg">Vui lòng đăng nhập để xem giao dịch.</p></div>;
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 text-lg">Đang tải...</p></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-red-600 text-lg">Lỗi: {error}</p></div>;

  const hasErrors = (data) => Object.keys(validateForm(data)).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {/* Bỏ h1 "Giao dịch của bạn" */}
          <div className="flex items-center gap-6">
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Phân loại:</label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryFilterChange}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 ease-in-out"
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
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Ngân sách:</label>
                <select
                  value={selectedBudget}
                  onChange={handleBudgetFilterChange}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200 ease-in-out"
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
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Loại:</label>
                <select
                  value={selectedType}
                  onChange={handleTypeFilterChange}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-all duration-200 ease-in-out"
                >
                  <option value="">Tất cả</option>
                  <option value="false">Thu nhập</option>
                  <option value="true">Chi tiêu</option>
                </select>
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Tháng:</label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthFilterChange}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 transition-all duration-200 ease-in-out"
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
                  setSelectedCategory('');
                  setSelectedBudget('');
                  setSelectedType('');
                  setSelectedMonth('');
                }}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
              >
                Hiện tất cả
              </button>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
            >
              <FaPlus size={16} />
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-5">
          {currentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center">Chưa có giao dịch nào.</p>
          ) : (
            currentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'earn' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className={`text-lg font-semibold ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'earn' ? '+' : '-'}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')} • {transaction.method} •{' '}
                      <span className="text-gray-600 font-medium">{transaction.account.name}</span>
                      {transaction.category && (
                        <span className="ml-2 text-blue-500">
                          #{categories.find((cat) => cat.id === transaction.category)?.name || transaction.category}
                        </span>
                      )}
                      {transaction.budget && (
                        <span className="ml-2 text-purple-500">
                          #{budgets.find((bud) => bud.id === transaction.budget)?.name || transaction.budget}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className={`text-lg font-semibold ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'earn' ? '+' : ''}{Math.abs(transaction.total).toLocaleString('vi-VN')} VNĐ
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(transaction.id)}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
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
                            onClick={() => handleDelete(transaction.id)}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 text-red-600"
                          >
                            Xóa
                          </li>
                          {!transaction.category && (
                            <li
                              onClick={() => openAddCategoryModal(transaction.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Thêm giao dịch mới</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại giao dịch</label>
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
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <input
                    type="text"
                    name="description"
                    value={createFormData.description}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày</label>
                  <input
                    type="date"
                    name="date"
                    value={createFormData.date}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phương thức</label>
                  <select
                    name="method"
                    value={createFormData.method}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={true}>Ngân hàng</option>
                    <option value={false}>Tiền mặt</option>
                  </select>
                  {formErrors.method && <p className="text-red-500 text-sm mt-1">{formErrors.method}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phân loại (tuỳ chọn)</label>
                  <select
                    name="category"
                    value={createFormData.category.id || ''}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                  <label className="block text-sm font-medium text-gray-700">Ngân sách (tuỳ chọn)</label>
                  <select
                    name="budget"
                    value={createFormData.budget.id || ''}
                    onChange={handleCreateInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Chọn ngân sách --</option>
                    {budgets.map((bud) => (
                      <option key={bud.id} value={bud.id}>
                        {bud.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.general && <p className="text-red-500 text-sm">{formErrors.general}</p>}
                <button
                  type="submit"
                  disabled={hasErrors(createFormData)}
                  className={`w-full py-2 rounded-md transition-all duration-300 ${
                    hasErrors(createFormData)
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Sửa giao dịch</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại giao dịch</label>
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
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <input
                    type="text"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày</label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phương thức</label>
                  <select
                    name="method"
                    value={editFormData.method}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={true}>Ngân hàng</option>
                    <option value={false}>Tiền mặt</option>
                  </select>
                  {formErrors.method && <p className="text-red-500 text-sm mt-1">{formErrors.method}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phân loại (tuỳ chọn)</label>
                  <select
                    name="category"
                    value={editFormData.category.id || ''}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                  <label className="block text-sm font-medium text-gray-700">Ngân sách (tuỳ chọn)</label>
                  <select
                    name="budget"
                    value={editFormData.budget.id || ''}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Chọn ngân sách --</option>
                    {budgets.map((bud) => (
                      <option key={bud.id} value={bud.id}>
                        {bud.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.general && <p className="text-red-500 text-sm">{formErrors.general}</p>}
                <button
                  type="submit"
                  disabled={hasErrors(editFormData)}
                  className={`w-full py-2 rounded-md transition-all duration-300 ${
                    hasErrors(editFormData)
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Chọn phân loại</h2>
                <button onClick={() => setIsAddCategoryModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-center">Không có phân loại nào.</p>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Chọn ngân sách</h2>
                <button onClick={() => setIsAddBudgetModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {budgets.length === 0 ? (
                  <p className="text-gray-500 text-center">Không có ngân sách nào.</p>
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
      </div>
    </div>
  );
};

export default TransactionPage;