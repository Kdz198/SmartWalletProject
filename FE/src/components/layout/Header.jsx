import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext"; // Import useAuth từ AuthContext

// Avatar mặc định dựa trên giới tính
const maleAvatar = "https://avatar.iran.liara.run/public/boy"; // Avatar nam
const femaleAvatar = "https://avatar.iran.liara.run/public/girl"; // Avatar nữ

const Header = () => {
  const { user, logout } = useAuth(); // Lấy user và logout từ AuthContext
  const [isLoggedIn, setIsLoggedIn] = useState(!!user); // Kiểm tra trạng thái đăng nhập dựa trên user
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountData, setAccountData] = useState(null); // Lưu dữ liệu từ API /findbyid
  const navigate = useNavigate();

  const notificationCount = 3; // Giả định số thông báo, bạn có thể thay bằng API nếu cần

  // Lấy dữ liệu từ API /findbyid khi user thay đổi
  useEffect(() => {
    const fetchAccountData = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/account/findbyid?id=${user.id}`,
            {
              method: "GET",
              credentials: "include", // Đảm bảo gửi cookie/session nếu cần
            }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch account data");
          }
          const data = await response.json();
          setAccountData(data); // Lưu dữ liệu tài khoản
        } catch (error) {
          console.error("Error fetching account data:", error);
        }
      }
    };

    fetchAccountData();
    setIsLoggedIn(!!user); // Cập nhật trạng thái đăng nhập
  }, [user]);

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ AuthContext
    setIsLoggedIn(false);
    setAccountData(null); // Xóa dữ liệu tài khoản khi đăng xuất
    navigate("/login"); // Chuyển hướng về trang login
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Xác định avatar dựa trên giới tính
  const avatarUrl =
    accountData && accountData.gender ? maleAvatar : femaleAvatar;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-semibold text-blue-600">
              FinancePro
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-300 ease-in-out font-medium"
            >
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/transactions"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-300 ease-in-out font-medium"
                >
                  Transactions
                </Link>
                <Link
                  to="/budgets"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-300 ease-in-out font-medium"
                >
                  Budgets
                </Link>
                <Link
                  to="/categories"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-300 ease-in-out font-medium"
                >
                  Categories
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn && accountData ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white shadow-sm">
                      {notificationCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => navigate("/account")}
                  className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={avatarUrl}
                    alt="User avatar"
                  />
                  <span>{accountData.name}</span>
                </button>
                <Button
                  variant="outline"
                  size="small"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 ease-in-out rounded-md"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-500 hover:text-gray-700">
                  <Button>Login</Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="outline"
                    fullWidth
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 transition-all duration-300 ease-in-out rounded-md"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-in-out"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-3 pb-4 space-y-2">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
            >
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/transactions"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
                >
                  Transactions
                </Link>
                <Link
                  to="/budgets"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
                >
                  Budgets
                </Link>
                <Link
                  to="/categories"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
                >
                  Categories
                </Link>
              </>
            )}
          </div>
          <div className="border-t border-gray-200 px-4 py-3">
            {isLoggedIn && accountData ? (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={avatarUrl}
                    alt="User avatar"
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      {accountData.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {accountData.email}
                    </div>
                  </div>
                  <Link
                    to="/notifications"
                    className="ml-auto p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out relative"
                  >
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white shadow-sm">
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                </div>
                <Link
                  to="/account"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
                >
                  Your Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <Link to="/login">
                  <Button
                    fullWidth
                    className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out rounded-md"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="outline"
                    fullWidth
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 transition-all duration-300 ease-in-out rounded-md"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
