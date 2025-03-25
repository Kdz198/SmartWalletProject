import React, { useState, useEffect } from "react";
import { FaPlus, FaEllipsisH, FaTimes, FaTags } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

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
    name: "",
    img: "default.img",
  });
  const [editFormData, setEditFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const accountId = user?.id;

  // Fetch categories and deals
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all categories
      console.log("API Request: GET /api/category");
      const allCategoriesResponse = await fetch(
        "http://localhost:8080/api/category",
        {
          credentials: "include",
        }
      );
      if (!allCategoriesResponse.ok) {
        const errorData = await allCategoriesResponse.json();
        console.error("API Response Error:", errorData);
        throw new Error(
          errorData.message || "Không thể lấy danh sách danh mục"
        );
      }
      const allCategories = await allCategoriesResponse.json();
      console.log("API Response Success: Categories fetched", allCategories);

      // Đảo ngược thứ tự danh sách để dữ liệu mới nhất (cuối mảng) lên đầu
      const reversedCategories = allCategories.slice().reverse();

      const systemCats = reversedCategories.filter((cat) => !cat.account);
      const userCats = reversedCategories.filter(
        (cat) => cat.account && cat.account.id === accountId
      );

      setSystemCategories(systemCats);
      setUserCategories(userCats);

      // Fetch deals if logged in
      if (accountId) {
        console.log(`API Request: GET /api/deal/findbyaccount?id=${accountId}`);
        const dealResponse = await fetch(
          `http://localhost:8080/api/deal/findbyaccount?id=${accountId}`,
          {
            credentials: "include",
          }
        );
        if (!dealResponse.ok) {
          const errorData = await dealResponse.json();
          console.error("API Response Error:", errorData);
          throw new Error(
            errorData.message || "Không thể lấy danh sách giao dịch"
          );
        }
        const dealData = await dealResponse.json();
        console.log("API Response Success: Deals fetched", dealData);
        setDeals(dealData); // Deals có cần đảo ngược không tùy thuộc vào yêu cầu
      } else {
        setDeals([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  // Load initial data when user or accountId changes
  useEffect(() => {
    fetchData();
  }, [user, accountId]);

  // Các hàm khác giữ nguyên, không thay đổi
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({ ...createFormData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      setFormErrors({ general: "Vui lòng đăng nhập để tạo danh mục" });
      console.error("Lỗi: Người dùng chưa đăng nhập");
      return;
    }
    try {
      const payload = {
        name: createFormData.name,
        img: createFormData.img,
        account: { id: accountId },
      };
      console.log("API Request: POST /api/category/create", payload);

      const response = await fetch(
        "http://localhost:8080/api/category/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(errorData.message || "Không thể tạo danh mục");
      }

      const responseData = await response.json();
      console.log("API Response Success: Category created", responseData);
      await fetchData();
      setIsCreateModalOpen(false);
      setCreateFormData({
        name: "",
        img: "default.img",
      });
      setFormErrors({});
    } catch (err) {
      console.error("Lỗi khi tạo danh mục:", err.message);
      if (err.message.includes("errors")) {
        const errorMap = {};
        err.errors?.forEach((error) => {
          errorMap[error.field] = error.defaultMessage;
        });
        setFormErrors(errorMap);
      } else {
        setFormErrors({
          general: err.message || "Có lỗi xảy ra khi tạo danh mục",
        });
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !editFormData?.id) {
      setFormErrors({ general: "Dữ liệu không hợp lệ để cập nhật danh mục" });
      console.error("Lỗi: Dữ liệu không hợp lệ");
      return;
    }
    try {
      const payload = {
        id: editFormData.id,
        name: editFormData.name,
        img: editFormData.img,
        account: { id: accountId },
      };
      console.log("API Request: POST /api/category/update", payload);

      const response = await fetch(
        "http://localhost:8080/api/category/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(errorData.message || "Không thể cập nhật danh mục");
      }

      const responseData = await response.json();
      console.log("API Response Success: Category updated", responseData);
      await fetchData();
      setIsEditModalOpen(false);
      setEditFormData(null);
      setFormErrors({});
      setOpenDropdown(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật danh mục:", err.message);
      if (err.message.includes("errors")) {
        const errorMap = {};
        err.errors?.forEach((error) => {
          errorMap[error.field] = error.defaultMessage;
        });
        setFormErrors(errorMap);
      } else {
        setFormErrors({
          general: err.message || "Có lỗi xảy ra khi cập nhật danh mục",
        });
      }
    }
  };

  const handleDelete = (categoryId) => {
    const category = userCategories.find((cat) => cat.id === categoryId);
    if (!category || !category.account) {
      console.warn("Không thể xóa danh mục hệ thống");
      alert("Không thể xóa danh mục hệ thống!");
      return;
    }

    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      console.log(
        `API Request: DELETE /api/category/delete?id=${categoryToDelete}`
      );
      const response = await fetch(
        `http://localhost:8080/api/category/delete?id=${categoryToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response Error:", errorData);
        throw new Error(errorData.message || "Không thể xóa danh mục");
      }

      console.log("API Response Success: Category deleted", categoryToDelete);
      await fetchData();
      setOpenDropdown(null);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Lỗi khi xóa danh mục:", err.message);
      alert("Có lỗi xảy ra khi xóa danh mục: " + err.message);
    }
  };

  const handleEdit = (category) => {
    setEditFormData({
      id: category.id,
      name: category.name,
      img: category.img,
    });
    setIsEditModalOpen(true);
    setOpenDropdown(null);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsDealsModalOpen(true);
  };

  const filteredDeals = selectedCategory
    ? deals.filter((deal) => deal.category?.id === selectedCategory.id)
    : [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 flex items-center justify-center">
        <p className="text-gray-700 text-xl font-semibold">
          Vui lòng đăng nhập để xem danh mục.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center space-x-2">
            <span>Danh mục tài chính</span>
            <FaTags className="text-indigo-600" />
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-3 rounded-full hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            <FaPlus size={18} />
            <span className="font-semibold">Tạo danh mục mới</span>
          </button>
        </div>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 backdrop-blur-xl bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Xác nhận xóa
                </h2>
                <p className="mt-2 text-gray-600">
                  Bạn có chắc muốn xóa danh mục này không? Hành động này không
                  thể hoàn tác.
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {showToast && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
              <span>Đã xóa danh mục thành công!</span>
            </div>
          </div>
        )}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <FaTags className="text-indigo-500" />
            <span>Danh mục hệ thống</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-400 transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-100">
                    <span className="text-xl font-bold text-indigo-600">
                      {category.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900">
                      {category.name}
                    </p>
                    <p className="text-sm text-gray-500">Hệ thống</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <FaTags className="text-purple-500" />
            <span>Danh mục của bạn</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCategories.length === 0 ? (
              <p className="text-gray-600 text-center col-span-full font-medium">
                Chưa có danh mục nào.
              </p>
            ) : (
              userCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-400 relative transform hover:scale-105"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className="flex items-center gap-4"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
                        <span className="text-xl font-bold text-purple-600">
                          {category.name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900">
                          {category.name}
                        </p>
                        <p className="text-sm text-gray-500">Người dùng</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-all duration-200"
                        title="Sửa danh mục"
                      >
                        <svg
                          className="w-[25px] h-[25px]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-all duration-200"
                        title="Xóa danh mục"
                      >
                        <svg
                          className="w-[25px] h-[25px]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M9 7h6m-5 4v6m4-6v6"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {isCreateModalOpen && (
          <div className="fixed inset-0 backdrop-blur bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Thêm danh mục mới
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateInputChange}
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
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
                    Hình ảnh (URL)
                  </label>
                  <input
                    type="text"
                    name="img"
                    value={createFormData.img}
                    onChange={handleCreateInputChange}
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.img && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.img}
                    </p>
                  )}
                </div>
                {formErrors.general && (
                  <p className="text-red-500 text-sm">{formErrors.general}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 font-semibold shadow-md"
                >
                  Tạo danh mục
                </button>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && editFormData && (
          <div className="fixed inset-0  backdrop-blur-xl bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Sửa danh mục
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
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
                    Hình ảnh (URL)
                  </label>
                  <input
                    type="text"
                    name="img"
                    value={editFormData.img}
                    onChange={handleEditInputChange}
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.img && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.img}
                    </p>
                  )}
                </div>
                {formErrors.general && (
                  <p className="text-red-500 text-sm">{formErrors.general}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 font-semibold shadow-md"
                >
                  Cập nhật danh mục
                </button>
              </form>
            </div>
          </div>
        )}

        {isDealsModalOpen && selectedCategory && (
          <div className="fixed inset-0 backdrop-blur bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Giao dịch trong "{selectedCategory.name}"
                </h2>
                <button
                  onClick={() => setIsDealsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              {filteredDeals.length === 0 ? (
                <p className="text-gray-600 text-center font-medium">
                  Chưa có giao dịch nào trong danh mục này.
                </p>
              ) : (
                <ul className="space-y-4">
                  {filteredDeals.map((deal) => (
                    <li
                      key={deal.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200"
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
