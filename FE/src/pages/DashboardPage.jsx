import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [deals, setDeals] = useState([]);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentMonth = 3;
  const currentYear = 2025;
  const accountId = user?.id; // Giả định user.id là accountId

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/budget/findbymonthandaccount?month=${currentMonth}&id=${accountId}`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch budgets");
        const data = await response.json();
        setBudgets(data);
      } catch (error) {
        console.error("Error fetching budgets:", error);
      }
    };

    const fetchDeals = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/deal/findbyaccount?id=${accountId}`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch deals");
        const data = await response.json();
        setDeals(data);
        console.log("Deals fetched:", data);
      } catch (error) {
        console.error("Error fetching deals:", error);
      }
    };

    if (user && accountId) {
      setLoading(true);
      Promise.all([fetchBudgets(), fetchDeals()]).finally(() => setLoading(false));
    }
  }, [user, accountId]);

  if (!user) {
    return <div className="text-center text-white">Please log in to view the dashboard.</div>;
  }

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  // Tính toán tổng thu nhập và chi tiêu từ deals
  const totalIncome = deals
    .filter((deal) => !deal.type) // false = earn
    .reduce((sum, deal) => sum + deal.total, 0);
  const totalExpense = deals
    .filter((deal) => deal.type) // true = pay
    .reduce((sum, deal) => sum + deal.total, 0);
  const remaining = totalIncome - totalExpense;

  // Lấy 3 giao dịch gần đây
  const recentDeals = deals
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  // Tổng hợp danh mục: Lấy tất cả deal chi tiêu (type = true) và tính tổng theo danh mục
  const categorySummary = deals
    .filter((deal) => deal.type) // true = pay
    .reduce((acc, deal) => {
      const categoryName = deal.category?.name || "Không xác định";
      acc[categoryName] = (acc[categoryName] || 0) + deal.total;
      return acc;
    }, {});

  console.log("Category Summary:", categorySummary);

  // Toggle Quick Actions Menu
  const toggleQuickMenu = () => setIsQuickMenuOpen(!isQuickMenuOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] via-[#2a4066] to-[#3b1e4d] text-gray-200 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00ddeb] to-[#ff6f61] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            Xin chào, {user.email}! Hôm nay là 24/03/2025
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col gap-6">
          {/* Main Row: Chart + 2 thẻ dọc */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Side Column */}
            <div className="flex flex-col gap-6 md:w-1/3 max-w-xs">
              {/* Tổng quan tài khoản */}
              <div className="bg-[rgba(40,40,60,0.9)] rounded-lg p-4 shadow-lg flex-1">
                <h2 className="text-lg font-semibold mb-3">
                  Tổng quan tài khoản (Tháng 3/2025)
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tổng thu nhập</span>
                    <span className="text-[#00ddeb] font-bold">
                      {totalIncome.toLocaleString()} VND
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[rgba(255,255,255,0.1)] pb-2">
                    <span>Tổng chi tiêu</span>
                    <span className="text-[#ff6f61] font-bold">
                      {totalExpense.toLocaleString()} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Còn lại</span>
                    <span className="text-[#00ddeb] font-bold">
                      {remaining.toLocaleString()} VND
                    </span>
                  </div>
                </div>
              </div>

              {/* Tiến độ ngân sách */}
              <div className="bg-[rgba(40,40,60,0.9)] rounded-lg p-4 shadow-lg flex-1">
                <h2 className="text-lg font-semibold mb-3">Tiến độ ngân sách</h2>
                <div className="space-y-2">
                  {budgets.length > 0 ? (
                    budgets.map((budget) => (
                      <div
                        key={budget.id}
                        className="flex justify-between border-b border-[rgba(255,255,255,0.1)] pb-2"
                      >
                        <span>{budget.name || "Unknown"}</span>
                        <span>
                          {(budget.spent || 0).toLocaleString()} /{" "}
                          {(budget.total || 0).toLocaleString()} VND (
                          {budget.total ? ((budget.spent / budget.total) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">Chưa có ngân sách nào.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-[rgba(40,40,60,0.9)] rounded-xl p-6 shadow-lg md:w-2/3">
              <h2 className="text-lg font-semibold mb-4">
                Thu/Chi tháng này (Tháng 3/2025)
              </h2>
              <div className="h-80 bg-[rgba(60,60,80,0.7)] rounded-lg flex items-center justify-center text-gray-400 text-lg">
                Biểu đồ tròn: <br />
                - Thu: {totalIncome.toLocaleString()} VND (
                {((totalIncome / (totalIncome + totalExpense)) * 100 || 0).toFixed(0)}%) <br />
                - Chi: {totalExpense.toLocaleString()} VND (
                {((totalExpense / (totalIncome + totalExpense)) * 100 || 0).toFixed(0)}%) <br />
                (Thay bằng Chart.js hoặc thư viện biểu đồ)
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tổng hợp danh mục */}
            <div className="bg-[rgba(40,40,60,0.9)] rounded-lg p-4 shadow-lg">
              <h2 className="text-lg font-semibold mb-3">
                Tổng hợp danh mục (Tất cả giao dịch chi tiêu)
              </h2>
              <div className="space-y-2">
                {Object.keys(categorySummary).length > 0 ? (
                  Object.entries(categorySummary).map(([category, total]) => (
                    <div
                      key={category}
                      className="flex justify-between border-b border-[rgba(255,255,255,0.1)] pb-2"
                    >
                      <span>{category}</span>
                      <span className="text-[#ff6f61] font-bold">
                        {total.toLocaleString()} VND
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Chưa có giao dịch chi tiêu nào.</p>
                )}
              </div>
            </div>

            {/* Giao dịch gần đây */}
            <div className="bg-[rgba(40,40,60,0.9)] rounded-lg p-4 shadow-lg">
              <h2 className="text-lg font-semibold mb-3">Giao dịch gần đây</h2>
              <div className="space-y-2">
                {recentDeals.length > 0 ? (
                  recentDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex justify-between border-b border-[rgba(255,255,255,0.1)] pb-2"
                    >
                      <span>
                        {new Date(deal.date).toLocaleDateString()} - {deal.description || "Không có mô tả"} (
                        {deal.category?.name || "Không xác định"})
                      </span>
                      <span
                        className={deal.type ? "text-[#ff6f61] font-bold" : "text-[#00ddeb]"}
                      >
                        {deal.type ? "-" : "+"}{deal.total.toLocaleString()} VND
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Chưa có giao dịch nào.</p>
                )}
              </div>
            </div>

            {/* So sánh với tháng trước (giả lập) */}
            <div className="bg-[rgba(40,40,60,0.9)] rounded-lg p-4 shadow-lg">
              <h2 className="text-lg font-semibold mb-3">So sánh với tháng trước</h2>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-[rgba(255,255,255,0.1)] pb-2">
                  <span>Thu: 10M (Th3) vs 8M (Th2)</span>
                  <span className="text-[#00ddeb] font-bold">+2,000,000 VND</span>
                </div>
                <div className="flex justify-between">
                  <span>Chi: 6M (Th3) vs 5M (Th2)</span>
                  <span className="text-[#ff6f61] font-bold">+1,000,000 VND</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Button */}
      <div
        className="fixed bottom-5 left-5 w-12 h-12 bg-gradient-to-r from-[#00ddeb] to-[#ff6f61] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform z-50"
        onClick={toggleQuickMenu}
      >
        <span className="text-2xl text-white">+</span>
      </div>
      <div
        className={`fixed bottom-20 left-5 bg-[rgba(30,30,47,0.95)] rounded-lg shadow-lg p-3 transition-all z-40 ${
          isQuickMenuOpen ? "block" : "hidden"
        }`}
      >
        <ul className="space-y-1">
          <li>
            <a href="#" className="block px-3 py-2 text-sm text-gray-300 hover:bg-[rgba(52,73,94,0.8)] hover:text-white rounded">
              Thêm giao dịch
            </a>
          </li>
          <li>
            <a href="#" className="block px-3 py-2 text-sm text-gray-300 hover:bg-[rgba(52,73,94,0.8)] hover:text-white rounded">
              Thêm ngân sách
            </a>
          </li>
          <li>
            <a href="#" className="block px-3 py-2 text-sm text-gray-300 hover:bg-[rgba(52,73,94,0.8)] hover:text-white rounded">
              Xem tất cả giao dịch
            </a>
          </li>
          <li>
            <a href="#" className="block px-3 py-2 text-sm text-gray-300 hover:bg-[rgba(52,73,94,0.8)] hover:text-white rounded">
              Xem tất cả ngân sách
            </a>
          </li>
          <li>
            <a href="#" className="block px-3 py-2 text-sm text-gray-300 hover:bg-[rgba(52,73,94,0.8)] hover:text-white rounded">
              Quản lý danh mục
            </a>
          </li>
          <li>
            <a href="#" className="block px-3 py-2 text-sm text-gray-300 hover:bg-[rgba(52,73,94,0.8)] hover:text-white rounded">
              Cài đặt tài khoản
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;