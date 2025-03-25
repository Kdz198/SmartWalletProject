import React from "react";
import { Link } from "react-router-dom";
import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaLock,
  FaVenusMars,
  FaCalendarAlt,
} from "react-icons/fa";

const SignUp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center space-x-2">
          <FaUserPlus className="text-blue-600" />
          <span>Đăng Ký</span>
        </h2>

        <form className="space-y-6">
          {/* Họ và Tên */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 flex items-center space-x-2"
            >
              <FaUser className="text-blue-500" />
              <span>Họ và Tên</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-gray-50"
              placeholder="Nhập họ và tên"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 flex items-center space-x-2"
            >
              <FaEnvelope className="text-blue-500" />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-gray-50"
              placeholder="Nhập email"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label
              htmlFor="pass"
              className="block text-sm font-medium text-gray-700 flex items-center space-x-2"
            >
              <FaLock className="text-blue-500" />
              <span>Mật khẩu</span>
            </label>
            <input
              type="password"
              id="pass"
              name="pass"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-gray-50"
              placeholder="Nhập mật khẩu"
            />
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2 mb-2">
              <FaVenusMars className="text-blue-500" />
              <span>Giới tính</span>
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="true"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all duration-200"
                />
                <span className="text-sm text-gray-700">Nam</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="false"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all duration-200"
                />
                <span className="text-sm text-gray-700">Nữ</span>
              </label>
            </div>
          </div>

          {/* Ngày sinh */}
          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700 flex items-center space-x-2"
            >
              <FaCalendarAlt className="text-blue-500" />
              <span>Ngày sinh</span>
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-gray-50"
            />
          </div>

          {/* Button Đăng ký */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out shadow-md"
          >
            Đăng Ký
          </button>
        </form>

        {/* Link đến đăng nhập */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 ease-in-out font-medium"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
