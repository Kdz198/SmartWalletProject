import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/formatDate";
import { Link, useNavigate } from "react-router-dom";

const maleAvatar = "https://avatar.iran.liara.run/public/boy";
const femaleAvatar = "https://avatar.iran.liara.run/public/girl";

const AccountPage = () => {
  const { user } = useAuth();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    pass: "",
    email: "",
    gender: true,
    dob: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [showPopup, setShowPopup] = useState(false); // Trạng thái cho popup
  const navigate = useNavigate(); // Để điều hướng về trang đăng nhập

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!user || !user.id) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/account/findbyid?id=${user.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        console.log("API Request /findbyid:", {
          url: `http://localhost:8080/api/account/findbyid?id=${user.id}`,
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch account data");
        }

        const data = await response.json();
        console.log("API Response /findbyid:", data);
        setAccountData(data);
        setFormData({
          name: data.name,
          pass: data.pass,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
        });
      } catch (err) {
        console.error("Fetch Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const updatedData = { ...formData, id: user.id };

    try {
      const response = await fetch("http://localhost:8080/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
      console.log("API Request /update:", updatedData);

      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || "Update failed";
        } else {
          errorMessage = await response.text();
        }

        if (response.status === 409) {
          throw new Error(errorMessage || "Email already exists in the system");
        } else if (response.status === 400) {
          throw new Error(errorMessage || "Invalid data");
        } else {
          throw new Error(errorMessage || "Update failed");
        }
      }

      const data = await response.json();
      console.log("API Response /update:", data);
      setAccountData(data);
      setIsEditing(false);

      // Kiểm tra nếu email thay đổi
      if (formData.email !== accountData.email) {
        setShowPopup(true); // Hiển thị popup
        setTimeout(async () => {
          setShowPopup(false);
          await fetch("http://localhost:8080/logout", {
            method: "POST",
            credentials: "include",
          });
          navigate("/login"); // Chuyển hướng về trang đăng nhập
        }, 3000); // Hiển thị popup trong 3 giây
      } else {
        setSuccess("Account updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Update Error:", err.message);
      setError(err.message);
    }
  };

  const avatarUrl =
    accountData && accountData.gender ? maleAvatar : femaleAvatar;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error && !accountData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
            Your Account
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your financial profile
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                className="h-20 w-20 rounded-full border-4 border-white shadow-md"
                src={avatarUrl}
                alt="User avatar"
              />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {accountData.name}
                </h2>
                <p className="text-sm text-blue-100">{accountData.email}</p>
              </div>
            </div>
            <Link
              to="/"
              className="text-white hover:text-blue-200 transition-colors duration-200 text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>

          <div className="p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                <div className="relative">
                  <label className="block text-sm text-gray-500 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-500 mb-1">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="pass"
                    value={formData.pass}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 top-6 flex items-center text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-2.625m5.955-2.55A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 2.625m-5.955 2.55L12 15l-1.125 3.825z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-500 mb-1">
                    Gender
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="true"
                        checked={formData.gender === true}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="false"
                        checked={formData.gender === false}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Female</span>
                    </label>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-500 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200">
                  <span className="block text-sm text-gray-500">Full Name</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {accountData.name}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200">
                  <span className="block text-sm text-gray-500">Password</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ••••••••
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200">
                  <span className="block text-sm text-gray-500">Email</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {accountData.email}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200">
                  <span className="block text-sm text-gray-500">Gender</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {accountData.gender ? "Male" : "Female"}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200">
                  <span className="block text-sm text-gray-500">
                    Date of Birth
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatDate(accountData.dob)}
                  </span>
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="mt-6 border-t border-gray-100 pt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
                >
                  Edit Profile
                </button>
                <Link
                  to="/transactions"
                  className="bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                >
                  View Transactions
                </Link>
              </div>
            )}

            {error && (
              <p className="mt-4 text-red-500 text-center bg-red-50 p-2 rounded-md animate-pulse">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-4 text-green-500 text-center bg-green-50 p-2 rounded-md">
                {success}
              </p>
            )}
          </div>
        </div>

        {/* Popup hiển thị khi thay đổi email */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all duration-300 scale-100">
              <h3 className="text-lg font-semibold text-green-600">
                Cập nhật thành công!
              </h3>
              <p className="mt-2 text-gray-700">
                Bạn đã thay đổi email thành công. Vui lòng đăng nhập lại.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
            <h3 className="text-sm text-gray-500">Total Income</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              + $5,000.00
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
            <h3 className="text-sm text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600 mt-2">- $3,200.00</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
            <h3 className="text-sm text-gray-500">Balance</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">$1,800.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;