import React, { useState, useEffect } from 'react';
import { FaPlus, FaEllipsisH, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CategoryPage = () => {
  const { user } = useAuth();
  const [systemCategories, setSystemCategories] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDealsModalOpen, setIsDealsModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    img: 'default.img',
  });
  const [editFormData, setEditFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);

  const accountId = user?.id;

  // Fetch categories and deals
  const fetchData = async () => {
    setLoading(true);
    try {
      const allCategoriesResponse = await fetch('http://localhost:8080/api/category', {
        credentials: 'include',
      });
      if (!allCategoriesResponse.ok) throw new Error('Không thể lấy danh sách category');
      const allCategories = await allCategoriesResponse.json();

      const systemCats = allCategories.filter((cat) => !cat.account); // account == null
      const userCats = allCategories.filter(
        (cat) => cat.account && cat.account.id === accountId
      ); // account != null và khớp accountId

      setSystemCategories(systemCats);
      setUserCategories(userCats);

      if (accountId) {
        const dealResponse = await fetch(`http://localhost:8080/api/deal/findbyaccount?id=${accountId}`, {
          credentials: 'include',
        });
        if (!dealResponse.ok) throw new Error('Không thể lấy danh sách giao dịch');
        const dealData = await dealResponse.json();
        setDeals(dealData);
      } else {
        setDeals([]);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Load initial data when user or accountId changes
  useEffect(() => {
    fetchData();
  }, [user, accountId]);

  // Toggle dropdown for each category
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Handle input changes for create form
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({ ...createFormData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  // Handle input changes for edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  // Handle create form submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      setFormErrors({ general: 'Vui lòng đăng nhập để tạo category' });
      return;
    }
    try {
      const payload = {
        name: createFormData.name,
        img: createFormData.img,
        account: { id: accountId },
      };

      const response = await fetch('http://localhost:8080/api/category/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo category');
      }

      await fetchData();
      setIsCreateModalOpen(false);
      setCreateFormData({
        name: '',
        img: 'default.img',
      });
      setFormErrors({});
    } catch (err) {
      console.error('Lỗi khi tạo category:', err);
      if (err.message.includes('errors')) {
        const errorMap = {};
        err.errors?.forEach((error) => {
          errorMap[error.field] = error.defaultMessage;
        });
        setFormErrors(errorMap);
      } else {
        setFormErrors({ general: err.message || 'Có lỗi xảy ra khi tạo category' });
      }
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !editFormData?.id) {
      setFormErrors({ general: 'Dữ liệu không hợp lệ để cập nhật category' });
      return;
    }
    try {
      const payload = {
        id: editFormData.id,
        name: editFormData.name,
        img: editFormData.img,
        account: { id: accountId },
      };

      const response = await fetch('http://localhost:8080/api/category/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật category');
      }

      await fetchData();
      setIsEditModalOpen(false);
      setEditFormData(null);
      setFormErrors({});
      setOpenDropdown(null);
    } catch (err) {
      console.error('Lỗi khi cập nhật category:', err);
      if (err.message.includes('errors')) {
        const errorMap = {};
        err.errors?.forEach((error) => {
          errorMap[error.field] = error.defaultMessage;
        });
        setFormErrors(errorMap);
      } else {
        setFormErrors({ general: err.message || 'Có lỗi xảy ra khi cập nhật category' });
      }
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId) => {
    const category = userCategories.find((cat) => cat.id === categoryId);
    if (!category || !category.account) {
      alert('Không thể xóa danh mục hệ thống!');
      return;
    }

    if (!confirm('Bạn có chắc muốn xóa danh mục này không?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/category/delete?id=${categoryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa category');
      }

      await fetchData();
      setOpenDropdown(null);
    } catch (err) {
      console.error('Lỗi khi xóa category:', err);
      alert('Có lỗi xảy ra khi xóa category: ' + err.message);
    }
  };

  // Handle edit category (open edit modal)
  const handleEdit = (category) => {
    setEditFormData({
      id: category.id,
      name: category.name,
      img: category.img,
    });
    setIsEditModalOpen(true);
    setOpenDropdown(null);
  };

  // Handle category click to show deals in modal
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsDealsModalOpen(true);
  };

  // Filter deals by selected category
  const filteredDeals = selectedCategory
    ? deals.filter((deal) => deal.category?.id === selectedCategory.id)
    : [];

  // Check if user is not logged in
  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 text-lg">Vui lòng đăng nhập để xem danh mục.</p></div>;
  }

  // Loading and error states
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 text-lg">Đang tải...</p></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-red-600 text-lg">Lỗi: {error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Danh mục tài chính</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg"
          >
            <FaPlus size={18} /> <span className="font-semibold">Tạo danh mục mới</span>
          </button>
        </div>

        {/* System Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Danh mục hệ thống</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-100">
                    <span className="text-xl font-bold text-indigo-600">{category.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-800">{category.name}</p>
                    <p className="text-sm text-gray-500">Hệ thống</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Categories */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Danh mục của bạn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCategories.length === 0 ? (
              <p className="text-gray-500 text-center col-span-full">Chưa có danh mục nào.</p>
            ) : (
              userCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 relative"
                >
                  <div className="flex items-center gap-4" onClick={() => handleCategoryClick(category)}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
                      <span className="text-xl font-bold text-purple-600">{category.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-gray-800">{category.name}</p>
                      <p className="text-sm text-gray-500">Người dùng</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => toggleDropdown(category.id)}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                    >
                      <FaEllipsisH size={16} />
                    </button>
                    {openDropdown === category.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                        <ul className="py-1 text-sm text-gray-700">
                          <li
                            onClick={() => handleEdit(category)}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          >
                            Sửa danh mục
                          </li>
                          <li
                            onClick={() => handleDelete(category.id)}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 text-red-600"
                          >
                            Xóa danh mục
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Thêm danh mục mới</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                  <input
                    type="text"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateInputChange}
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hình ảnh (URL)</label>
                  <input
                    type="text"
                    name="img"
                    value={createFormData.img}
                    onChange={handleCreateInputChange}
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                  {formErrors.img && <p className="text-red-500 text-sm mt-1">{formErrors.img}</p>}
                </div>
                {formErrors.general && <p className="text-red-500 text-sm">{formErrors.general}</p>}
                <button
                  type="submit"
                  className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition-all duration-300 font-semibold"
                >
                  Tạo danh mục
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Sửa danh mục</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={24} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hình ảnh (URL)</label>
                  <input
                    type="text"
                    name="img"
                    value={editFormData.img}
                    onChange={handleEditInputChange}
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                  {formErrors.img && <p className="text-red-500 text-sm mt-1">{formErrors.img}</p>}
                </div>
                {formErrors.general && <p className="text-red-500 text-sm">{formErrors.general}</p>}
                <button
                  type="submit"
                  className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition-all duration-300 font-semibold"
                >
                  Cập nhật danh mục
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Deals Modal */}
        {isDealsModalOpen && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Giao dịch trong "{selectedCategory.name}"
                </h2>
                <button onClick={() => setIsDealsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={24} />
                </button>
              </div>
              {filteredDeals.length === 0 ? (
                <p className="text-gray-500 text-center">Chưa có giao dịch nào trong danh mục này.</p>
              ) : (
                <ul className="space-y-4">
                  {filteredDeals.map((deal) => (
                    <li
                      key={deal.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
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
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;