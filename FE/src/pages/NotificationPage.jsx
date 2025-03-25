import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xác Nhận
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ type, message, onClose }) => {
  const toastStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: <CheckCircle size={24} />,
    error: <XCircle size={24} />,
    warning: <AlertTriangle size={24} />,
    info: <Bell size={24} />,
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center space-x-4 px-6 py-4 rounded-xl text-white shadow-2xl animate-slide-in ${toastStyles[type]}`}
    >
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-75 transition-opacity"
      >
        <XCircle size={20} />
      </button>
    </div>
  );
};

const NotificationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [toast, setToast] = useState(null);

  const logError = (context, error, additionalInfo = {}) => {
    console.error(`🔴 Error in ${context}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userContext: user ? { userId: user.id } : "No user",
      ...additionalInfo,
    });
  };

  const fetchWithErrorHandling = async (
    url,
    options = {},
    expectJson = true
  ) => {
    try {
      console.log(`🌐 API Request: ${url}`, options);
      const response = await fetch(url, { ...options, credentials: "include" });

      if (!response.ok) {
        let errorMsg = "Lỗi không xác định từ máy chủ";
        if (
          response.headers.get("Content-Type")?.includes("application/json")
        ) {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } else {
          errorMsg = `Lỗi ${response.status}: ${response.statusText}`;
        }
        logError("API Request", new Error(errorMsg), { url, options });
        setToast({ type: "error", message: `Lỗi: ${errorMsg}` });
        throw new Error(errorMsg);
      }

      return expectJson &&
        response.headers.get("Content-Type")?.includes("application/json")
        ? await response.json()
        : null;
    } catch (error) {
      logError("Fetch Process", error, { url, options });
      throw error;
    }
  };

  const fetchNotifications = async (accountId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithErrorHandling(
        `http://localhost:8080/api/notification?id=${accountId}`,
        {},
        true
      );
      console.log("✅ Notifications fetched successfully:", data);
      setNotifications(
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (err) {
      setError("Không thể tải thông báo. Vui lòng kiểm tra kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetchWithErrorHandling(
        `http://localhost:8080/api/notification/read?notificationId=${notificationId}`,
        { method: "GET" },
        false
      );
      setNotifications((prev) =>
        prev.map(
          (noti) =>
            noti.id === notificationId ? { ...noti, read: true } : noti // Sử dụng read
        )
      );
      setToast({ type: "success", message: "Đã đánh dấu thông báo là đã đọc" });
    } catch (err) {
      // Error handling is done in fetchWithErrorHandling
    }
  };

  const getRelativeTimeVi = (date) => {
    if (!date) return "";
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    if (diffInSeconds < 60) return "vừa xong";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  };

  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
          <Bell size={64} className="mx-auto mb-4 text-blue-500" />
          <p className="text-xl text-gray-600">
            Vui lòng đăng nhập để xem thông báo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center">
          <Bell size={36} className="mr-4 text-blue-500" />
          Thông Báo
        </h1>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <Bell size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl text-gray-500">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notifications.map((noti) => (
              <div
                key={noti.id}
                className={`bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl ${
                  !noti.read ? "border-l-4 border-blue-500" : "opacity-80"
                }`}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {noti.tittle}
                </h2>
                <p className="text-gray-600 mb-4">{noti.message}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {getRelativeTimeVi(noti.createdAt)}
                  </span>
                  {!noti.read && ( // Chỉ hiển thị nút khi read === false
                    <button
                      onClick={() => setSelectedNotification(noti)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onConfirm={() => {
          markAsRead(selectedNotification.id);
          setSelectedNotification(null);
        }}
        title="Xác Nhận"
        message="Bạn có chắc chắn muốn đánh dấu thông báo này là đã đọc?"
      />
    </div>
  );
};

export default NotificationPage;
