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
        {/* Hiển thị email người dùng nếu đã đăng nhập */}
        <AppRoutes />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
