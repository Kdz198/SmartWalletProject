import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, CheckCircle, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Mảng 6 phần tử cho OTP
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0); // 0: Đăng nhập, 1: Nhập email, 2: Nhập OTP, 3: Nhập mật khẩu mới
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading khi gửi OTP
  const [countdown, setCountdown] = useState(10); // Đếm ngược 60s
  const [canResend, setCanResend] = useState(false); // Có thể gửi lại OTP hay không
  const { login } = useAuth();
  const navigate = useNavigate();
  const otpRefs = useRef([]); // Ref cho 6 ô OTP

  // Đếm ngược 60s khi vào bước OTP
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer); // Dọn dẹp khi rời bước 2
    }
  }, [step, countdown]);

  // Xử lý đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const success = await login(email, password);
      if (success) {
        if (onClose) onClose();
        navigate("/account");
      } else {
        setError("Incorrect email or password");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  // Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/otp/send?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.text();
      if (data === "OTP sent successfully") {
        setSuccess("OTP đã được gửi đến email của bạn!");
        setStep(2);
        setCountdown(60); // Reset đếm ngược về 60s
        setCanResend(false); // Disable gửi lại
      } else {
        setError(data);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/otp/send?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.text();
      if (data === "OTP sent successfully") {
        setSuccess("OTP mới đã được gửi đến email của bạn!");
        setCountdown(60); // Reset đếm ngược
        setCanResend(false); // Disable gửi lại
        setOtp(["", "", "", "", "", ""]); // Reset OTP
      } else {
        setError(data);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi gửi lại OTP. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý nhập OTP
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Chỉ cho nhập số hoặc rỗng
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
    if (!value && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  // Xác minh OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const otpCode = otp.join("");
    try {
      const response = await fetch(
        `http://localhost:8080/otp/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.text();
      if (data === "OTP verified successfully") {
        setSuccess("OTP hợp lệ! Vui lòng nhập mật khẩu mới.");
        setStep(3);
      } else {
        setError("OTP không hợp lệ hoặc đã hết hạn.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi xác minh OTP. Vui lòng thử lại.");
    }
  };

  // Đặt lại mật khẩu (gọi endpoint mới với email, otp, newPassword)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const otpCode = otp.join("");
    try {
      const response = await fetch(
        `http://localhost:8080/otp/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}&newPassword=${encodeURIComponent(newPassword)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.text();
      if (data === "Password reset successfully") {
        setSuccess("Đặt lại mật khẩu thành công! Quay lại đăng nhập.");
        setTimeout(() => {
          setStep(0);
          setNewPassword("");
          setOtp(["", "", "", "", "", ""]);
          setSuccess("");
        }, 2000);
      } else {
        setError(data); // "Invalid email" hoặc "Invalid OTP"
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 space-y-6 transform transition-all hover:scale-[1.02] hover:shadow-3xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 mb-4">
            Finance Tracker
          </h2>
          <p className="text-gray-500 mb-8">
            {step === 0
              ? "Manage your finances with precision"
              : step === 1
              ? "Nhập email để nhận OTP"
              : step === 2
              ? "Nhập OTP từ email"
              : "Nhập mật khẩu mới"}
          </p>
        </div>

        {/* Form Đăng nhập */}
        {step === 0 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-alone focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 animate-pulse">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-md"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Form Gửi OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 animate-pulse">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                "Gửi OTP"
              )}
            </button>
          </form>
        )}

        {/* Form Nhập OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Nhập 6 số OTP
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    ref={(el) => (otpRefs.current[index] = el)}
                    className="w-12 h-12 text-center text-lg font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                ))}
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 animate-pulse">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-md"
            >
              Xác Minh OTP
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend || isLoading}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : canResend ? (
                "Gửi lại OTP"
              ) : (
                `Gửi lại OTP (${countdown}s)`
              )}
            </button>
          </form>
        )}

        {/* Form Đặt lại mật khẩu */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <Lock size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 animate-pulse">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-md"
            >
              Đặt Lại Mật Khẩu
            </button>
          </form>
        )}

        {/* Additional Links */}
        <div className="text-center">
          {step === 0 ? (
            <>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Forgot Password?
              </button>
              <p className="mt-4 text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-500 font-medium hover:text-blue-700">
                  Sign Up
                </a>
              </p>
            </>
          ) : (
            <button
              onClick={() => {
                setStep(0);
                setError("");
                setSuccess("");
                setOtp(["", "", "", "", "", ""]);
                setNewPassword("");
                setCountdown(60);
                setCanResend(false);
              }}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Quay lại đăng nhập
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;