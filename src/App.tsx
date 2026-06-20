import React, { useState, useEffect } from "react";
import { 
  Menu, Moon, Sun, Smartphone, Chrome, Info, KeyRound, 
  BookOpen, Terminal, CheckCircle2, RefreshCcw, ShieldAlert,
  ArrowRight, FolderHeart, LayoutGrid, Package, Receipt,
  History, LogOut, Check, Hammer, ShoppingBag, BarChart4, Users
} from "lucide-react";
import CodeExplorer from "./components/CodeExplorer";
import DashboardView from "./components/DashboardView";
import CustomersView from "./components/CustomersView";
import SalesView from "./components/SalesView";
import PurchaseView from "./components/PurchaseView";
import InventoryView from "./components/InventoryView";
import ReportsView from "./components/ReportsView";
import AuthView from "./components/AuthView";
import { UserRole, TransactionModel, ProductModel, SystemLogModel } from "./types";
import { initialProducts, initialTransactions, initialLogs } from "./mockData";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Mobile device system states
  const [isMobileDark, setIsMobileDark] = useState(true);
  const [isSimulatorFullscreen, setIsSimulatorFullscreen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Authenticated account details
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [userName, setUserName] = useState("Alexander Sterling");
  
  // Live dynamic database states
  const [products, setProducts] = useState<ProductModel[]>(initialProducts);
  const [transactions, setTransactions] = useState<TransactionModel[]>(initialTransactions);
  const [systemLogs, setSystemLogs] = useState<SystemLogModel[]>(initialLogs);
  
  // Active screen routes on the simulated mobile device
  // "dashboard" | "customers" | "sales" | "purchase" | "inventory" | "reports"
  const [activeScreen, setActiveScreen] = useState<"dashboard" | "customers" | "sales" | "purchase" | "inventory" | "reports">("dashboard");
  
  // Navigation drawer menu visible inside the mobile bezel
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Simulated digital mobile system clock
  const [systemTime, setSystemTime] = useState("");

  // Search/Filter states inside inventory/transaction sub-screens
  const [inventorySearch, setInventorySearch] = useState("");
  const [transactionsSearch, setTransactionsSearch] = useState("");

  // Quick state logs notification banner
  const [latestLogNofitication, setLatestLogNotification] = useState<string | null>(null);

  useEffect(() => {
    // Generate simulated clock ticking
    const updateClock = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 15000);
    return () => clearInterval(interval);
  }, []);

  // Database helpers
  const handleAddLog = (action: string, details: string) => {
    const newLog: SystemLogModel = {
      id: `log-${Date.now()}`,
      action,
      details,
      role: userRole,
      timestamp: new Date().toISOString(),
    };
    setSystemLogs((prev) => [newLog, ...prev]);
    
    // Toast notification inside the bezel
    setLatestLogNotification(`${action}: ${details}`);
    setTimeout(() => {
      setLatestLogNotification(null);
    }, 4500);
  };

  const handleAddTransaction = (newTx: { title: string; amount: number; type: "sale" | "purchase" | "expense"; category: string; paymentMethod: "Cash" | "Bank" | "Mobile Pay" }) => {
    const refNum = newTx.type === "sale" 
      ? `INV-2026-${Math.floor(Math.random() * 900) + 100}` 
      : newTx.type === "purchase"
        ? `PO-4000-${Math.floor(Math.random() * 900) + 100}`
        : `EXP-GEN-${Math.floor(Math.random() * 900) + 100}`;

    const tx: TransactionModel = {
      id: `tx-${Date.now()}`,
      title: newTx.title,
      amount: newTx.amount,
      type: newTx.type,
      category: newTx.category,
      timestamp: new Date().toISOString(),
      referenceNumber: refNum,
      loggedBy: `${userName} (${userRole.toUpperCase()})`,
      paymentMethod: newTx.paymentMethod,
    };

    setTransactions((prev) => [tx, ...prev]);
    handleAddLog("POST_TRANSACTION", `Logged successfully $${newTx.amount} [${newTx.type.toUpperCase()}] Ref: ${refNum}`);

    // If it's a purchase, let's automatically top-up stock values of category matching products for visual cohesion!
    if (newTx.type === "purchase") {
      setProducts((items) => 
        items.map((prod) => {
          if (prod.category.toLowerCase() === newTx.category.toLowerCase()) {
            return {
              ...prod,
              currentStock: prod.currentStock + 5
            };
          }
          return prod;
        })
      );
    }
  };

  const handleReplenishStock = (id: string, qty: number) => {
    setProducts((items) => 
      items.map((prod) => {
        if (prod.id === id) {
          handleAddLog("INVENTORY_UPDATE", `Procurement fulfilled for SKU: ${prod.sku}. Stock increased by +${qty}.`);
          return {
            ...prod,
            currentStock: prod.currentStock + qty
          };
        }
        return prod;
      })
    );
  };

  // Quick price adjustment tool (Manager/Admin Only)
  const handleUpdatePrice = (id: string, newRetail: number) => {
    if (userRole === "staff" || userRole === "accounting") {
      alert("Permission Blocked: Only Administrator or Manager details override price matrices!");
      return;
    }
    setProducts((items) => 
      items.map((prod) => {
        if (prod.id === id) {
          handleAddLog("PRICING_MATRIX_ALTERED", `Retail price for SKU: ${prod.sku} shifted to $${newRetail}`);
          return {
            ...prod,
            retailPrice: newRetail
          };
        }
        return prod;
      })
    );
  };

  const handleAddProduct = (newProd: Omit<ProductModel, "id">) => {
    const prod: ProductModel = {
      id: `prod-${Date.now()}`,
      ...newProd
    };
    setProducts((prev) => [prod, ...prev]);
  };

  const handleLoggedOut = () => {
    handleAddLog("LOGOUT_SUCCESS", `Logged out from role session bounds`);
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      {/* Top Professional Portal Header (Desktop layout option) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <RefreshCcw className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              Success Business Accounting ERP
              <span className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-650 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider transition-colors">
                Mobile Sandbox Preview
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Enterprise Resource Planning & Database Architecture Pipeline | Double-Pane Workspace
            </p>
          </div>
        </div>
        
        {/* Quick Help & Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono font-medium border border-slate-100 bg-slate-50/50 p-2 px-3 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Firebase Emulator: Connected</span>
          </div>
          <div className="text-slate-300">|</div>
          <div className="flex items-center gap-1 text-slate-600">
            <Smartphone className="w-3.5 h-3.5 text-blue-500" />
            <span>M3 Client Emulator View</span>
          </div>
        </div>
      </header>

      {/* Main double panel Workspace */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:items-stretch overflow-hidden min-h-0">
        
        {/* PANE 1: Interactive Android Emulator Wrapper (60%) */}
        <div className={`transition-all duration-300 flex flex-col justify-start items-center relative ${
          isSimulatorFullscreen ? "lg:w-full" : "lg:w-[48%] xl:w-[44%]"
        } flex-shrink-0`}>
          
          <div className="w-full flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
                Android Device Simulator
              </span>
            </div>
            
            {/* View Controlls */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsMobileDark(!isMobileDark)}
                className="p-1 px-2 text-[11px] font-medium border border-slate-200 bg-white hover:bg-slate-50 rounded-lg flex items-center gap-1.5 cursor-pointer outline-none transition-colors"
                title="Toggle Bezel Light/Dark Theme"
              >
                {isMobileDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Bezel Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bezel Dark</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsSimulatorFullscreen(!isSimulatorFullscreen)}
                className="hidden lg:flex p-1 px-2 text-[11px] font-medium border border-slate-200 bg-white hover:bg-slate-50 rounded-lg items-center gap-1.5 cursor-pointer outline-none transition-colors animate-pulse"
              >
                <Hammer className="w-3.5 h-3.5 text-purple-600" />
                <span>{isSimulatorFullscreen ? "Show Code Pane" : "Fullscreen Bezel"}</span>
              </button>
            </div>
          </div>

          {/* REALISTIC ANDROID DEVICE BODY BEZEL */}
          <div className="relative w-full max-w-[390px] h-[780px] bg-slate-950 border-12 border-slate-900 rounded-[44px] shadow-2xl flex flex-col overflow-hidden ring-4 ring-slate-800/20">
            {/* Device Speaker Notch & Camera Pin */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-55 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-2" />
              <div className="w-12 h-1 bg-slate-900 rounded-full" />
            </div>

            {/* Dynamic System Status Bar (Signal, Wifi, Signal-Ratios, Clock) */}
            <div className={`pt-6 px-5 pb-2.5 flex items-center justify-between text-[11px] font-bold tracking-tight select-none z-50 ${
              isMobileDark ? "bg-slate-950 text-slate-300" : "bg-blue-600 text-white"
            }`}>
              <span className="font-mono">{systemTime || "12:00"}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase bg-white/20 px-1 py-0.5 rounded-sm">5G</span>
                <span className="w-3 h-3 border-2 border-current rounded-full flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                </span>
                <div className="w-4 h-2.5 bg-current opacity-80 rounded-[3px] border border-current flex items-center justify-start p-[1px]">
                  <div className="w-[100%] h-full bg-green-500 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Realtime Action Logs Floating Banner Toast inside the mobile viewpoint */}
            <AnimatePresence>
              {latestLogNofitication && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-14 left-3 right-3 bg-slate-900/95 border border-blue-900/40 text-slate-200 text-[10px] rounded-xl p-2.5 shadow-lg z-50 flex items-start gap-2 backdrop-blur-xs"
                >
                  <div className="p-1 rounded-md bg-blue-500/10 text-cyan-400">
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Firestore Sync Broadcast</span>
                      <span className="text-[8px] opacity-60 font-mono">Real-time</span>
                    </div>
                    <p className="text-slate-400 mt-0.5 truncate leading-tight">{latestLogNofitication}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SCREEN VIEWPORT CONTENT AREA */}
            <div className={`flex-1 overflow-hidden relative ${
              isMobileDark ? "bg-slate-905 text-slate-100" : "bg-slate-50 text-slate-900"
            }`}>
              
              {/* IF NOT AUTHENTICATED -> RENDER COMPLETE AUTH MODULE */}
              {!isAuthenticated ? (
                <AuthView 
                  onLoginSuccess={(role, name) => {
                    setUserRole(role);
                    setUserName(name);
                    setIsAuthenticated(true);
                  }}
                  isDark={isMobileDark}
                  onAddLog={handleAddLog}
                />
              ) : (
                /* AUTHENTICATED -> RENDER ACCORDING SCENE MODULE */
                <div className="h-full flex flex-col relative overflow-hidden">
                  
                  {/* APP BAR / ERP NAV HEADER */}
                  <div className={`px-4 py-3 border-b flex items-center justify-between shadow-xs ${
                    isMobileDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="p-1 cursor-pointer hover:bg-slate-850/10 rounded-lg outline-none"
                      >
                        <Menu className="w-5 h-5 text-blue-500" />
                      </button>
                      <span className="font-bold text-xs tracking-wide tracking-tight">
                        {activeScreen === "dashboard" ? "Success Dashboard" :
                         activeScreen === "customers" ? "Client Ledger Portfolio" :
                         activeScreen === "sales" ? "Direct Corporate Sales Suite" :
                         activeScreen === "purchase" ? "Procurement & Vendor Orders" :
                         activeScreen === "inventory" ? "Warehouse Stock Registry" : "Statement Analytics & Compliance"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-bold font-mono tracking-wide uppercase text-slate-400">
                        {userRole}
                      </span>
                    </div>
                  </div>

                  {/* ACTIVE VIEW SWAPPER ENAMELED */}
                  <div className="flex-1 overflow-hidden relative">
                    
                    {/* VIEW A: DASHBOARD VIEW */}
                    {activeScreen === "dashboard" && (
                      <DashboardView 
                        userRole={userRole}
                        userName={userName}
                        transactions={transactions}
                        products={products}
                        systemLogs={systemLogs}
                        onAddTransaction={handleAddTransaction}
                        onReplenishStock={handleReplenishStock}
                        isDark={isMobileDark}
                        onAddLog={handleAddLog}
                      />
                    )}

                    {/* VIEW A_CUST: AUTOMATED CUSTOMER ACCOUNTS PORTFOLIO */}
                    {activeScreen === "customers" && (
                      <CustomersView
                        isDark={isMobileDark}
                        onAddLog={handleAddLog}
                        userRole={userRole}
                        userName={userName}
                      />
                    )}

                    {/* VIEW B: SALES VIEW */}
                    {activeScreen === "sales" && (
                      <SalesView
                        products={products}
                        transactions={transactions}
                        onAddTransaction={handleAddTransaction}
                        isDark={isMobileDark}
                        onAddLog={handleAddLog}
                        userRole={userRole}
                      />
                    )}

                    {/* VIEW C: PURCHASE VIEW */}
                    {activeScreen === "purchase" && (
                      <PurchaseView
                        products={products}
                        transactions={transactions}
                        onAddTransaction={handleAddTransaction}
                        onReplenishStock={handleReplenishStock}
                        isDark={isMobileDark}
                        onAddLog={handleAddLog}
                        userRole={userRole}
                      />
                    )}

                    {/* VIEW D: INVENTORY REGISTRY */}
                    {activeScreen === "inventory" && (
                      <InventoryView
                        products={products}
                        onReplenishStock={handleReplenishStock}
                        onUpdatePrice={handleUpdatePrice}
                        onAddProduct={handleAddProduct}
                        isDark={isMobileDark}
                        onAddLog={handleAddLog}
                        userRole={userRole}
                      />
                    )}

                    {/* VIEW E: REPORTS VIEW */}
                    {activeScreen === "reports" && (
                      <ReportsView
                        products={products}
                        transactions={transactions}
                        isDark={isMobileDark}
                        onAddLog={handleAddLog}
                        userRole={userRole}
                      />
                    )}

                  </div>

                  {/* MATERIAL 3 DESIGN BOTTOM NAVIGATION BAR */}
                  <div className={`absolute bottom-0 left-0 right-0 py-2 border-t flex justify-around items-center select-none z-50 ${
                    isMobileDark ? "bg-slate-950 border-slate-900 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    {/* NAV: Dashboard */}
                    <button
                      onClick={() => setActiveScreen("dashboard")}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer outline-none transition-all ${
                        activeScreen === "dashboard" 
                          ? "text-blue-500 font-extrabold scale-105" 
                          : "hover:text-slate-300"
                      }`}
                    >
                      <LayoutGrid className="w-4.5 h-4.5" />
                      <span className="text-[8.5px]">Dashboard</span>
                    </button>

                    {/* NAV: Customers */}
                    <button
                      onClick={() => setActiveScreen("customers")}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer outline-none transition-all ${
                        activeScreen === "customers" 
                          ? "text-rose-500 font-extrabold scale-105" 
                          : "hover:text-slate-300"
                      }`}
                    >
                      <Users className="w-4.5 h-4.5" />
                      <span className="text-[8.5px]">Customers</span>
                    </button>

                    {/* NAV: Sales */}
                    <button
                      onClick={() => setActiveScreen("sales")}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer outline-none transition-all ${
                        activeScreen === "sales" 
                          ? "text-emerald-500 font-extrabold scale-105" 
                          : "hover:text-slate-300"
                      }`}
                    >
                      <Receipt className="w-4.5 h-4.5" />
                      <span className="text-[8.5px]">Sales</span>
                    </button>

                    {/* NAV: Purchase */}
                    <button
                      onClick={() => setActiveScreen("purchase")}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer outline-none transition-all ${
                        activeScreen === "purchase" 
                          ? "text-indigo-500 font-extrabold scale-105" 
                          : "hover:text-slate-300"
                      }`}
                    >
                      <ShoppingBag className="w-4.5 h-4.5" />
                      <span className="text-[8.5px]">Purchase</span>
                    </button>

                    {/* NAV: Inventory */}
                    <button
                      onClick={() => setActiveScreen("inventory")}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer outline-none transition-all ${
                        activeScreen === "inventory" 
                          ? "text-purple-500 font-extrabold scale-105" 
                          : "hover:text-slate-300"
                      }`}
                    >
                      <Package className="w-4.5 h-4.5" />
                      <span className="text-[8.5px]">Inventory</span>
                    </button>

                    {/* NAV: Reports */}
                    <button
                      onClick={() => setActiveScreen("reports")}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer outline-none transition-all ${
                        activeScreen === "reports" 
                          ? "text-teal-500 font-extrabold scale-105" 
                          : "hover:text-slate-300"
                      }`}
                    >
                      <BarChart4 className="w-4.5 h-4.5" />
                      <span className="text-[8.5px]">Reports</span>
                    </button>
                  </div>

                  {/* SLIDING NAVIGATION DRAWER (Sliding drawer menu) */}
                  <AnimatePresence>
                    {isDrawerOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/70 z-55 flex justify-start"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: 0 }}
                          exit={{ x: "-100%" }}
                          transition={{ type: "tween", duration: 0.25 }}
                          className={`w-72 h-full p-5 flex flex-col justify-between shadow-2xl border-r ${
                            isMobileDark 
                              ? "bg-slate-900 border-slate-800 text-slate-100" 
                              : "bg-blue-800 border-blue-900 text-white"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-6">
                            {/* Profile Drawer Card */}
                            <div className={`flex items-center gap-3 pb-4 border-b ${
                              isMobileDark ? "border-slate-800" : "border-blue-700"
                            }`}>
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                                <div className="w-6 h-6 border-4 border-blue-600 rounded-sm"></div>
                              </div>
                              <div>
                                <h4 className={`text-sm font-bold font-sans tracking-tight leading-none ${
                                  isMobileDark ? "text-slate-100" : "text-white"
                                }`}>
                                  Success
                                </h4>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                  isMobileDark ? "text-blue-400" : "text-blue-200"
                                }`}>
                                  Accounting ERP
                                </span>
                              </div>
                            </div>

                            {/* Section: App Drawer routes */}
                            <div className="space-y-1.5">
                              <span className={`text-[9px] font-bold block uppercase tracking-wider mb-2 ${
                                isMobileDark ? "text-slate-500" : "text-blue-300"
                              }`}>
                                Core ERP Functions
                              </span>
                              
                              <button
                                onClick={() => { setActiveScreen("dashboard"); setIsDrawerOpen(false); }}
                                className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl flex items-center gap-3.5 outline-none transition-all cursor-pointer ${
                                  activeScreen === "dashboard" 
                                    ? (isMobileDark ? "bg-slate-800 text-white" : "bg-blue-700/75 text-white shadow-xs") 
                                    : (isMobileDark ? "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200" : "text-blue-100 hover:bg-blue-700/30")
                                }`}
                              >
                                <LayoutGrid className="w-4 h-4 opacity-80 text-blue-400" />
                                <span>Dashboard</span>
                              </button>

                              <button
                                onClick={() => { setActiveScreen("customers"); setIsDrawerOpen(false); }}
                                className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl flex items-center gap-3.5 outline-none transition-all cursor-pointer ${
                                  activeScreen === "customers" 
                                    ? (isMobileDark ? "bg-slate-800 text-white" : "bg-blue-700/75 text-white shadow-xs") 
                                    : (isMobileDark ? "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200" : "text-blue-100 hover:bg-blue-700/30")
                                }`}
                              >
                                <Users className="w-4 h-4 opacity-80 text-rose-400" />
                                <span>Customers Portfolio</span>
                              </button>

                              <button
                                onClick={() => { setActiveScreen("sales"); setIsDrawerOpen(false); }}
                                className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl flex items-center gap-3.5 outline-none transition-all cursor-pointer ${
                                  activeScreen === "sales" 
                                    ? (isMobileDark ? "bg-slate-800 text-white" : "bg-blue-700/75 text-white shadow-xs") 
                                    : (isMobileDark ? "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200" : "text-blue-100 hover:bg-blue-700/30")
                                }`}
                              >
                                <Receipt className="w-4 h-4 opacity-80 text-emerald-400" />
                                <span>Corporate Sales</span>
                              </button>
                              
                              <button
                                onClick={() => { setActiveScreen("purchase"); setIsDrawerOpen(false); }}
                                className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl flex items-center gap-3.5 outline-none transition-all cursor-pointer ${
                                  activeScreen === "purchase" 
                                    ? (isMobileDark ? "bg-slate-800 text-white" : "bg-blue-700/75 text-white shadow-xs") 
                                    : (isMobileDark ? "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200" : "text-blue-100 hover:bg-blue-700/30")
                                }`}
                              >
                                <ShoppingBag className="w-4 h-4 opacity-80 text-indigo-400" />
                                <span>Purchase Orders</span>
                              </button>
                              
                              <button
                                onClick={() => { setActiveScreen("inventory"); setIsDrawerOpen(false); }}
                                className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl flex items-center gap-3.5 outline-none transition-all cursor-pointer ${
                                  activeScreen === "inventory" 
                                    ? (isMobileDark ? "bg-slate-800 text-white" : "bg-blue-700/75 text-white shadow-xs") 
                                    : (isMobileDark ? "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200" : "text-blue-100 hover:bg-blue-700/30")
                                }`}
                              >
                                <Package className="w-4 h-4 opacity-80 text-purple-400" />
                                <span>Inventory Registry</span>
                              </button>
                              
                              <button
                                onClick={() => { setActiveScreen("reports"); setIsDrawerOpen(false); }}
                                className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl flex items-center gap-3.5 outline-none transition-all cursor-pointer ${
                                  activeScreen === "reports" 
                                    ? (isMobileDark ? "bg-slate-800 text-white" : "bg-blue-700/75 text-white shadow-xs") 
                                    : (isMobileDark ? "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200" : "text-blue-100 hover:bg-blue-700/30")
                                }`}
                              >
                                <BarChart4 className="w-4 h-4 opacity-80 text-teal-400" />
                                <span>Reports & Analytics</span>
                              </button>
                            </div>
                          </div>

                          {/* Quick Logout trigger */}
                          <div>
                            <button
                              onClick={() => { handleLoggedOut(); setIsDrawerOpen(false); }}
                              className="w-full py-2 px-3 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2.5 transition-all outline-none"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>De-authenticate Session</span>
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              )}
            </div>

            {/* Android Navigation bar (Simulated back/home/recents bottom bezel keys) */}
            <div className={`py-4 flex justify-around items-center select-none z-55 ${
              isMobileDark ? "bg-slate-950 text-slate-600" : "bg-slate-200 text-slate-500"
            }`}>
              <button onClick={() => {
                if (isAuthenticated) {
                  setIsDrawerOpen(!isDrawerOpen);
                } else {
                  alert("Emulator back button triggered.");
                }
              }} className="w-4 h-4 border-2 border-current rotate-45 hover:text-white transition-colors" />
              <button onClick={() => {
                if (isAuthenticated) {
                  setActiveScreen("dashboard");
                }
              }} className="w-4 h-4 rounded-full border-2 border-current hover:text-white transition-colors" />
              <button onClick={() => alert("Simulated Android recents menu opened.")} className="w-4 h-4 border-2 border-current rounded-xs hover:text-white transition-colors" />
            </div>

          </div>
        </div>

        {/* PANE 2: Flutter Engine Architecture Code Explorer (40% - 50%) */}
        <AnimatePresence>
          {!isSimulatorFullscreen && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex flex-col min-w-0"
            >
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-600" />
                  <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
                    Flutter ERP Production-Ready Codebase
                  </span>
                </div>
                <div className="text-[10px] bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Dart / Material 3
                </div>
              </div>

              {/* Rendering interactive browser file tree display */}
              <CodeExplorer />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Aesthetic pairing instructions footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2 mt-auto">
        <span>Success ERP Sandbox Stack • Powered by Google AI Studio Cloud Containerization</span>
        <div className="flex gap-4">
          <span>PORT: 3000 (HTTPS Ingress)</span>
          <span>•</span>
          <span>State: STABLE V1.0</span>
        </div>
      </footer>
    </div>
  );
}
