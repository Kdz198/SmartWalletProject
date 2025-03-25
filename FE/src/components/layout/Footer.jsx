import React from "react";
import { Link } from "react-router-dom";
import {
  FaWallet,
  FaHandsHelping,
  FaBuilding,
  FaShieldAlt,
  FaFacebookF,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo & Description */}
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="text-2xl font-bold text-yellow-300">
              FinancePro
            </Link>
            <p className="text-gray-200 text-base">
              Quản lý tài chính cá nhân đơn giản và hiệu quả cho mọi người.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
              >
                <span className="sr-only">Facebook</span>
                <FaFacebookF className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
              >
                <span className="sr-only">Twitter</span>
                <FaTwitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
              >
                <span className="sr-only">GitHub</span>
                <FaGithub className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-yellow-300 tracking-wider uppercase flex items-center space-x-2">
                  <FaWallet />
                  <span>Tính năng</span>
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link
                      to="/transactions"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Giao dịch
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/budgets"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Ngân sách
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/categories"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Danh mục
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reports"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Báo cáo
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-yellow-300 tracking-wider uppercase flex items-center space-x-2">
                  <FaHandsHelping />
                  <span>Hỗ trợ</span>
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Trung tâm trợ giúp
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Liên hệ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Quyền riêng tư
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-yellow-300 tracking-wider uppercase flex items-center space-x-2">
                  <FaBuilding />
                  <span>Công ty</span>
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Giới thiệu
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Đối tác
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Tuyển dụng
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-yellow-300 tracking-wider uppercase flex items-center space-x-2">
                  <FaShieldAlt />
                  <span>Pháp lý</span>
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Chính sách bảo mật
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Điều khoản dịch vụ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-gray-200 hover:text-yellow-300 transition-all duration-300 ease-in-out"
                    >
                      Chính sách cookie
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/20 pt-8">
          <p className="text-base text-gray-200 xl:text-center">
            © {currentYear} FinancePro. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
