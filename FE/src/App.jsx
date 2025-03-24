import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext"; // Import useAuth từ AuthContext riêng

function App() {
  const { user, logout } = useAuth(); // Lấy user và logout từ AuthContext

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50">
          {/* Hiển thị email người dùng nếu đã đăng nhập */}
          {user ? (
            <div className="p-4 text-center">
              <p className="text-lg">
                Welcome, <span className="font-bold">{user.email}</span>!
              </p>
              <button
                onClick={logout}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <p className="p-4 text-center">Please log in to see your email.</p>
          )}
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;