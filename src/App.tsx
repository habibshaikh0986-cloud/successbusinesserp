import { useState, useEffect } from "react";
import { 
  Menu, Moon, Sun, Smartphone, Chrome, Info, KeyRound, 
  BookOpen, Terminal, CheckCircle2, RefreshCcw, ShieldAlert,
  ArrowRight, FolderHeart, LayoutGrid, Package, Receipt,
  History, LogOut, Check, Hammer, ShoppingBag, BarChart4, Users, X, Briefcase, Settings
} from "lucide-react";
import CodeExplorer from "./components/CodeExplorer";
import DashboardView from "./components/DashboardView";
import CustomersView from "./components/CustomersView";
import SalesView from "./components/SalesView";
import PurchaseView from "./components/PurchaseView";
import InventoryView from "./components/InventoryView";
import ReportsView from "./components/ReportsView";
import AuthView from "./components/AuthView";
import SettingsView from "./components/SettingsView";
import { UserRole, TransactionModel, ProductModel, SystemLogModel, UserModel } from "./types";
import { initialProducts, initialTransactions, initialLogs } from "./mockData";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Theme and UI panel modes
  const [isMobileDark, setIsMobileDark] = useState(false);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot" | "pin" | "otp" | "verifyEmail">("login");
  
  // Registered dynamic user accounts database
  const [registeredUsers, setRegisteredUsers] = useState<UserModel[]>(() => {
    const defaultUsers = [
      {
        uid: "user-habib-admin",
        email: "habibshaikh0986@gmail.com",
        name: "Habib Shaikh",
        role: "admin",
        phoneNumber: "9973214998",
        isEmailVerified: true,
        password: "admin",
        isApproved: true
      },
      {
        uid: "user-default-admin",
        email: "admin@success-erp.com",
        name: "Alexander Sterling",
        role: "admin",
        phoneNumber: "+91 98765 43210",
        isEmailVerified: true,
        password: "admin",
        isApproved: true
      },
      {
        uid: "user-default-accountant",
        email: "alex.wong@success-erp.com",
        name: "Alex Wong",
        role: "accountant",
        phoneNumber: "+91 97654 32109",
        isEmailVerified: true,
        password: "123",
        isApproved: true
      },
      {
        uid: "user-default-general",
        email: "general.user@success-erp.com",
        name: "Marcus Lane",
        role: "general",
        phoneNumber: "+91 96543 21098",
        isEmailVerified: true,
        password: "general",
        isApproved: true
      }
    ];

    const saved = localStorage.getItem("success_erp_users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          // Check if Habib is missing from the list and inject him in localStorage-supported sessions too
          const hasHabib = parsed.some(u => u.email.toLowerCase() === "habibshaikh0986@gmail.com");
          if (!hasHabib) {
            parsed.push({
              uid: "user-habib-admin",
              email: "habibshaikh0986@gmail.com",
              name: "Habib Shaikh",
              role: "admin",
              phoneNumber: "9973214998",
              isEmailVerified: true,
              password: "admin",
              isApproved: true
            });
          }
          return parsed;
        }
      } catch (e) {
        // fail-safe
      }
    }
    return defaultUsers;
  });

  useEffect(() => {
    localStorage.setItem("success_erp_users", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Authenticated account details
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [userName, setUserName] = useState("Habib Shaikh");
  const [userEmail, setUserEmail] = useState("habibshaikh0986@gmail.com");
  const [workPhone, setWorkPhone] = useState("9973214998");
  const [businessName, setBusinessName] = useState("Success ERP Solution");
  const [gstNo, setGstNo] = useState("10ABH5006541");
  const [businessAddress, setBusinessAddress] = useState("DHAKA MOTIHARI (BIHAR)- 845418");
  
  // Live dynamic database states
  const [products, setProducts] = useState<ProductModel[]>(initialProducts);
  const [transactions, setTransactions] = useState<TransactionModel[]>(initialTransactions);
  const [systemLogs, setSystemLogs] = useState<SystemLogModel[]>(initialLogs);
  
  // Active screen routes: "dashboard" | "customers" | "sales" | "purchase" | "inventory" | "reports" | "settings"
  const [activeScreen, setActiveScreen] = useState<"dashboard" | "customers" | "sales" | "purchase" | "inventory" | "reports" | "settings">("dashboard");
  
  // Navigation drawer menu visible inside the mobile layout
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
    handleAddLog("POST_TRANSACTION", `Logged successfully ₹${newTx.amount} [${newTx.type.toUpperCase()}] Ref: ${refNum}`);

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

    // If it's a sale, detect target item name and quantity, then decrement its stock!
    if (newTx.type === "sale") {
      // Format of sale title: `Sale - ${productName} (x${qty}) to ${client}`
      const match = newTx.title.match(/Sale\s*-\s*(.*?)\s*\(x(\d+)\)\s*to/i);
      if (match) {
        const prodNameFromTitle = match[1].trim();
        const saleQty = parseInt(match[2]) || 1;
        setProducts((items) =>
          items.map((prod) => {
            if (prod.name.toLowerCase() === prodNameFromTitle.toLowerCase()) {
              return {
                ...prod,
                currentStock: Math.max(0, prod.currentStock - saleQty)
              };
            }
            return prod;
          })
        );
      }
    }

    return tx;
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

  // Quick price adjustment tool (Admin/Accountant Only)
  const handleUpdatePrice = (id: string, newRetail: number) => {
    setProducts((items) => 
      items.map((prod) => {
        if (prod.id === id) {
          handleAddLog("PRICING_MATRIX_ALTERED", `Retail price for SKU: ${prod.sku} shifted to ₹${newRetail}`);
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
    <div className={`h-screen w-screen font-sans flex flex-col overflow-hidden transition-all duration-300 border-4 sm:border-8 [box-sizing:border-box] relative ${
      isMobileDark 
        ? "bg-slate-950 text-slate-100 dark border-slate-900/90" 
        : "bg-slate-50 text-slate-900 border-slate-300/80"
    }`}>
      {/* Conditional rendering for Authenticated vs Unauthenticated (myBillBook styled landing page) */}
      {!isAuthenticated ? (
        <div id="unauthenticated-landing" className="flex-1 flex flex-col overflow-y-auto bg-slate-50 text-slate-800">
          
          {/* Promotional Top Banner (Gradient style like myBillBook screenshot) */}
          <div className="bg-gradient-to-r from-violet-600 via-pink-500 to-amber-400 text-white text-xs py-2 px-4 font-black text-center flex items-center justify-center gap-2 shrink-0 select-none shadow-xs">
            <span>Save upto 65% today</span>
            <span className="opacity-45">|</span>
            <a 
              href="#credentials-panel" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("credentials-panel")?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="underline hover:text-amber-100 flex items-center gap-1 font-bold"
            >
              <span>Book 1:1 Demo</span>
              <ArrowRight className="w-3 h-3 inline animate-pulse" />
            </a>
          </div>

          {/* Landing Header with custom red/orange plane logo */}
          <header className={`sticky top-0 z-40 px-4 sm:px-6 py-3.5 border-b shadow-xs transition-colors duration-200 ${
            isMobileDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              
              {/* Logo pairing with direct visual resemblance */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white transform -rotate-12 shadow-sm shadow-orange-500/30">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-45">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </div>
                <div className="flex items-baseline">
                  <span className={`font-black text-xl sm:text-2xl tracking-tighter ${
                    isMobileDark ? "text-slate-100" : "text-slate-900"
                  }`}>Success</span>
                  <span className="text-orange-500 font-black text-xl sm:text-2xl tracking-tighter ml-1.5">Business</span>
                  <span className="text-[9px] ml-2 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 font-mono font-bold uppercase tracking-widest hidden xs:inline-block">
                    PRO SUITE
                  </span>
                </div>
              </div>

              {/* Theme toggle and quick metrics indicators */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileDark(!isMobileDark)} 
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isMobileDark 
                      ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750" 
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                  title="Toggle Display Theme Mode"
                >
                  {isMobileDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-[10px] text-emerald-500 font-black uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span>Demo Sandbox Up</span>
                </div>
              </div>

            </div>

            {/* Quick-Access Responsive Menu Bar on Front Page / Landing Layout */}
            <div className={`mt-3 pt-2.5 border-t flex flex-col xs:flex-row xs:items-center justify-between overflow-x-auto scrollbar-none gap-2 ${
              isMobileDark ? "border-slate-800" : "border-slate-250/60"
            }`}>
              <div className="flex items-center gap-1 text-[10px] uppercase font-black lg:font-bold tracking-wider text-slate-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                </span>
                <span>Active Menu Bar:</span>
              </div>
              <nav className="flex items-center gap-1 md:gap-2.5 min-w-max overflow-x-auto">
                {[
                  { id: "dashboard", label: "Dashboard Hub", icon: LayoutGrid, color: "text-blue-500", bgHover: "hover:bg-blue-500/10 hover:text-blue-500" },
                  { id: "customers", label: "Clients Ledger", icon: Users, color: "text-rose-500", bgHover: "hover:bg-rose-500/10 hover:text-rose-500" },
                  { id: "sales", label: "Sales Channels", icon: Receipt, color: "text-emerald-500", bgHover: "hover:bg-emerald-500/10 hover:text-emerald-500" },
                  { id: "purchase", label: "Vendor Procurement", icon: ShoppingBag, color: "text-indigo-500", bgHover: "hover:bg-indigo-500/10 hover:text-indigo-500" },
                  { id: "inventory", label: "Stocks Registry", icon: Package, color: "text-purple-500", bgHover: "hover:bg-purple-500/10 hover:text-purple-500" },
                  { id: "reports", label: "Reports & Statement", icon: BarChart4, color: "text-teal-500", bgHover: "hover:bg-teal-500/10 hover:text-teal-500" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIsAuthenticated(true);
                        setActiveScreen(item.id as any);
                        handleAddLog("QUICK_ACCESS", `Bypassed gateway to direct route: ${item.label.toUpperCase()}`);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-transparent transition-all ${
                        isMobileDark 
                          ? "text-slate-400 hover:border-slate-800 hover:bg-slate-800/50" 
                          : "text-slate-600 hover:border-slate-200/85 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </header>

          {/* Interactive Split Main Panel */}
          <div className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
            isMobileDark ? "text-slate-100" : "text-slate-800"
          }`}>
            
            {/* Left Hand Marketing Block resembling custom design from the image */}
            <div className="lg:col-span-7 rounded-[32px] overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 text-white p-6 sm:p-10 shadow-2xl relative border border-blue-900/60 flex flex-col justify-between min-h-[480px]">
              
              {/* Abstract overlay shapes */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent)] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-13 space-y-6">
                
                {/* Visual Label */}
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-sky-300 bg-sky-500/15 border border-sky-400/25 px-3 py-1 rounded-full inline-block">
                  #1 Indian Billing & Inventory Portal
                </span>

                {/* Primary bold headline */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-slate-100">
                  Best GST Billing Software for Small Businesses in India
                </h2>

                {/* Green tick items block */}
                <div className="space-y-4 pt-2">
                  {[
                    "Create GST bill in 8 seconds",
                    "Increase stock rotation by 2.8x faster",
                    "Collect 97% payments on time"
                  ].map((benefitText, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-6.5 w-6.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                        <Check className="w-4 h-4 stroke-[3.5]" />
                      </div>
                      <span className="text-sm sm:text-base font-extrabold text-slate-200">{benefitText}</span>
                    </div>
                  ))}
                </div>

                {/* Display Orange Book Free Demo Button */}
                <div className="pt-4">
                  <button 
                    onClick={() => {
                      document.getElementById("credentials-panel")?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-4 rounded-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-center text-sm sm:text-base shadow-lg shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 duration-200 cursor-pointer"
                  >
                    Book Free Demo
                  </button>
                </div>

              </div>

              {/* Bottom horizontal alignment: Download ratings + WhatsApp badge */}
              <div className="relative z-13 pt-8 mt-8 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
                
                {/* Download App rating description item */}
                <div className="flex items-center gap-3 bg-slate-950/45 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-md">
                  <div className="w-8.5 h-8.5 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08.2.1.29.1.88 0 1.95-.56 2.52-1.43z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">App Store</span>
                    <p className="text-xs font-black text-white leading-none">4.6+ Product Rating</p>
                  </div>
                </div>

                {/* WhatsApp Help Desk simulation button */}
                <a 
                  href="https://wa.me/#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 transition-colors backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-400/20 shadow-lg text-white font-extrabold text-xs cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.263 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.722-1.458L0 24zm5.835-3.376l.322.19c1.611.956 3.486 1.46 5.395 1.461 5.485 0 9.948-4.462 9.951-9.95.002-2.659-1.033-5.158-2.914-7.042C16.37 3.398 13.8 2.361 11.141 2.36c-5.488 0-9.953 4.463-9.956 9.952-.001 1.995.522 3.943 1.514 5.656l.216.375-1.0 3.65 3.738-.981l.36.214z" />
                  </svg>
                  <span>Chat with us</span>
                </a>

              </div>

            </div>

            {/* Right Hand Interactive Form Column */}
            <div id="credentials-panel" className="lg:col-span-5 flex justify-center py-4">
              <div className={`w-full max-w-sm p-6 rounded-[32px] shadow-2xl border transition-all duration-300 ${
                isMobileDark ? "bg-slate-900 border-slate-800 text-white shadow-slate-950/45" : "bg-white border-slate-150 text-slate-800 shadow-slate-200/40"
              }`}>
                
                {/* Segment prompt */}
                <div className="text-center pb-3.5 mb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                  <span className="text-[9px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full font-black uppercase tracking-widest inline-block">
                    PRO GATEWAY ACCESS
                  </span>
                  <p className="text-xs font-bold text-slate-400 mt-2">
                    Join over 10 Lakh businesses. Select registration mode or sign in block form below.
                  </p>
                </div>

                <AuthView 
                  onLoginSuccess={(role, name, email, phone) => {
                    setUserRole(role);
                    setUserName(name || "Authorized Partner");
                    if (email) setUserEmail(email);
                    if (phone) setWorkPhone(phone);
                    setIsAuthenticated(true);
                    handleAddLog("AUTHENTICATION_GRANTED", `Acting bounds verified as role: ${role.toUpperCase()}`);
                  }}
                  isDark={isMobileDark}
                  onAddLog={handleAddLog}
                  authMode={authMode}
                  setAuthMode={setAuthMode}
                  registeredUsers={registeredUsers}
                  onRegisterUser={(newUser) => {
                    setRegisteredUsers((prev) => [...prev, newUser]);
                  }}
                />
              </div>
            </div>

          </div>

          {/* Social Proof trust badges */}
          <section className={`py-8 text-center border-t border-dashed transition-colors duration-200 mt-auto ${
            isMobileDark ? "bg-slate-900/40 border-slate-800" : "bg-slate-100/60 border-slate-200"
          }`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Trusted By over 10 Lakh MSMEs across India
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mt-4 text-[11px] sm:text-xs font-black text-slate-500">
              <span className="flex items-center gap-1.5 font-bold"><Check className="w-4 h-4 text-emerald-500 stroke-[3]" /> GST Compliant Billing</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 hidden md:inline"></span>
              <span className="flex items-center gap-1.5 font-bold"><Check className="w-4 h-4 text-emerald-500 stroke-[3]" /> 100% Safe & Secure</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 hidden md:inline"></span>
              <span className="flex items-center gap-1.5 font-bold"><Check className="w-4 h-4 text-emerald-500 stroke-[3]" /> Real-time Stock Sync</span>
            </div>
          </section>

          {/* Custom Landing Page persistent footer */}
          <footer className={`text-center py-4 border-t text-[10px] font-mono shrink-0 ${
            isMobileDark ? "bg-slate-950/80 border-slate-900 text-slate-500" : "bg-slate-50/90 border-slate-150 text-slate-400"
          }`}>
            © 2026 Success Business Platform. All Rights Reserved. Crafted for Small Business LEDGER.
          </footer>

        </div>
      ) : (
        <>
          {/* Top Professional Portal Header (Optimized with Live Metrics, Responsive for Desktop & Mobile) */}
          <header className={`border-b transition-all duration-300 shrink-0 shadow-sm relative z-25 ${
            isMobileDark 
              ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/20" 
              : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col gap-3">
              
              {/* Main Top Row */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                
                {/* Branding Container */}
                <div className="flex items-center justify-between md:justify-start gap-3">
                  <div className="flex items-center gap-3">
                    {/* Dynamic Brand Logo */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-rose-500 rounded-xl blur-xs opacity-60 group-hover:opacity-100 transition duration-500"></div>
                      <div className="relative w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden p-1">
                        <img 
                          src="/src/assets/images/success_logo_1782065863976.jpg" 
                          referrerPolicy="no-referrer"
                          alt="Success Logo" 
                          className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <h1 className="text-base sm:text-lg font-black tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-blue-600 dark:text-sky-400">Success Business</span>
                        <span className="hidden xs:inline-block text-[8px] bg-sky-500/15 text-sky-400 dark:text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest font-black">
                          V3.5 Live
                        </span>
                      </h1>
                      {isAuthenticated && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wide mt-0.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span>User: {userName}</span>
                          <span className="opacity-40">|</span>
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 uppercase tracking-wider">{userRole}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Clock & Status */}
                  <div className="flex items-center gap-2 md:hidden">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-850 text-slate-400">
                      {systemTime || "12:00"}
                    </span>
                  </div>
                </div>

                {/* Quick Live Visual Summary KPIs (Only shown when Authenticated) */}
                {isAuthenticated && (
                  <div className="hidden xs:flex flex-wrap items-center gap-4 bg-slate-500/5 dark:bg-slate-100/5 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 max-w-max">
                    {/* KPI 1: Live Revenue Flow Balance */}
                    <div className="px-3 py-1">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Net Cash Fluidity</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-500">
                        ${(
                          transactions.filter(t => t.type === "sale").reduce((sum, t) => sum + t.amount, 0) -
                          transactions.filter(t => t.type !== "sale").reduce((sum, t) => sum + t.amount, 0)
                        ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* KPIDivider */}
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-800 hidden md:block"></div>

                    {/* KPI 2: Live Low Stock Alert indicator */}
                    <div className="hidden md:block px-3 py-1">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Depleted Inventory SKUs</span>
                      <span className={`text-xs font-extrabold flex items-center gap-1.5 ${
                        products.filter(p => p.currentStock <= p.minStockCount).length > 0 ? "text-yellow-500" : "text-emerald-400"
                      }`}>
                        {products.filter(p => p.currentStock <= p.minStockCount).length > 0 ? (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
                            <span>{products.filter(p => p.currentStock <= p.minStockCount).length} items low</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>All Safe</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* KPIDivider */}
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-800"></div>

                    {/* KPI 3: Sync Pill */}
                    <div className="px-3 py-1 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Synced</span>
                    </div>
                  </div>
                )}

                {/* Quick Header Widgets & System Options */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Active User:</span>
                    <select
                      value={userRole}
                      onChange={(e) => {
                        const selectedRole = e.target.value as UserRole;
                        setUserRole(selectedRole);
                        let tempName = "Alexander Sterling";
                        if (selectedRole === "accountant") tempName = "Alex Wong";
                        else if (selectedRole === "general") tempName = "Marcus Lane";
                        setUserName(tempName);
                        handleAddLog("ROLE_OVERRIDE", `Changed simulated credentials to ${selectedRole.toUpperCase()}`);
                      }}
                      className={`py-1 px-2 rounded-xl text-xs font-bold outline-none border cursor-pointer transition-all ${
                        isMobileDark ? "bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600" : "bg-slate-100 border-slate-200 text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <option value="admin">Alexander (Admin)</option>
                      <option value="accountant">Alex (Accountant)</option>
                      <option value="general">Marcus (General)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 self-end ml-auto sm:ml-0">
                    <button
                      onClick={() => setIsMobileDark(!isMobileDark)}
                      className={`p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer outline-none transition-all ${
                        isMobileDark ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
                      }`}
                      title="Toggle Light or Dark interface modes"
                    >
                      {isMobileDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setShowSourceCode(!showSourceCode)}
                      className={`p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer outline-none transition-all ${
                        showSourceCode 
                          ? "bg-cyan-600 border-cyan-500 text-white shadow-xs" 
                          : (isMobileDark ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-400" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-cyan-600")
                      }`}
                      title="Toggle Developer Source Code panel"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline text-xs font-semibold">Sources</span>
                    </button>

                    {isAuthenticated && (
                      <button 
                        onClick={handleLoggedOut}
                        className="p-2 px-3 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all outline-none cursor-pointer"
                        title="Terminate current session state safely"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Logout</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
              
              {/* Top Navigation Menu Bar */}
              {isAuthenticated && (
                <div id="top-navigation-menu" className={`mt-2 pt-2 border-t flex items-center justify-between overflow-x-auto scrollbar-none gap-2 ${
                  isMobileDark ? "border-slate-850" : "border-slate-200"
                }`}>
                  <nav className="flex items-center gap-1.5 sm:gap-2.5 min-w-max pb-1 sm:pb-0">
                    {[
                      { id: "dashboard", label: "Dashboard Hub", icon: LayoutGrid, color: "text-blue-500", bgActive: "bg-blue-600/10 dark:bg-sky-500/10 text-blue-600 dark:text-sky-300 border-blue-600/20" },
                      { id: "customers", label: "Clients Ledger", icon: Users, color: "text-rose-500", bgActive: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
                      { id: "sales", label: "Sales Channels", icon: Receipt, color: "text-emerald-500", bgActive: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
                      { id: "purchase", label: "Vendor Procurement", icon: ShoppingBag, color: "text-indigo-500", bgActive: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
                      { id: "inventory", label: "Stocks Registry", icon: Package, color: "text-purple-500", bgActive: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
                      { id: "reports", label: "Reports & Statement", icon: BarChart4, color: "text-teal-500", bgActive: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
                      { id: "settings", label: "Profile & Settings", icon: Settings, color: "text-indigo-500", bgActive: "bg-amber-600/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-350 border-amber-500/20" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeScreen === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveScreen(item.id as any);
                            handleAddLog("NAVIGATE", `Switched screen view to ${item.label.toUpperCase()}`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border transition-all ${
                            isActive 
                              ? `${item.bgActive} border-semibold font-extrabold`
                              : (isMobileDark 
                                  ? "border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800" 
                                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : "opacity-70"}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                  
                  <div className="hidden lg:flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Workspace Access Active</span>
                  </div>
                </div>
              )}

            </div>
          </header>

          {/* Realtime Action Logs Floating Banner Toast (Global screen banner) */}
          <AnimatePresence>
            {latestLogNofitication && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-20 right-6 bg-slate-900/95 border border-blue-900/40 text-slate-200 text-[11px] rounded-2xl p-3.5 shadow-xl z-55 flex items-start gap-3 max-w-sm backdrop-blur-md"
              >
                <div className="p-1.5 rounded-xl bg-blue-500/10 text-cyan-400">
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-200 flex items-center justify-between">
                    <span>Secure Broadcast Queue</span>
                    <span className="text-[9px] text-emerald-400 font-mono">Sync Active</span>
                  </div>
                  <p className="text-slate-400 mt-1 leading-snug">{latestLogNofitication}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main double panel Workspace */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {/* AUTHENTICATED WORKSPACE CONTAINER */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* DYNAMIC CONTENT CONTAINER WRAPPER */}
              <main className={`flex-1 flex flex-col min-w-0 overflow-y-auto relative ${
                isMobileDark ? "bg-slate-950" : "bg-slate-50"
              }`}>
                
                {/* CURRENT MAIN ACTIVE CONTENT */}
                <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pb-6 sm:pb-8">
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
                      onNavigate={setActiveScreen}
                    />
                  )}

                {activeScreen === "customers" && (
                  <CustomersView
                    isDark={isMobileDark}
                    onAddLog={handleAddLog}
                    userRole={userRole}
                    userName={userName}
                    businessName={businessName}
                    gstNo={gstNo}
                    businessAddress={businessAddress}
                    workPhone={workPhone}
                  />
                )}

                {activeScreen === "sales" && (
                  <SalesView
                    products={products}
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                    isDark={isMobileDark}
                    onAddLog={handleAddLog}
                    userRole={userRole}
                    businessName={businessName}
                    gstNo={gstNo}
                    businessAddress={businessAddress}
                    workPhone={workPhone}
                  />
                )}

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

                {activeScreen === "reports" && (
                  <ReportsView
                    products={products}
                    transactions={transactions}
                    isDark={isMobileDark}
                    onAddLog={handleAddLog}
                    userRole={userRole}
                  />
                )}

                {activeScreen === "settings" && (
                  <SettingsView
                    isDark={isMobileDark}
                    onAddLog={handleAddLog}
                    userName={userName}
                    setUserName={setUserName}
                    userRole={userRole}
                    setUserRole={setUserRole}
                    userEmail={userEmail}
                    setUserEmail={setUserEmail}
                    workPhone={workPhone}
                    setWorkPhone={setWorkPhone}
                    businessName={businessName}
                    setBusinessName={setBusinessName}
                    gstNo={gstNo}
                    setGstNo={setGstNo}
                    businessAddress={businessAddress}
                    setBusinessAddress={setBusinessAddress}
                    registeredUsers={registeredUsers}
                    onApproveUser={(uid) => {
                      setRegisteredUsers((prev) => 
                        prev.map((u) => u.uid === uid ? { ...u, isApproved: true } : u)
                      );
                      const target = registeredUsers.find(u => u.uid === uid);
                      if (target) {
                        handleAddLog("USER_AUTHORIZED", `Approved ERP access limits for user: ${target.name} (${target.role.toUpperCase()})`);
                      }
                    }}
                    onDeleteUser={(uid) => {
                      const target = registeredUsers.find(u => u.uid === uid);
                      setRegisteredUsers((prev) => prev.filter((u) => u.uid !== uid));
                      if (target) {
                        handleAddLog("USER_ACCESS_TERMINATED", `De-authorized system profile for ${target.name}`);
                      }
                    }}
                  />
                )}
              </div>

            </main>
          </div>

        {/* PERSISTENT SLIDING SOURCE CODE EXPLORER PANEL */}
        <AnimatePresence>
          {showSourceCode && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "380px" }}
              exit={{ opacity: 0, width: 0 }}
              className={`hidden lg:flex flex-col border-l shrink-0 h-full p-4 relative z-40 transition-colors duration-300 ${
                isMobileDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-600" />
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">
                    Flutter ERP Code Tree
                  </span>
                </div>
                <button 
                  onClick={() => setShowSourceCode(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live interactive mock source directory viewer */}
              <div className="flex-1 overflow-hidden">
                <CodeExplorer />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        </>
      )}



      {/* Persistent global footer */}
      <footer className={`border-t py-3 px-6 shrink-0 ${
        isMobileDark ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-white border-slate-200 text-slate-400"
      }`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between text-[11px] font-mono gap-2">
          <span>Success Business Sandbox • Built for Netlify Deployments</span>
          <div className="flex gap-4">
            <span>PORT: 3000 (HTTPS SECURED)</span>
            <span>•</span>
            <span>Status: STABLE INGRESS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
