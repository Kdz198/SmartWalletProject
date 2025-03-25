import React, { useState } from "react";
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pass: "",
    gender: null,
    dob: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "gender") {
      setFormData({ ...formData, gender: value === "true" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" }); // Clear error when user types
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = {
      name: formData.name,
      pass: formData.pass,
      email: formData.email,
      gender: formData.gender,
      dob: formData.dob,
    };

    try {
      const response = await fetch("http://localhost:8080/api/account/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          // Xử lý validation errors từ backend (nếu có)
          const errorMap = {};
          errorData.errors.forEach((error) => {
            errorMap[error.field] = error.defaultMessage;
          });
          setErrors(errorMap);
        } else {
          // Xử lý lỗi chung (exception từ backend)
          throw new Error(errorData.message || "Đăng ký thất bại");
        }
      } else {
        // Thành công: Có thể chuyển hướng hoặc thông báo
        alert("Đăng ký thành công!");
        setFormData({
          name: "",
          email: "",
          pass: "",
          gender: null,
          dob: "",
        });
      }
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err);
      setErrors({ general: err.message || "Có lỗi xảy ra khi đăng ký" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center space-x-2">
          <FaUserPlus className="text-blue-600" />
          <span>Đăng Ký</span>
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
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
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-gray-50"
              placeholder="Nhập họ và tên"
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-gray-50"
              placeholder="Nhập email"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
              value={formData.pass}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-gray-50"
              placeholder="Nhập mật khẩu"
              required
            />
            {errors.pass && <p className="text-red-500 text-sm mt-1">{errors.pass}</p>}
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
                  checked={formData.gender === true}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all duration-200"
                  required
                />
                <span className="text-sm text-gray-700">Nam</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="false"
                  checked={formData.gender === false}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all duration-200"
                  required
                />
                <span className="text-sm text-gray-700">Nữ</span>
              </label>
            </div>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
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
              value={formData.dob}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-gray-50"
              required
            />
            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
          </div>

          {/* Thông báo lỗi chung */}
          {errors.general && (
            <p className="text-red-500 text-sm text-center">{errors.general}</p>
          )}

          {/* Button Đăng ký */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out shadow-md ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-blue-700 hover:to-indigo-600"
            }`}
          >
            {loading ? "Đang xử lý..." : "Đăng Ký"}
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