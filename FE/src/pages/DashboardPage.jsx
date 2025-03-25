import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import formatCurrency from "../utils/formatCurrency";
import formatDate from "../utils/formatDate";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import Scrollbar from "react-scrollbars-custom"; // Import thư viện

// Đăng ký các thành phần của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const TrangTongQuan = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [deals, setDeals] = useState([]);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const thangHienTai = new Date().getMonth() + 1;
  const namHienTai = new Date().getFullYear();
  const idTaiKhoan = user?.id;

  // Xử lý lỗi API
  const xuLyLoiApi = (error, nguCanh) => {
    const thongBaoLoi = error.message || "Đã xảy ra lỗi không mong muốn";
    console.error(`${nguCanh} Lỗi:`, { message: thongBaoLoi, stack: error.stack });
    if (error.response) {
      console.error("Phản hồi API:", { data: error.response.data, status: error.response.status });
      toast.error(error.response.data.message || `Không thể ${nguCanh}. Vui lòng thử lại.`);
    } else {
      toast.error(`Không thể ${nguCanh}. Kiểm tra kết nối và thử lại.`);
    }
    setLoading(false);
  };

  // Lấy dữ liệu từ API
  useEffect(() => {
    const layNganSach = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/budget/findbymonthandaccount?month=${thangHienTai}&id=${idTaiKhoan}`,
          { method: "GET", credentials: "include", headers: { Accept: "application/json" } }
        );
        if (!response.ok) {
          const duLieuLoi = await response.json();
          throw Object.assign(new Error("Không thể lấy ngân sách"), { response: { data: duLieuLoi, status: response.status } });
        }
        const data = await response.json();
        setBudgets(data);
      } catch (error) {
        xuLyLoiApi(error, "lấy ngân sách");
      }
    };

    const layGiaoDich = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/deal/findbyaccount?id=${idTaiKhoan}`,
          { method: "GET", credentials: "include", headers: { Accept: "application/json" } }
        );
        if (!response.ok) {
          const duLieuLoi = await response.json();
          throw Object.assign(new Error("Không thể lấy giao dịch"), { response: { data: duLieuLoi, status: response.status } });
        }
        const data = await response.json();
        setDeals(data);
      } catch (error) {
        xuLyLoiApi(error, "lấy giao dịch");
      }
    };

    if (user && idTaiKhoan) {
      setLoading(true);
      Promise.all([layNganSach(), layGiaoDich()])
        .then(() => setLoading(false))
        .catch(() => toast.error("Không thể tải dữ liệu trang tổng quan."));
    }
  }, [user, idTaiKhoan]);

  // Giao diện khi chưa đăng nhập
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
        <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Vui Lòng Đăng Nhập</h2>
          <p className="text-gray-300">Truy cập thông tin tài chính của bạn một cách an toàn</p>
        </div>
      </div>
    );
  }

  // Giao diện khi đang tải
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Đang tải trang tổng quan tài chính của bạn...</p>
        </div>
      </div>
    );
  }

  // Tính toán dữ liệu thực tế
  const giaoDichThangHienTai = deals.filter(
    (deal) => new Date(deal.date).getMonth() + 1 === thangHienTai && new Date(deal.date).getFullYear() === namHienTai
  );
  const tongThuNhapThangHienTai = giaoDichThangHienTai.filter((deal) => !deal.type).reduce((sum, deal) => sum + deal.total, 0);
  const tongChiTieuThangHienTai = giaoDichThangHienTai.filter((deal) => deal.type).reduce((sum, deal) => sum + deal.total, 0);

  // Tổng hợp danh mục
  const tongHopDanhMuc = deals
    .filter((deal) => deal.type)
    .reduce((acc, deal) => {
      const tenDanhMuc = deal.category?.name || "Không phân loại";
      acc[tenDanhMuc] = (acc[tenDanhMuc] || 0) + deal.total;
      return acc;
    }, {});

  // Chỉ lấy 5 danh mục đầu tiên
  const danhMucHienThi = Object.entries(tongHopDanhMuc).slice(0, 5);

  // Dữ liệu Bar Chart (3 tháng gần nhất)
  const thangTruoc1 = thangHienTai === 1 ? 12 : thangHienTai - 1;
  const namThangTruoc1 = thangHienTai === 1 ? namHienTai - 1 : namHienTai;
  const thangTruoc2 = thangTruoc1 === 1 ? 12 : thangTruoc1 - 1;
  const namThangTruoc2 = thangTruoc1 === 1 ? namHienTai - 1 : namHienTai;

  const giaoDichThangTruoc1 = deals.filter(
    (deal) => new Date(deal.date).getMonth() + 1 === thangTruoc1 && new Date(deal.date).getFullYear() === namThangTruoc1
  );
  const giaoDichThangTruoc2 = deals.filter(
    (deal) => new Date(deal.date).getMonth() + 1 === thangTruoc2 && new Date(deal.date).getFullYear() === namThangTruoc2
  );

  const tongThuNhapThangTruoc1 = giaoDichThangTruoc1.filter((deal) => !deal.type).reduce((sum, deal) => sum + deal.total, 0);
  const tongChiTieuThangTruoc1 = giaoDichThangTruoc1.filter((deal) => deal.type).reduce((sum, deal) => sum + deal.total, 0);
  const tongThuNhapThangTruoc2 = giaoDichThangTruoc2.filter((deal) => !deal.type).reduce((sum, deal) => sum + deal.total, 0);
  const tongChiTieuThangTruoc2 = giaoDichThangTruoc2.filter((deal) => deal.type).reduce((sum, deal) => sum + deal.total, 0);

  const duLieuBieuDoBar = {
    labels: [`Tháng ${thangTruoc2}`, `Tháng ${thangTruoc1}`, `Tháng ${thangHienTai}`],
    datasets: [
      { label: "Thu Nhập", data: [tongThuNhapThangTruoc2, tongThuNhapThangTruoc1, tongThuNhapThangHienTai], backgroundColor: "#06B6D4" },
      { label: "Chi Tiêu", data: [tongChiTieuThangTruoc2, tongChiTieuThangTruoc1, tongChiTieuThangHienTai], backgroundColor: "#EC4899" },
    ],
  };

  // Dữ liệu Line Chart (theo ngày trong tháng hiện tại)
  const ngayTrongThang = Array.from({ length: 31 }, (_, i) => i + 1);
  const thuNhapTheoNgay = ngayTrongThang.map((ngay) => {
    return giaoDichThangHienTai
      .filter((deal) => !deal.type && new Date(deal.date).getDate() <= ngay)
      .reduce((sum, deal) => sum + deal.total, 0);
  });
  const chiTieuTheoNgay = ngayTrongThang.map((ngay) => {
    return giaoDichThangHienTai
      .filter((deal) => deal.type && new Date(deal.date).getDate() <= ngay)
      .reduce((sum, deal) => sum + deal.total, 0);
  });

  const duLieuBieuDoLine = {
    labels: ngayTrongThang.map((ngay) => `${ngay}`),
    datasets: [
      { label: "Thu Nhập", data: thuNhapTheoNgay, borderColor: "#06B6D4", fill: false },
      { label: "Chi Tiêu", data: chiTieuTheoNgay, borderColor: "#EC4899", fill: false },
    ],
  };

  // Dữ liệu Pie Chart
  const duLieuBieuDoPie = {
    labels: ["Thu Nhập", "Chi Tiêu"],
    datasets: [{ data: [tongThuNhapThangHienTai, tongChiTieuThangHienTai], backgroundColor: ["#06B6D4", "#EC4899"], borderWidth: 1 }],
  };

  // Tùy chọn chung cho biểu đồ
  const tuyChonBieuDo = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#E5E7EB" } },
      tooltip: { callbacks: { label: (context) => `${context.label || context.dataset.label}: ${formatCurrency(context.raw, "VND", "vi-VN")}` } },
    },
  };

  const tuyChonBieuDoBarLine = {
    ...tuyChonBieuDo,
    scales: {
      y: { ticks: { callback: (value) => formatCurrency(value, "VND", "vi-VN") } },
    },
  };

  const batTatMenuNhanh = () => setIsQuickMenuOpen(!isQuickMenuOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-gray-100 p-6">
      <ToastContainer theme="dark" position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
      <div className="container mx-auto max-w-7xl">
        {/* Tiêu đề */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent animate-pulse">
            Trang Tổng Quan
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            Xin chào, {user.email}! Hôm nay là {formatDate(new Date(), "vi-VN")}
          </p>
        </header>

        {/* Bố cục chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Tổng quan tài khoản & Tổng hợp danh mục */}
          <div className="space-y-6">
            {/* Tổng quan tài khoản */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">
                Tổng Quan Tài Khoản (Tháng {thangHienTai} {namHienTai})
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Tổng Thu Nhập</span>
                  <span className="text-cyan-400 font-bold">{formatCurrency(tongThuNhapThangHienTai, "VND", "vi-VN")}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Tổng Chi Tiêu</span>
                  <span className="text-pink-500 font-bold">{formatCurrency(tongChiTieuThangHienTai, "VND", "vi-VN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Còn Lại</span>
                  <span className="text-cyan-400 font-bold">
                    {formatCurrency(tongThuNhapThangHienTai - tongChiTieuThangHienTai, "VND", "vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Tổng hợp danh mục với react-scrollbars-custom */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">Tổng Hợp Danh Mục</h2>
              <Scrollbar
                style={{ height: 160 }}
                trackYProps={{ style: { width: 6, background: "transparent" } }}
                thumbYProps={{
                  style: {
                    background: "rgba(6, 182, 212, 0.7)",
                    borderRadius: "3px",
                    opacity: 0,
                    transition: "opacity 0.3s",
                  },
                }}
                onMouseEnter={(e) => (e.currentTarget.querySelector(".ScrollbarsCustom-ThumbY").style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.querySelector(".ScrollbarsCustom-ThumbY").style.opacity = 0)}
              >
                <div className="space-y-3 text-sm">
                  {Object.keys(tongHopDanhMuc).length > 0 ? (
                    danhMucHienThi.map(([danhMuc, tong]) => (
                      <div key={danhMuc} className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <span>{danhMuc}</span>
                        <span className="text-pink-500 font-bold">{formatCurrency(tong, "VND", "vi-VN")}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">Chưa có giao dịch chi tiêu nào.</p>
                  )}
                </div>
              </Scrollbar>
            </div>
          </div>

          {/* Cột giữa: Pie Chart */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">Thu Nhập vs Chi Tiêu</h2>
            <div className="h-64">
              <Pie data={duLieuBieuDoPie} options={tuyChonBieuDo} />
            </div>
          </div>

          {/* Cột phải: Bar Chart */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">So Sánh Các Tháng</h2>
            <div className="h-64">
              <Bar data={duLieuBieuDoBar} options={tuyChonBieuDoBarLine} />
            </div>
          </div>

          {/* Hàng dưới: Line Chart & Tiến độ ngân sách */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">Xu Hướng Tháng {thangHienTai}</h2>
            <div className="h-64">
              <Line data={duLieuBieuDoLine} options={tuyChonBieuDoBarLine} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">Tiến Độ Ngân Sách</h2>
            <div className="space-y-3 text-sm">
              {budgets.length > 0 ? (
                budgets.map((budget) => (
                  <div key={budget.id} className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span>{budget.name || "Không xác định"}</span>
                    <span className="text-gray-300">
                      {formatCurrency(budget.spent || 0, "VND", "vi-VN")} /{" "}
                      {formatCurrency(budget.total || 0, "VND", "vi-VN")} (
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
      </div>

      {/* Nút Hành Động Nhanh */}
      <div
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform duration-300 z-50"
        onClick={batTatMenuNhanh}
      >
        <span className="text-3xl text-white">+</span>
      </div>
      <div
        className={`fixed bottom-24 right-6 bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-2xl p-4 transition-all duration-300 z-40 ${
          isQuickMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <ul className="space-y-2">
          {["Thêm Giao Dịch", "Thêm Ngân Sách", "Xem Tất Cả Giao Dịch", "Xem Tất Cả Ngân Sách", "Quản Lý Danh Mục", "Cài Đặt Tài Khoản"].map((muc) => (
            <li key={muc}>
              <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80 hover:text-white rounded-lg transition-colors">
                {muc}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrangTongQuan;