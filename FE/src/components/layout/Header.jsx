import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaHome,
  FaChartBar,
  FaExchangeAlt,
  FaPiggyBank,
  FaTags,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

const maleAvatar = "https://avatar.iran.liara.run/public/boy";
const femaleAvatar = "https://avatar.iran.liara.run/public/girl";

const Header = () => {
  const { user, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/account/findbyid?id=${user.id}`,
            { method: "GET", credentials: "include" }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Không thể tải dữ liệu tài khoản: ${response.status} - ${
                errorData.message || "Lỗi không xác định"
              }`
            );
          }
          const data = await response.json();
          setAccountData(data);
          console.log("Tải dữ liệu tài khoản thành công:", data);
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu tài khoản:", error.message);
          toast.error("Không thể tải dữ liệu tài khoản. Vui lòng thử lại sau.");
        }
      }
    };

    const fetchNotifications = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/notification?id=${user.id}`,
            { method: "GET", credentials: "include" }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Không thể tải thông báo: ${response.status} - ${
                errorData.message || "Lỗi không xác định"
              }`
            );
          }
          const data = await response.json();
          setNotifications(data);
          setUnreadCount(data.filter((noti) => !noti.read).length); // Sử dụng read
          console.log("Tải thông báo thành công:", data);
        } catch (error) {
          console.error("Lỗi khi tải thông báo:", error.message);
          toast.error("Không thể tải thông báo. Vui lòng thử lại sau.");
        }
      }
    };

    fetchAccountData();
    fetchNotifications();
    setIsLoggedIn(!!user);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setAccountData(null);
    setNotifications([]);
    setUnreadCount(0);
    navigate("/login");
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/notification/read?notificationId=${notificationId}`,
        { method: "GET", credentials: "include" }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Không thể đánh dấu thông báo là đã đọc: ${response.status} - ${
            errorData.message || "Lỗi không xác định"
          }`
        );
      }
      setNotifications((prev) =>
        prev.map(
          (noti) =>
            noti.id === notificationId ? { ...noti, read: true } : noti // Sử dụng read
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      console.log(`Đã đánh dấu thông báo ${notificationId} là đã đọc`);
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo:", error.message);
      toast.error("Không thể đánh dấu thông báo. Vui lòng thử lại sau.");
    }
  };

  const avatarUrl =
    accountData && accountData.gender ? maleAvatar : femaleAvatar;

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link
              to={isLoggedIn ? "/dashboard" : "/"}
              className="text-3xl font-bold text-white"
            >
              Hoàng Tử Gió
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to={isLoggedIn ? "/dashboard" : "/"}
              className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 ease-in-out font-medium"
            >
              {isLoggedIn ? <FaChartBar /> : <FaHome />}
              <span>{isLoggedIn ? "Tổng quan" : "Trang chủ"}</span>
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/transactions"
                  className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 ease-in-out font-medium"
                >
                  <FaExchangeAlt />
                  <span>Giao dịch</span>
                </Link>
                <Link
                  to="/budgets"
                  className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 ease-in-out font-medium"
                >
                  <FaPiggyBank />
                  <span>Ngân sách</span>
                </Link>
                <Link
                  to="/categories"
                  className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 ease-in-out font-medium"
                >
                  <FaTags />
                  <span>Danh mục</span>
                </Link>
              </>
            )}
          </nav>
          <div className="hidden md:flex items-center space-x-4 relative">
            {isLoggedIn && accountData ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="relative p-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-full transition-all duration-300 ease-in-out"
                  >
                    <FaBell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Thông báo
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.slice(0, 5).map((noti) => (
                          <div
                            key={noti.id}
                            onClick={() => !noti.read && markAsRead(noti.id)} // Chỉ gọi markAsRead khi read === false
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                              !noti.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-800">
                              {noti.tittle || "Thông báo mới"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {noti.message || "Không có nội dung"}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="p-4">
                        <Link
                          to="/notifications"
                          className="block text-center text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Xem thêm
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate("/account")}
                  className="flex items-center space-x-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={avatarUrl}
                    alt="Avatar người dùng"
                  />
                  <span>{accountData.name}</span>
                </button>
                <Button
                  variant="outline"
                  size="small"
                  className="border-white hover:bg-white/20 hover:text-yellow-300 transition-all duration-300 ease-in-out rounded-md flex items-center space-x-2"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  <span>Đăng xuất</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button className="flex items-center space-x-2 text-white hover:text-yellow-300">
                    <FaSignInAlt />
                    <span>Đăng nhập</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="outline"
                    fullWidth
                    className="border-white hover:bg-white/20 hover:text-yellow-300 transition-all duration-300 ease-in-out rounded-md flex items-center space-x-2"
                  >
                    <FaUserPlus />
                    <span>Đăng ký</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-lg transition-all duration-300 ease-in-out"
            >
              <span className="sr-only">Mở menu</span>
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
      <div
        className={`md:hidden bg-white text-gray-800 shadow-lg transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 pt-3 pb-4 space-y-2">
          <Link
            to={isLoggedIn ? "/dashboard" : "/"}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
          >
            {isLoggedIn ? <FaChartBar /> : <FaHome />}
            <span>{isLoggedIn ? "Tổng quan" : "Trang chủ"}</span>
          </Link>
          {isLoggedIn && (
            <>
              <Link
                to="/transactions"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
              >
                <FaExchangeAlt />
                <span>Giao dịch</span>
              </Link>
              <Link
                to="/budgets"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
              >
                <FaPiggyBank />
                <span>Ngân sách</span>
              </Link>
              <Link
                to="/categories"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
              >
                <FaTags />
                <span>Danh mục</span>
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
                  alt="Avatar người dùng"
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
                  <FaBell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </div>
              <Link
                to="/account"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
              >
                <FaUser className="inline mr-2" />
                Hồ sơ của bạn
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out"
              >
                <FaSignOutAlt className="inline mr-2" />
                Đăng xuất
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <Link to="/login">
                <Button
                  fullWidth
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out rounded-md flex items-center justify-center space-x-2"
                >
                  <FaSignInAlt />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  variant="outline"
                  fullWidth
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 transition-all duration-10 ease-in-out rounded-md flex items-center justify-center space-x-2"
                >
                  <FaUserPlus />
                  <span>Đăng ký</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
