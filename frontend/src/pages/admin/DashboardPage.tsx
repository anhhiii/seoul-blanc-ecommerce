import React from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, Package, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../features/admin/hooks/useAdmin.js';

export const DashboardPage: React.FC = () => {
  const { useGetDashboardStats } = useAdmin();
  const { data: stats = {}, isLoading } = useGetDashboardStats();

  const kpis = stats.kpis || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalUsers: 0,
  };

  const monthlyData = stats.monthlyRevenue || [];
  const topProducts = stats.topSellingProducts || [];
  const lowStockProducts = stats.lowStockVariants || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-light text-brand-500">Đang tổng hợp dữ liệu thống kê...</p>
      </div>
    );
  }

  // Calculate SVG line/bar chart variables
  const maxRevenue = monthlyData.length > 0 ? Math.max(...monthlyData.map((d: any) => d.revenue)) : 100000;
  const chartHeight = 150;
  const chartWidth = 500;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-brand-950 tracking-wider uppercase">Tổng quan hệ thống</h1>
        <p className="text-xs text-brand-500 font-light mt-0.5">Cập nhật thống kê hoạt động kinh doanh của Seoul Blanc</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-brand-200/50 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-450 block">Doanh thu</span>
            <strong className="text-base font-bold text-brand-950 block mt-0.5">
              {kpis.totalRevenue.toLocaleString('vi-VN')}₫
            </strong>
          </div>
        </div>

        <div className="bg-white border border-brand-200/50 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingCart size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-450 block">Đơn hàng</span>
            <strong className="text-base font-bold text-brand-950 block mt-0.5">
              {kpis.totalOrders.toLocaleString('vi-VN')}
            </strong>
          </div>
        </div>

        <div className="bg-white border border-brand-200/50 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-450 block">Giá trị TB</span>
            <strong className="text-base font-bold text-brand-950 block mt-0.5">
              {Math.round(kpis.averageOrderValue).toLocaleString('vi-VN')}₫
            </strong>
          </div>
        </div>

        <div className="bg-white border border-brand-200/50 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-450 block">Người dùng</span>
            <strong className="text-base font-bold text-brand-950 block mt-0.5">
              {kpis.totalUsers.toLocaleString('vi-VN')}
            </strong>
          </div>
        </div>
      </div>

      {/* SVG Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-brand-200/50 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
              Biểu đồ Doanh thu (6 Tháng Gần Nhất)
            </h3>
            <p className="text-[10px] text-brand-500 font-light mt-0.5">Doanh thu bán lẻ theo lịch Dương</p>
          </div>

          {monthlyData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-brand-400 font-light">
              Chưa có dữ liệu thống kê theo tháng.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} 200`} className="w-full h-auto min-w-[450px]">
                {/* Horizontal Guide Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                  <line
                    key={i}
                    x1="40"
                    y1={40 + r * chartHeight}
                    x2={chartWidth - 20}
                    y2={40 + r * chartHeight}
                    stroke="#F1EFEA"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Bars Chart */}
                {monthlyData.map((d: any, idx: number) => {
                  const barWidth = 32;
                  const xGap = (chartWidth - 80) / monthlyData.length;
                  const x = 50 + idx * xGap + (xGap - barWidth) / 2;
                  const valHeight = maxRevenue > 0 ? (d.revenue / maxRevenue) * chartHeight : 0;
                  const y = 40 + chartHeight - valHeight;

                  return (
                    <g key={idx} className="group">
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={valHeight}
                        fill="#1F2937"
                        rx="4"
                        className="hover:fill-brand-700 transition-colors duration-300"
                      />
                      {/* Tooltip on hover */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        className="text-[8px] font-bold fill-brand-950 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {d.revenue >= 1000000 ? `${(d.revenue / 1000000).toFixed(1)}M` : `${Math.round(d.revenue / 1000)}K`}
                      </text>
                      {/* Month label */}
                      <text
                        x={x + barWidth / 2}
                        y={192}
                        textAnchor="middle"
                        className="text-[9px] font-light fill-brand-500 uppercase tracking-wider"
                      >
                        {d.month.split('-')[1]}/{d.month.split('-')[0].slice(-2)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white border border-brand-200/50 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={16} />
              <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
                Cảnh báo tồn kho ít (&lt; 5)
              </h3>
            </div>
            <div className="divide-y divide-brand-100 max-h-56 overflow-y-auto space-y-2 pr-1 text-left">
              {lowStockProducts.length === 0 ? (
                <p className="text-[11px] text-emerald-600 font-light py-4 text-center">
                  Tất cả các sản phẩm đều đang đủ hàng! 🎉
                </p>
              ) : (
                lowStockProducts.map((variant: any, idx: number) => (
                  <div key={idx} className="pt-2.5 first:pt-0 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-medium text-brand-900 block truncate max-w-[150px]">
                        {variant.productName}
                      </span>
                      <span className="text-[10px] text-brand-500 font-light block">
                        Size: {variant.size} • Màu: {variant.color}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded font-semibold text-[10px]">
                      Còn {variant.stock}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white border border-brand-200/50 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-brand-100">
          <Package className="text-brand-900" size={18} />
          <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest font-semibold">
            Sản Phẩm Bán Chạy Nhất
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-100 text-[10px] uppercase tracking-widest text-brand-500 font-bold">
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4 text-center">Số lượng bán</th>
                <th className="py-3 px-4 text-right">Doanh thu thu về</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 font-light text-brand-800">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-brand-400">
                    Chưa có doanh số bán hàng nào.
                  </td>
                </tr>
              ) : (
                topProducts.map((prod: any, idx: number) => (
                  <tr key={idx} className="hover:bg-brand-50/20">
                    <td className="py-3 px-4 font-medium text-brand-900">{prod.name}</td>
                    <td className="py-3 px-4 text-center font-semibold text-brand-950">{prod.soldQuantity}</td>
                    <td className="py-3 px-4 text-right font-bold text-brand-900">
                      {prod.revenue.toLocaleString('vi-VN')}₫
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
