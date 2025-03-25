import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { formatCurrency } from "../utils/formatCurrency";
import {
  FaRocket,
  FaEye,
  FaMoneyBillWave,
  FaChartLine,
  FaPlus,
  FaTags,
  FaWallet,
  FaSignOutAlt,
} from "react-icons/fa";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="bg-gray-100">
      {!isLoggedIn ? (
        <LandingPage onLogin={toggleLogin} />
      ) : (
        <Dashboard onLogout={toggleLogin} />
      )}
    </div>
  );
};

// Landing page for non-authenticated users
const LandingPage = ({ onLogin }) => {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl flex items-center space-x-3">
                <FaRocket />
                <span>Quản lý tài chính dễ dàng</span>
              </h1>
              <p className="mt-6 text-xl max-w-3xl">
                FinancePro giúp bạn theo dõi chi tiêu, lập ngân sách và đạt được
                mục tiêu tài chính một cách đơn giản.
              </p>
              <div className="mt-10 flex space-x-4">
                <Link to="/signup">
                  <Button
                    size="large"
                    onClick={onLogin}
                    className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-all duration-300"
                  >
                    Bắt đầu ngay
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="large"
                    variant="outline"
                    className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300"
                  >
                    Tìm hiểu thêm
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 flex justify-center">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gray-100 px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Tổng quan tháng này
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex justify-between mb-6">
                    <div>
                      <h4 className="text-gray-500 text-sm">Thu nhập</h4>
                      <p className="text-green-600 text-2xl font-bold">
                        {formatCurrency(4500, "USD", "vi-VN")}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-gray-500 text-sm">Chi tiêu</h4>
                      <p className="text-red-600 text-2xl font-bold">
                        {formatCurrency(3250, "USD", "vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full"
                      style={{ width: "72%" }}
                    ></div>
                  </div>
                  <div className="mt-4 mb-6">
                    <h4 className="text-gray-500 text-sm">Còn lại</h4>
                    <p className="text-gray-800 text-2xl font-bold">
                      {formatCurrency(1250, "USD", "vi-VN")}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { category: "Nhà ở", amount: 1200, percentage: 37 },
                      { category: "Ăn uống", amount: 600, percentage: 18 },
                      { category: "Di chuyển", amount: 450, percentage: 14 },
                      { category: "Mua sắm", amount: 350, percentage: 11 },
                    ].map((item) => (
                      <div
                        key={item.category}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-gray-700">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900 font-medium">
                            {formatCurrency(item.amount, "USD", "vi-VN")}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {item.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Quản lý tiền bạc với sự tự tin
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Công cụ trực quan giúp bạn theo dõi chi tiêu, tiết kiệm nhiều hơn
              và đạt được mục tiêu tài chính.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  icon: <FaEye className="text-blue-500" />,
                  title: "Theo dõi chi tiêu",
                  description:
                    "Dễ dàng ghi lại và phân loại chi tiêu theo thời gian thực để kiểm soát thói quen tiêu dùng.",
                },
                {
                  icon: <FaMoneyBillWave className="text-blue-500" />,
                  title: "Lập ngân sách",
                  description:
                    "Thiết lập ngân sách cá nhân cho từng danh mục và nhận cảnh báo khi gần vượt giới hạn.",
                },
                {
                  icon: <FaChartLine className="text-blue-500" />,
                  title: "Mục tiêu tài chính",
                  description:
                    "Xác định mục tiêu tiết kiệm và theo dõi tiến độ với thông tin rõ ràng, dễ hiểu.",
                },
              ].map((feature) => (
                <Card
                  key={feature.title}
                  className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Sẵn sàng bắt đầu chưa?
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn người dùng tin tưởng FinancePro để quản lý
            tài chính của họ.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button
                size="large"
                className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
              >
                Đăng ký ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Dashboard for authenticated users
const Dashboard = ({ onLogout }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng bạn quay lại!
        </h1>
        <Button
          variant="outline"
          onClick={onLogout}
          className="flex items-center space-x-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300"
        >
          <FaSignOutAlt />
          <span>Đăng xuất</span>
        </Button>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-medium text-gray-900">Số dư tổng cộng</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {formatCurrency(1250, "USD", "vi-VN")}
          </p>
        </Card>
        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-medium text-gray-900">
            Thu nhập tháng này
          </h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(4500, "USD", "vi-VN")}
          </p>
        </Card>
        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-medium text-gray-900">
            Chi tiêu tháng này
          </h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(3250, "USD", "vi-VN")}
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Hành động nhanh
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Link to="/transactions">
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2">
              <FaPlus />
              <span>Thêm giao dịch</span>
            </Button>
          </Link>
          <Link to="/budgets">
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2">
              <FaMoneyBillWave />
              <span>Tạo ngân sách</span>
            </Button>
          </Link>
          <Link to="/categories">
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2">
              <FaTags />
              <span>Quản lý danh mục</span>
            </Button>
          </Link>
          <Link to="/accounts">
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2">
              <FaWallet />
              <span>Xem tài khoản</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
