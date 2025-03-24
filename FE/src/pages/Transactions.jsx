import React, { useState, useEffect } from 'react';
import { FaPlus, FaEllipsisH, FaTimes } from 'react-icons/fa';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]); // State cho budgets
  const [formData, setFormData] = useState({
    type: true,
    total: '',
    description: '',
    date: '',
    method: true,
    category: { id: '' },
    account: { id: '' },
    budget: { id: '' },
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/deal');
      if (!response.ok) throw new Error('Không thể lấy dữ liệu giao dịch');
      const data = await response.json();
      const formattedData = data.map((item) => ({
        id: item.id,
        type: item.type ? 'earn' : 'pay',
        total: item.total,
        description: item.description,
        date: item.date,
        method: item.method ? 'Bank' : 'Cash',
        account: item.account ? { name: `Tài khoản ${item.account.id}` } : { name: 'Chưa xác định' },
        category: item.category?.id || null,
        budget: item.budget?.id || null,
      }));
      setTransactions(formattedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/category');
      if (!response.ok) throw new Error('Không thể lấy danh sách phân loại');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách category:', err.message);
    }
  };

  // Fetch budgets from API (id cứng là 1)
  const fetchBudgets = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/budget/findbyaccount?id=1');
      if (!response.ok) throw new Error('Không thể lấy danh sách ngân sách');
      const data = await response.json();
      setBudgets(data); // Lưu danh sách ngân sách từ API
    } catch (err) {
      console.error('Lỗi khi lấy danh sách budget:', err.message);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchBudgets(); // Gọi hàm fetch budgets
  }, []);

  // Toggle dropdown for each transaction
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Handle input changes in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category' || name === 'account' || name === 'budget') {
      setFormData({ ...formData, [name]: { id: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setFormErrors({ ...formErrors, [name]: '' });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type === 'true' || formData.type === true,
        total: parseInt(formData.total, 10),
        description: formData.description,
        date: formData.date,
        method: formData.method === 'true' || formData.method === true,
        category: formData.category.id ? { id: parseInt(formData.category.id, 10) } : null,
        account: formData.account.id ? { id: parseInt(formData.account.id, 10) } : null,
        budget: formData.budget.id ? { id: parseInt(formData.budget.id, 10) } : null,
      };

      const response = await fetch('http://localhost:8080/api/deal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      await fetchTransactions();
      setIsModalOpen(false);
      setFormData({
        type: true,
        total: '',
        description: '',
        date: '',
        method: true,
        category: { id: '' },
        account: { id: '' },
        budget: { id: '' },
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
        setFormErrors({ general: 'Có lỗi xảy ra khi tạo giao dịch' });
      }
    }
  };

  // Loading and error states
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 text-lg">Đang tải...</p></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-red-600 text-lg">Lỗi: {error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giao dịch của bạn</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
          >
            <FaPlus size={16} /> <span className="font-medium">Thêm giao dịch</span>
          </button>
        </div>

        {/* Transaction List */}
        <div className="space-y-5">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center">Chưa có giao dịch nào.</p>
          ) : (
            transactions.map((transaction) => (
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
                          <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150">Sửa giao dịch</li>
                          <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 text-red-600">Xóa</li>
                          {!transaction.budget && (
                            <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150">Thêm vào Mục tiêu</li>
                          )}
                          {!transaction.category && (
                            <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150">Phân loại</li>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Thêm giao dịch mới</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại giao dịch</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={true}>Thu nhập</option>
                    <option value={false}>Chi tiêu</option>
                  </select>
                  {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
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
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                  {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    reservationquired
                  />
                  {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phương thức</label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
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
                    value={formData.category.id || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Chọn phân loại --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tài khoản (tuỳ chọn)</label>
                  <input
                    type="number"
                    name="account"
                    value={formData.account.id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Nhập ID tài khoản"
                  />
                  {formErrors.account && <p className="text-red-500 text-sm mt-1">{formErrors.account}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngân sách (tuỳ chọn)</label>
                  <select
                    name="budget"
                    value={formData.budget.id || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Chọn ngân sách --</option>
                    {budgets.map((bud) => (
                      <option key={bud.id} value={bud.id}>
                        {bud.name} {/* Hiển thị tên ngân sách */}
                      </option>
                    ))}
                  </select>
                  {formErrors.budget && <p className="text-red-500 text-sm mt-1">{formErrors.budget}</p>}
                </div>
                {formErrors.general && <p className="text-red-500 text-sm">{formErrors.general}</p>}
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-300"
                >
                  Tạo giao dịch
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;