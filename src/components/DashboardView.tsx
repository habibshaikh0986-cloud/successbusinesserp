import React, { useState } from "react";
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Warehouse, Users, 
  ShoppingBag, ArrowUpRight, ArrowDownLeft, AlertCircle, Plus, 
  X, Check, Lock, ChevronDown, UserCheck, RefreshCw, BarChart2, ShieldCheck, MapPin,
  ChevronRight
} from "lucide-react";
import { UserRole, TransactionModel, ProductModel, SystemLogModel } from "../types";
import { AnimatePresence, motion } from "motion/react";
import PaymentGateway from "./PaymentGateway";

interface DashboardViewProps {
  userRole: UserRole;
  userName: string;
  transactions: TransactionModel[];
  products: ProductModel[];
  systemLogs: SystemLogModel[];
  onAddTransaction: (tx: { title: string; amount: number; type: "sale" | "purchase" | "expense"; category: string; paymentMethod: "Cash" | "Bank" | "Mobile Pay" }) => void;
  onReplenishStock: (id: string, qty: number) => void;
  isDark: boolean;
  onAddLog: (action: string, details: string) => void;
}

export default function DashboardView({
  userRole,
  userName,
  transactions,
  products,
  systemLogs,
  onAddTransaction,
  onReplenishStock,
  isDark,
  onAddLog
}: DashboardViewProps) {
  // Local state for interactive modals and filters
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "sale" | "purchase" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Transaction Form fields
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"sale" | "purchase" | "expense">("sale");
  const [txCategory, setTxCategory] = useState("Hardware");
  const [txPayment, setTxPayment] = useState<"Cash" | "Bank" | "Mobile Pay">("Cash");

  // Chart state (active metric selector)
  const [activeChart, setActiveChart] = useState<"sales" | "purchases" | "expenses" | "profit">("sales");

  // Calculations
  const stockValue = products.reduce((sum, item) => sum + item.currentStock * item.purchasePrice, 0);
  const totalSales = transactions.filter(t => t.type === "sale").reduce((sum, t) => sum + t.amount, 0);
  const totalPurchases = transactions.filter(t => t.type === "purchase").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const todayProfit = totalSales - totalPurchases - totalExpenses;

  // Static metrics that stay stable
  const bankBalance = 185300.50 + (totalSales * 0.6) - (totalPurchases * 0.5) - (totalExpenses * 0.4);
  const cashBalance = 45200.00 + (totalSales * 0.4) - (totalPurchases * 0.5) - (totalExpenses * 0.6);
  const outstandingPayments = 12450.00; // Invoice outstanding
  const totalCustomers = 142 + Math.floor(totalSales / 1000);
  const totalSuppliers = 38;

  const lowStockItems = products.filter(p => p.currentStock <= p.minRequiredStock);

  // Filter transactions based on type and query
  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filterType === "all" || t.type === filterType;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount || isNaN(Number(txAmount))) return;
    
    // Check permission restrictions for safety
    if (userRole === "general" && txType === "expense") {
      alert("Permission Denied: General users are restricted from recording custom office expenses.");
      return;
    }

    onAddTransaction({
      title: txTitle,
      amount: Math.abs(Number(txAmount)),
      type: txType,
      category: txCategory,
      paymentMethod: txPayment,
    });

    // Reset Form
    setTxTitle("");
    setTxAmount("");
    setShowAddModal(false);
  };

  const isRestricted = (metric: string) => {
    // General user has strict restrictions: Only Today Sales, stock level count. Rest are locked.
    if (userRole === "general") {
      return ["profit", "purchase", "expense", "bank", "cash", "outstanding"].includes(metric);
    }
    return false;
  };

  // Modern SVG Chart Helper
  const renderChart = () => {
    const dataPoints = {
      sales: [1200, 3100, 2400, totalSales > 0 ? (totalSales * 0.8) + 1200 : 1800, totalSales > 0 ? totalSales + 500 : 2722],
      purchases: [900, 1800, 1300, totalPurchases > 0 ? (totalPurchases * 0.6) + 500 : 1100, totalPurchases > 0 ? totalPurchases + 400 : 1675],
      expenses: [400, 950, 710, totalExpenses > 0 ? (totalExpenses * 0.7) + 200 : 850, totalExpenses > 0 ? totalExpenses + 200 : 597],
      profit: [800, 1300, 1690, todayProfit > 0 ? todayProfit - 200 : 700, todayProfit > 0 ? todayProfit : 1047]
    };

    const activePoints = dataPoints[activeChart];
    const maxVal = Math.max(...activePoints, 1000) * 1.15;
    
    // Generates coordinates for a svg polyline & custom smooth gradient fill
    const width = 310;
    const height = 110;
    const xStep = width / (activePoints.length - 1);
    
    const pointsMap = activePoints.map((val, idx) => {
      const x = idx * xStep;
      const y = height - (val / maxVal) * (height - 10);
      return { x, y, value: val };
    });

    const dStr = pointsMap.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const fillStr = `${dStr} L ${width} ${height} L 0 ${height} Z`;

    const labels = ["Mon", "Tue", "Wed", "Thu", "Today"];

    return (
      <div className="w-full mt-2.5">
        <div className="relative h-28 w-full bg-linear-to-b from-transparent to-blue-50/10 rounded-lg overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1={height*0.25} x2={width} y2={height*0.25} stroke="rgba(148,163,184,0.15)" strokeDasharray="3" />
            <line x1="0" y1={height*0.5} x2={width} y2={height*0.5} stroke="rgba(148,163,184,0.15)" strokeDasharray="3" />
            <line x1="0" y1={height*0.75} x2={width} y2={height*0.75} stroke="rgba(148,163,184,0.15)" strokeDasharray="3" />
            
            {/* Smooth Fill Area */}
            <path d={fillStr} fill="url(#chartGrad)" />
            
            {/* Polyline Path */}
            <path d={dStr} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Point dots */}
            {pointsMap.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill={isDark ? "#1E293B" : "#FFFFFF"} stroke="#2563EB" strokeWidth="2.5" />
                <text x={p.x} y={p.y - 8} fontSize="7" fill={isDark ? "#94A3B8" : "#475569"} textAnchor="middle" fontWeight="bold">
                  ₹{Math.round(p.value)}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        {/* Dynamic labels */}
        <div className="flex justify-between px-1 text-[9px] font-mono font-medium text-slate-500 mt-1.5">
          {labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto select-none pb-20 font-sans">
      {/* Dynamic Role Access Indicator Banner */}
      <div className={`p-2.5 px-3.5 flex items-center justify-between text-xs tracking-wide ${
        isDark ? "bg-blue-950/40 text-blue-300 border-b border-blue-900/40" : "bg-blue-50 text-blue-800 border-b border-blue-100"
      }`}>
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span className="capitalize font-semibold text-[11px] uppercase tracking-wider">{userRole} Credentials Session</span>
        </div>
        <div className="text-[10px] font-mono bg-blue-500/10 px-2 py-0.5 rounded-full font-semibold border border-blue-500/20">
          ONLINE CLOUD ENGINE
        </div>
      </div>

      {/* Hero Welcome Row */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Success Business</span>
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
          Welcome, {userName}!
        </h2>
        <p className="text-xs text-slate-500">
          Last sync: Real-time. Operating under {userRole} mode.
        </p>
      </div>

      {/* GRID 1: High Level Metrics */}
      <div className="px-4 py-3 grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card: Today Sales */}
        <div className={`p-5 rounded-[32px] border transition-all ${
          isDark ? "bg-slate-800/80 border-slate-705/10 shadow-lg" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today's Sales</span>
            <div className="p-1 rounded-full bg-blue-50 text-blue-600 font-extrabold text-[10px] px-2 py-0.5">
              Sales
            </div>
          </div>
          <span className={`text-xl font-black tracking-tight block leading-none mb-1 ${isDark ? "text-blue-400" : "text-blue-900"}`}>
            ₹{totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="text-[10px] text-green-600 font-bold bg-green-50 self-start inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-2.5 h-2.5" />
            <span>↑ 12.5%</span>
          </div>
        </div>

        {/* Card: Today Purchase */}
        <div className={`p-5 rounded-[32px] border transition-all relative overflow-hidden ${
          isDark ? "bg-slate-800/80 border-slate-705/10 shadow-lg" : "bg-white border-slate-100 shadow-sm"
        }`}>
          {isRestricted("purchase") && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center">
              <Lock className="w-4 h-4 text-slate-400 mb-1 animate-pulse" />
              <span className="text-[8px] text-slate-400 uppercase tracking-widest leading-none">Restricted Role</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Purchases</span>
            <div className="p-1 rounded-full bg-orange-50 text-orange-600 font-extrabold text-[10px] px-2 py-0.5">
              Stock
            </div>
          </div>
          <span className={`text-xl font-black tracking-tight block leading-none mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>
            ₹{totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <p className="text-[9px] text-slate-500 font-medium">Auto Stock Top-up Enabled</p>
        </div>

        {/* Card: Today Profit */}
        <div className={`p-5 rounded-[32px] border transition-all relative overflow-hidden ${
          isDark ? "bg-slate-800/80 border-slate-705/10 shadow-lg" : "bg-white border-slate-100 shadow-sm"
        }`}>
          {isRestricted("profit") && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center">
              <Lock className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-[8px] text-slate-400 uppercase tracking-widest leading-none">Restricted Role</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Profit</span>
            <div className="p-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5">
              Profit
            </div>
          </div>
          <span className={`text-xl font-black tracking-tight block leading-none mb-1 ${todayProfit >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : 'text-red-500'}`}>
            ₹{todayProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <p className="text-[9px] text-slate-500 font-medium">Margins: Optimized</p>
        </div>

        {/* Card: Today Expense */}
        <div className={`p-5 rounded-[32px] border transition-all relative overflow-hidden ${
          isDark ? "bg-slate-800/80 border-slate-705/10 shadow-lg" : "bg-white border-slate-100 shadow-sm"
        }`}>
          {isRestricted("expense") && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center">
              <Lock className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-[8px] text-slate-400 uppercase tracking-widest leading-none">Restricted Role</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expenses</span>
            <div className="p-1 rounded-full bg-red-50 text-red-600 font-extrabold text-[10px] px-2 py-0.5">
              Ops
            </div>
          </div>
          <span className={`text-xl font-black tracking-tight block leading-none mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>
            ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <p className="text-[9px] text-slate-500 font-medium">Control audit active</p>
        </div>
      </div>

      {/* Balances Grid: Cash, Bank, Outstanding, Stock Value */}
      <h3 className={`text-xs font-bold uppercase tracking-wider px-4 mt-3 mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        Asset & Ledger Accounts
      </h3>
      <div className="px-4 grid grid-cols-2 lg:grid-cols-4 gap-3 pb-2">
        {/* Cash Balance */}
        <div className={`p-3 rounded-xl border relative overflow-hidden ${
          isDark ? "bg-slate-900/65 border-slate-800" : "bg-slate-50 border-slate-200/50"
        }`}>
          {isRestricted("cash") && (
            <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
            <Wallet className="w-3 h-3 text-emerald-500" />
            <span>Cash Ledger</span>
          </div>
          <div className={`text-sm font-bold mt-1 ${isDark ? "text-white" : "text-slate-800"}`}>
            ₹{cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Bank Balance */}
        <div className={`p-3 rounded-xl border relative overflow-hidden ${
          isDark ? "bg-slate-900/65 border-slate-800" : "bg-slate-50 border-slate-200/50"
        }`}>
          {isRestricted("bank") && (
            <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
            <Warehouse className="w-3 h-3 text-blue-500" />
            <span>Bank Account</span>
          </div>
          <div className={`text-sm font-bold mt-1 ${isDark ? "text-white" : "text-slate-800"}`}>
            ₹{bankBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Outstanding Payment (Click to collect via Secure Payment Gateway) */}
        <div 
          onClick={() => {
            if (!isRestricted("outstanding")) {
              setShowPaymentGateway(true);
              onAddLog("PAYMENT_GATEWAY_OPEN", "User launched secure customer payment checkout interface from Ledger");
            }
          }}
          className={`p-3 rounded-xl border relative overflow-hidden transition-all group ${
            isRestricted("outstanding") ? "" : "cursor-pointer hover:border-blue-500/50 hover:shadow-xs"
          } ${
            isDark ? "bg-slate-900/65 border-slate-800" : "bg-slate-50 border-slate-200/50"
          }`}
        >
          {isRestricted("outstanding") && (
            <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            </div>
          )}
          {!isRestricted("outstanding") && (
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
            <Users className="w-3 h-3 text-amber-500" />
            <span>Outstandings</span>
          </div>
          <div className={`text-sm font-bold mt-1 ${isDark ? "text-white" : "text-slate-800"}`}>
            ₹{outstandingPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          {!isRestricted("outstanding") && (
            <div className="text-[7.5px] text-blue-500 font-bold uppercase tracking-wider mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Collect via Gateway <ChevronRight className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* Stock Value */}
        <div className={`p-3 rounded-xl border ${
          isDark ? "bg-slate-900/65 border-slate-800" : "bg-slate-50 border-slate-200/50"
        }`}>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
            <ShoppingBag className="w-3 h-3 text-purple-500" />
            <span>Total Stock</span>
          </div>
          <div className={`text-sm font-bold mt-1 ${isDark ? "text-white" : "text-slate-800"}`}>
            ₹{stockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Tabbed Interactive Trend Chart */}
      <div className="px-4 mt-4">
        <div className={`p-6 rounded-[32px] border ${
          isDark ? "bg-slate-800/80 border-slate-705/15 shadow-lg" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h4 className={`text-sm font-bold uppercase tracking-tighter ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Sales Revenue Graph
            </h4>
            <div className="flex gap-1.5 flex-wrap">
              {(["sales", "purchases", "expenses", "profit"] as const).map((chart) => (
                <button
                  key={chart}
                  onClick={() => {
                    setActiveChart(chart);
                    onAddLog("CHART_VIEW", `Switched financial trend graph view to highlight ${chart}`);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeChart === chart 
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : (isDark ? "bg-slate-900/60 text-slate-400 hover:text-white border border-transparent" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent")
                  }`}
                >
                  {chart}
                </button>
              ))}
            </div>
          </div>
          {renderChart()}
        </div>
      </div>

      {/* Action Indicators: Customers & Suppliers info */}
      <div className="px-4 py-2.5 mt-2 flex items-center justify-between gap-3 text-center">
        <div className={`flex-1 p-2.5 rounded-xl border ${isDark ? "bg-slate-800/10 border-slate-700" : "bg-slate-50 border-slate-150"}`}>
          <div className={`text-lg font-extrabold ${isDark ? "text-white" : "text-slate-800"}`}>
            {totalCustomers}
          </div>
          <p className="text-[9px] text-slate-400 uppercase font-semibold">Active Customers</p>
        </div>
        <div className={`flex-1 p-2.5 rounded-xl border ${isDark ? "bg-slate-800/10 border-slate-700" : "bg-slate-50 border-slate-150"}`}>
          <div className={`text-lg font-extrabold ${isDark ? "text-white" : "text-slate-800"}`}>
            {totalSuppliers}
          </div>
          <p className="text-[9px] text-slate-400 uppercase font-semibold">Verified Suppliers</p>
        </div>
      </div>

      {/* Low Stock Actionable Section */}
      <div className="px-4 mt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-705"}`}>
              Low Stock Alert ({lowStockItems.length})
            </h4>
          </div>
          <span className="text-[9px] font-mono font-medium text-slate-400 uppercase">Procurement Module</span>
        </div>

        {lowStockItems.length === 0 ? (
          <div className={`p-4 rounded-xl text-center text-xs font-medium border ${
            isDark ? "bg-slate-800/10 border-slate-700 text-green-400" : "bg-green-50/50 border-green-150 text-green-700"
          }`}>
            ✅ Stock levels optimized. No replenishment pending.
          </div>
        ) : (
          <div className="space-y-2">
            {lowStockItems.map((prod) => (
              <div key={prod.id} className={`p-3 rounded-xl border flex items-center justify-between ${
                isDark ? "bg-slate-800/30 border-slate-700/60" : "bg-white border-slate-150 shadow-xs"
              }`}>
                <div>
                  <h5 className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {prod.name}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>Stock: <strong className="text-amber-500 font-extrabold">{prod.currentStock}</strong>/{prod.minRequiredStock}</span>
                    <span>•</span>
                    <span>SKU: {prod.sku}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onReplenishStock(prod.id, 10);
                    onAddLog("ORDER_REPLENISH", `Top up of +10 case stock initiated for ${prod.name}`);
                  }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 transition-colors text-[10px] font-semibold text-white rounded-lg flex items-center gap-1 cursor-pointer outline-none"
                >
                  <RefreshCw className="w-3 h-3 animate-spin duration-3000" />
                  Order +10
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Selling Products */}
      <div className="px-4 mt-5">
        <div className={`p-4 rounded-[32px] border ${
          isDark ? "bg-slate-800/80 border-slate-700/60 shadow-lg" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                Top Selling Products
              </h4>
            </div>
            <span className="text-[8.5px] font-mono font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded">HOT SKU</span>
          </div>

          <div className="space-y-2">
            {products.slice(0, 3).map((prod, index) => {
              const performanceColors = ["text-rose-500 bg-rose-500/10", "text-amber-500 bg-amber-500/10", "text-blue-500 bg-blue-500/10"];
              const salesRates = ["134 Orders This Month", "98 Orders This Month", "76 Orders This Month"];
              return (
                <div key={prod.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isDark ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-150"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center font-mono ${performanceColors[index] || 'text-slate-500 bg-slate-100'}`}>
                      #{index + 1}
                    </span>
                    <div>
                      <h5 className={`text-xs font-bold leading-none ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {prod.name}
                      </h5>
                      <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">{prod.sku} • {prod.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] font-bold text-emerald-500 font-mono leading-none block">₹{prod.retailPrice.toFixed(2)}</span>
                    <span className="text-[8px] text-slate-400 font-medium block mt-0.5">{salesRates[index] || "Steady Sales"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions List with Type Filters */}
      <div className="px-4 mt-5">
        <div className={`p-6 rounded-[32px] border ${
          isDark ? "bg-slate-800/80 border-slate-705/15 shadow-lg" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between">
              <h4 className={`text-base font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                Recent Transactions
              </h4>
              <span className="text-[9px] font-mono font-black text-blue-500 uppercase tracking-widest">Compliance Active</span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 mt-0.5">
              {(["all", "sale", "purchase", "expense"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all ${
                    filterType === t 
                      ? "bg-blue-600 text-white shadow-xs" 
                      : (isDark ? "bg-slate-900/40 text-slate-400 hover:text-slate-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100")
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className={`flex items-center gap-3 p-3.5 transition-all ${
                isDark ? "bg-slate-900/50 hover:bg-slate-900/80 text-white rounded-2xl border border-slate-800" : "bg-slate-50 hover:bg-slate-100/70 text-slate-900 rounded-2xl"
              }`}>
                {/* Visual Indicator of IN/OUT */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                  tx.type === "sale" 
                    ? "bg-blue-100 text-blue-600" 
                    : (tx.type === "purchase" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-650")
                }`}>
                  {tx.type === "sale" ? "IN" : "OUT"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold leading-none truncate">{tx.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                    <span className="font-extrabold uppercase text-blue-500">{tx.category}</span>
                    <span>•</span>
                    <span className="truncate">{tx.referenceNumber}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    By: {tx.loggedBy} [{tx.paymentMethod}]
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-black ${
                    tx.type === "sale" ? "text-green-600" : "text-red-500"
                  }`}>
                    {tx.type === "sale" ? "+" : "-"}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No transactions found matching filters.
              </div>
            )}
          </div>
          
          <button 
            type="button"
            onClick={() => {
              setFilterType("all");
              setSearchQuery("");
              onAddLog("RESET_FILTERS", "Reset all ledger audit filters");
            }}
            className="w-full mt-4 py-3 border-2 border-dashed border-slate-205 text-slate-400 hover:text-slate-650 rounded-2xl text-xs font-bold transition-all cursor-pointer hover:border-blue-300"
          >
            Clear Active Filters ({filteredTransactions.length})
          </button>
        </div>
      </div>

      {/* FLOAT MODAL TRIGGER (Floating Action Button) */}
      <div className="absolute bottom-6 right-6 z-40">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 transition-transform active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/30 cursor-pointer outline-none focus:ring-4 focus:ring-blue-500/30"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modal Overlay for Add Transaction */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-end"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`w-full max-h-[85%] rounded-t-3xl border-t p-6 pb-8 overflow-y-auto ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold tracking-tight">Post New Transaction</h3>
                  <p className="text-xs text-slate-400">Record journal ledger entry instantly</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full hover:bg-slate-800/10"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateTx} className="space-y-4">
                {/* Select Transaction Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Entry Classification</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["sale", "purchase", "expense"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTxType(type)}
                        className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          txType === type 
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                            : (isDark ? "bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Debit/Credit Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className={`w-full py-2.5 pl-8 pr-4 text-sm font-semibold rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/40 ${
                        isDark ? "bg-slate-950 border-slate-855 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                {/* Entry Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Description Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bulk sale of Brass fittings"
                    value={txTitle}
                    onChange={(e) => setTxTitle(e.target.value)}
                    className={`w-full py-2.5 px-4 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/40 ${
                      isDark ? "bg-slate-950 border-slate-855 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                {/* Category & Payment Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Category</label>
                    <select
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className={`w-full py-2.5 px-3 text-xs rounded-xl border outline-none ${
                        isDark ? "bg-slate-955 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    >
                      <option value="Hardware">Hardware</option>
                      <option value="Cables">Cables</option>
                      <option value="Consumables">Consumables</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Fuel & Travel">Fuel & Travel</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Payment Method</label>
                    <select
                      value={txPayment}
                      onChange={(e) => setTxPayment(e.target.value as any)}
                      className={`w-full py-2.5 px-3 text-xs rounded-xl border outline-none ${
                        isDark ? "bg-slate-955 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank">Bank Deposit</option>
                      <option value="Mobile Pay">Mobile Pay</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`flex-1 py-3 text-center text-xs font-bold rounded-xl border ${
                      isDark ? "border-slate-800 text-slate-400 hover:text-slate-200" : "border-slate-200 text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer outline-none shadow-md shadow-blue-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Commit Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentGateway && (
          <PaymentGateway
            amount={outstandingPayments}
            isOpen={showPaymentGateway}
            onClose={() => setShowPaymentGateway(false)}
            isDark={isDark}
            onPaymentSuccess={(details) => {
              onAddTransaction({
                title: `Customer Recpt: ${details.customerName} (${details.paymentId})`,
                amount: details.amount,
                type: "sale",
                category: "Hardware",
                paymentMethod: details.paymentMethod === "UPI" || details.paymentMethod === "Wallets" ? "Mobile Pay" : "Bank"
              });
              setShowPaymentGateway(false);
            }}
            onAddLog={onAddLog}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
