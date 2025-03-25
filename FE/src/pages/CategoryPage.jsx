import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaTags, FaEllipsisH } from "react-icons/fa";
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
  const [openMenuId, setOpenMenuId] = useState(null); // Thêm state để quản lý menu nào đang mở
  const [createFormData, setCreateFormData] = useState({
    name: "",
    img: "default.img",
  });
  const [editFormData, setEditFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const accountId = user?.id;

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };
  const toggleMenu = (categoryId) => {
    setOpenMenuId(openMenuId === categoryId ? null : categoryId); // Đóng/mở menu
  };

  const getToastColor = (type) => {
    switch (type) {
      case "create":
        return "green-500"; // Xanh lục cho tạo mới
      case "update":
        return "blue-500"; // Xanh dương cho cập nhật
      case "delete":
        return "red-500"; // Xanh lục cho xóa
      case "error":
        return "red-500"; // Đỏ cho lỗi
      default:
        return "gray-500";
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const allCategoriesResponse = await fetch(
        "http://localhost:8080/api/category",
        {
          credentials: "include",
        }
      );
      if (!allCategoriesResponse.ok)
        throw new Error("Không thể lấy danh sách danh mục");
      const allCategories = await allCategoriesResponse.json();
      const reversedCategories = allCategories.slice().reverse();
      setSystemCategories(reversedCategories.filter((cat) => !cat.account));
      setUserCategories(
        reversedCategories.filter(
          (cat) => cat.account && cat.account.id === accountId
        )
      );

      if (accountId) {
        const dealResponse = await fetch(
          `http://localhost:8080/api/deal/findbyaccount?id=${accountId}`,
          {
            credentials: "include",
          }
        );
        if (!dealResponse.ok)
          throw new Error("Không thể lấy danh sách giao dịch");
        setDeals(await dealResponse.json());
      } else {
        setDeals([]);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      showToast(err.message, "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, accountId]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      showToast("Vui lòng đăng nhập để tạo danh mục", "error");
      return;
    }
    try {
      const payload = {
        name: createFormData.name,
        img: createFormData.img,
        account: { id: accountId },
      };
      const response = await fetch(
        "http://localhost:8080/api/category/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Không thể tạo danh mục"
        );
      await fetchData();
      setIsCreateModalOpen(false);
      setCreateFormData({ name: "", img: "default.img" });
      setFormErrors({});
      showToast("Tạo danh mục thành công!", "create");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !editFormData?.id) {
      showToast("Dữ liệu không hợp lệ để cập nhật danh mục", "error");
      return;
    }
    try {
      const payload = {
        id: editFormData.id,
        name: editFormData.name,
        img: editFormData.img,
        account: { id: accountId },
      };
      const response = await fetch(
        "http://localhost:8080/api/category/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Không thể cập nhật danh mục"
        );
      await fetchData();
      setIsEditModalOpen(false);
      setEditFormData(null);
      setFormErrors({});
      showToast("Cập nhật danh mục thành công!", "update");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = (categoryId) => {
    const category = userCategories.find((cat) => cat.id === categoryId);
    if (!category || !category.account) {
      showToast("Không thể xóa danh mục hệ thống!", "error");
      return;
    }
    const hasDeals = deals.some((deal) => deal.category?.id === categoryId);
    if (hasDeals) {
      showToast(
        "Không thể xóa danh mục đang có giao dịch. Vui lòng xóa tất cả giao dịch liên quan trước!",
        "error"
      );
      return;
    }
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/category/delete?id=${categoryToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Không thể xóa danh mục"
        );
      await fetchData();
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      showToast("Xóa danh mục thành công!", "delete");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleEdit = (category) => {
    setEditFormData({
      id: category.id,
      name: category.name,
      img: category.img,
    });
    setIsEditModalOpen(true);
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
        {toast.show && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`bg-${getToastColor(
                toast.type
              )} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in`}
            >
              <span>Vui lòng đăng nhập để xem danh mục</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 flex items-center justify-center">
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 flex items-center justify-center"></div>
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

        {isDeleteModalOpen && (
          <div className="fixed inset-0 backdrop-blur bg-black bg-opacity-60 flex items-center justify-center z-50">
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
                    {/* Nút ba chấm và menu dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(category.id)}
                        className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                        title="Tùy chọn"
                      >
                        <FaEllipsisH size={20} />
                      </button>
                      {openMenuId === category.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <button
                            onClick={() => handleEdit(category)}
                            className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition-all duration-200"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-800 transition-all duration-200"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
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
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        name: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        img: e.target.value,
                      })
                    }
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.img && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.img}
                    </p>
                  )}
                </div>
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
          <div className="fixed inset-0 backdrop-blur-xl bg-opacity-60 flex items-center justify-center z-50">
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
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
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
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, img: e.target.value })
                    }
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
                    required
                  />
                  {formErrors.img && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.img}
                    </p>
                  )}
                </div>
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
