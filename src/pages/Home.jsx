import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiBell, FiShoppingCart, FiUsers, FiPackage, FiBarChart2,
  FiLoader, FiTrendingUp, FiAlertCircle, FiCreditCard, FiTruck, FiDollarSign
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from '../hooks/useReports';
import { useLowStockProducts, useProducts } from '../hooks/useProducts';
import { useSales, useOverdueSales } from '../hooks/useSales';
import { useDebtors } from '../hooks/useCustomers';

const Home = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats('today');
  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useLowStockProducts();
  const { data: productsData } = useProducts({});
  const totalProductsCount = productsData?.count || 0;
  const { data: recentSalesData, isLoading: salesLoading } = useSales({});
  const { data: overdueSalesData } = useOverdueSales();
  const overdueCount = overdueSalesData?.results?.length ?? overdueSalesData?.count ?? 0;
  const { data: debtorsData = [] } = useDebtors();
  const debtorsCount = Array.isArray(debtorsData) ? debtorsData.length : (debtorsData?.results?.length || debtorsData?.count || 0);

  const recentSales = (recentSalesData?.results || []).slice(0, 5);
  const fmt = (num) => parseFloat(num || 0).toLocaleString('uz-UZ');

  const revUZS  = parseFloat(stats?.revenue_uzs ?? 0);
  const revUSD  = parseFloat(stats?.revenue_usd ?? 0);
  const costUZS = parseFloat(stats?.cost_uzs ?? 0);
  const costUSD = parseFloat(stats?.cost_usd ?? 0);
  const profUZS = parseFloat(stats?.profit_uzs ?? stats?.gross_profit_uzs ?? 0);
  const profUSD = parseFloat(stats?.profit_usd ?? stats?.gross_profit_usd ?? 0);
  const purchaseUZS = parseFloat(stats?.purchase_total_uzs ?? stats?.purchase_total ?? 0);
  const purchaseUSD = parseFloat(stats?.purchase_total_usd ?? 0);
  const debtUZS = parseFloat(stats?.debt_uzs ?? 0);
  const debtUSD = parseFloat(stats?.debt_usd ?? 0);
  const salesCount = stats?.sales_count ?? 0;
  const purchasesCount = stats?.purchases_count ?? 0;

  const chartData = (stats?.daily_sales || []).map(item => ({
    name:  item.date,
    value: parseFloat(item.amount_uzs || 0) + parseFloat(item.amount_usd || 0),
  }));

  const today = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (statsLoading || lowStockLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <FiLoader className="w-10 h-10 text-[#1447E6] animate-spin" />
      </div>
    );
  }

  const span = (formatted) => formatted.length > 9 ? 'col-span-2 md:col-span-1' : 'col-span-1';
  const statCards = [
    {
      label: 'Tushum',
      icon: FiDollarSign,
      path: '/reports',
      value: `$${fmt(revUSD)}`,
      sub: `${fmt(revUZS)} so'm`,
      className: 'col-span-2 md:col-span-1',
    },
    {
      label: 'Foyda',
      icon: FiTrendingUp,
      path: '/reports',
      value: `$${fmt(profUSD)}`,
      sub: `${fmt(profUZS)} so'm`,
      className: 'col-span-2 md:col-span-1',
    },
    {
      label: 'Xarajat',
      icon: FiCreditCard,
      path: '/reports',
      value: `$${fmt(costUSD)}`,
      sub: `${fmt(costUZS)} so'm`,
      className: 'col-span-2 md:col-span-1',
    },
    {
      label: 'Xarid jami',
      icon: FiTruck,
      path: '/reports',
      value: `$${fmt(purchaseUSD)}`,
      sub: `${fmt(purchaseUZS)} so'm | ${purchasesCount} ta`,
      className: 'col-span-2 md:col-span-1',
    },
    {
      label: 'Qarz',
      icon: FiCreditCard,
      onClick: () => navigate('/customers', { state: { filter: 'Qarzdorlar' } }),
      value: `$${fmt(debtUSD)}`,
      sub: `${fmt(debtUZS)} so'm | ${debtorsCount} ta`,
      className: 'col-span-2 md:col-span-1',
    },
    {
      label: 'Sotuvlar',
      icon: FiShoppingCart,
      path: '/reports',
      value: salesCount,
      sub: `${purchasesCount} ta xarid`,
      className: span(String(salesCount)),
    },
    {
      label: 'Mahsulotlar',
      icon: FiPackage,
      path: '/warehouse',
      value: totalProductsCount,
      sub: 'dona',
      className: span(String(totalProductsCount)),
    },
  ];

  const quickActions = [
    { label: 'Sotuv', icon: FiShoppingCart, path: '/sales', bg: 'bg-blue-50', color: 'text-[#1447E6]' },
    { label: 'Mijozlar', icon: FiUsers, path: '/customers', bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Ombor', icon: FiPackage, path: '/warehouse', bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Hisobot', icon: FiBarChart2, path: '/reports', bg: 'bg-orange-50', color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-28 md:pb-8 font-sans">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1447E6] to-[#0F3CC7] px-5 md:px-8 pt-10 pb-16 md:pb-10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-16 -right-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h1 className="text-white text-xl md:text-2xl font-bold leading-tight">Xush kelibsiz!</h1>
              <p className="text-blue-200 text-xs mt-0.5 capitalize">{today}</p>
            </div>
            <button
              onClick={() => navigate('/notification')}
              className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white relative hover:bg-white/20 transition-colors"
            >
              <FiBell className="w-5 h-5" />
              {(lowStockProducts.length > 0 && lowStockProducts.length !== parseInt(localStorage.getItem('lastSeenLowStockCount') ?? '-1')) ||
               (overdueCount > 0 && overdueCount !== parseInt(localStorage.getItem('lastSeenOverdueCount') ?? '-1')) ? (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-[#1447E6]" />
              ) : null}
            </button>
          </div>

          {/* Stats grid — each card spans full width only if its number is long */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
            {statCards.map(({ label, path, onClick, value, sub, className, icon: Icon }) => {
              const content = (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20 h-full">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-blue-200 text-[10px] font-semibold uppercase tracking-widest">{label}</p>
                    <Icon className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                  </div>
                  <p className="text-white text-base md:text-lg font-black leading-tight">{value}</p>
                  <p className="text-blue-200 text-xs md:text-sm font-bold mt-0.5">{sub}</p>
                </div>
              );

              return path ? (
                <Link key={label} to={path} className={className}>
                  {content}
                </Link>
              ) : (
                <button key={label} onClick={onClick} className={`${className} cursor-pointer text-left hover:bg-white/10 transition-colors rounded-2xl`}>
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 md:px-8 -mt-6 relative z-10 max-w-6xl mx-auto">

        {/* Main card on mobile / two-column on desktop */}
        <div className="md:grid md:grid-cols-3 md:gap-6 md:items-start">

          {/* Left col — quick actions + chart */}
          <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4 md:mb-0">

            {/* Quick actions */}
            <div className="p-5 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-700 mb-4">Tezkor amallar</h2>
              <div className="grid grid-cols-4 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.path}
                      onClick={() => navigate(action.path)}
                      className="flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 ${action.bg} rounded-2xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${action.color}`} />
                      </div>
                      <span className="text-[10px] md:text-xs font-semibold text-gray-600">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 1 && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700">Sotuv dinamikasi</h2>
                  <FiTrendingUp className="text-[#1447E6] w-4 h-4" />
                </div>
                <div className="h-[180px] md:h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: 12 }} />
                      <Line type="monotone" dataKey="value" stroke="#1447E6" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: '#1447E6', stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Right col — recent sales + low stock */}
          <div className="space-y-4">

            {/* Recent sales */}
            {!salesLoading && recentSales.length > 0 && (
              <Link to='/customers'>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-gray-700 mb-3">So'nggi sotuvlar</h2>
                <div className="space-y-2">
                  {recentSales.map((sale) => {
                    const saleUzs = parseFloat(sale.total_uzs || sale.total || 0);
                    const saleUsd = parseFloat(sale.total_usd || 0);
                    const customerName = sale.customer_name || 'Noma\'lum mijoz';
                    return (
                      <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center font-bold text-[#1447E6] text-xs shrink-0">
                            {customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800 leading-tight">{customerName}</p>
                            <p className="text-[10px] text-gray-400">{new Date(sale.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-gray-900 shrink-0">
                          {saleUsd > 0 ? `$${saleUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${saleUzs.toLocaleString('uz-UZ')} so'm`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              </Link>
            )}

            {/* Low stock */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-50 rounded-xl flex items-center justify-center">
                      <FiAlertCircle className="text-red-500 w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-800 leading-tight">Kam qolgan</h2>
                      <p className="text-[10px] text-gray-400">{lowStockProducts.length} ta mahsulot</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/warehouse')}
                    className="text-[10px] font-bold text-[#1447E6] bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    Barchasi
                  </button>
                </div>
                <div className="space-y-2.5">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-center gap-3 bg-red-50/60 border border-red-100 rounded-2xl px-3.5 py-3">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <FiPackage className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{product.category_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-red-500">{product.quantity}</span>
                        <span className="text-[10px] text-red-400 ml-0.5">{product.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
