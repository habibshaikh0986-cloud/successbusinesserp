import React, { useState, useMemo } from "react";
import { 
  Users, UserPlus, Receipt, Search, Plus, Check, Filter, 
  TrendingUp, Coins, Ban, ShieldCheck, AlertCircle, Calendar, 
  TrendingDown, Send, Printer, Download, Share2, FileText, 
  Mail, UploadCloud, Bell, Wifi, WifiOff, Database, Cake, 
  Gift, Building2, FolderOpen, Info, ChevronRight, X, Sparkles, CheckCircle2
} from "lucide-react";
import { 
  CustomerModel, CustomerStatus, CustomerType, CustomerLedgerEntry, 
  CustomerCommunication, CustomerNotification, UserRole 
} from "../types";

interface CustomersViewProps {
  isDark: boolean;
  onAddLog: (action: string, details: string) => void;
  userRole: UserRole;
  userName: string;
}

// Initial Mock Customers
const initialCustomersList: CustomerModel[] = [
  {
    id: "CUST-2026-001",
    name: "Rohan Sharma",
    mobile: "9876543210",
    whatsApp: "9876543210",
    email: "rohan@sharmasteel.com",
    gstNo: "27AAAAA1111A1Z1",
    panNo: "ABCDE1234F",
    aadhaarNo: "1234-5678-9012",
    businessName: "Sharma Steel Industries",
    businessCategory: "Manufacturing & Metals",
    address: "402 Prime Corporate Tower, LBS Marg, Ghatkopar",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pinCode: "400086",
    openingBalance: 1000,
    creditLimit: 10000,
    paymentTerms: "Net 30",
    status: "Active",
    customerType: "Wholesale",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    gstCertificate: "gst_cert.pdf",
    notes: "VIP wholesale partner since 2024. Prompt payments via UPI.",
    createdAt: "2026-01-15T10:00:00Z"
  },
  {
    id: "CUST-2026-002",
    name: "Priya Patel",
    mobile: "9123456789",
    whatsApp: "9123456789",
    email: "priya@pixelelectronics.co",
    gstNo: "24BBBBB2222B2Z2",
    panNo: "FGHIJ5678K",
    aadhaarNo: "2345-6789-0123",
    businessName: "Pixel Electronics Ltd",
    businessCategory: "Consumer Electronics",
    address: "SF-8 Alpha Infotech Park, SG Highway",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    pinCode: "380054",
    openingBalance: 5000,
    creditLimit: 15000,
    paymentTerms: "Net 15",
    status: "Active",
    customerType: "Distributor",
    profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    notes: "Requires quick delivery. Dispatches with high-priority freight lanes.",
    createdAt: "2026-02-10T14:30:00Z"
  },
  {
    id: "CUST-2026-003",
    name: "Anil Kumar",
    mobile: "8888777766",
    whatsApp: "8888777766",
    email: "anil@kumarandsonstrade.com",
    gstNo: "07CCCCC3333C3Z3",
    panNo: "LMNOP9012Q",
    businessName: "Kumar & Sons Trade",
    businessCategory: "Hardware & Retail Supplies",
    address: "WZ-102 Katra Neel, Chandni Chowk",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    pinCode: "110006",
    openingBalance: 3200,
    creditLimit: 5000,
    paymentTerms: "Due on Receipt",
    status: "Blocked",
    customerType: "Dealer",
    notes: "Overdue payments. Repeated credit margin extensions refused by Management.",
    createdAt: "2026-03-01T11:15:00Z"
  },
  {
    id: "CUST-2026-004",
    name: "Vikram Singh",
    mobile: "7776665554",
    whatsApp: "7776665554",
    email: "vikram@rajasthansand.in",
    gstNo: "08DDDDD4444D4Z4",
    panNo: "RSTUV3456W",
    businessName: "Rajasthan Sand Quarrying",
    businessCategory: "Construction Supplies",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    pinCode: "302015",
    openingBalance: 0,
    creditLimit: 20000,
    paymentTerms: "Cash on Delivery",
    status: "Active",
    customerType: "Retail",
    notes: "Cash transactions dominant. Rarely utilizes credit line bounds.",
    createdAt: "2026-04-18T09:20:00Z"
  }
];

// Initial Ledger Entries
const initialLedgerEntries: CustomerLedgerEntry[] = [
  // Rohan Sharma
  { id: "L-1", customerId: "CUST-2026-001", date: "2026-06-01", description: "Opening Balance Setup", type: "opening", debit: 1000, credit: 0, balance: 1000 },
  { id: "L-2", customerId: "CUST-2026-001", date: "2026-06-05", invoiceNo: "INV-2026-101", description: "Sale - Metal Angles & Steel Pipes", type: "sale", debit: 4000, credit: 0, balance: 5000 },
  { id: "L-3", customerId: "CUST-2026-001", date: "2026-06-10", description: "Payment received via GPay UPI", type: "payment", debit: 0, credit: 1500, balance: 3500 },
  { id: "L-4", customerId: "CUST-2026-001", date: "2026-06-15", invoiceNo: "INV-2026-122", description: "Sale - Industrial Brass Fittings", type: "sale", debit: 2000, credit: 0, balance: 5500 },
  { id: "L-5", customerId: "CUST-2026-001", date: "2026-06-18", description: "Payment received Bank NEFT", type: "payment", debit: 0, credit: 1000, balance: 4500 },
  // Priya Patel
  { id: "L-6", customerId: "CUST-2026-002", date: "2026-06-02", description: "Opening Balance Setup", type: "opening", debit: 5000, credit: 0, balance: 5000 },
  { id: "L-7", customerId: "CUST-2026-002", date: "2026-06-08", invoiceNo: "INV-2026-105", description: "Sale - Fibre Optic Rolls 500m", type: "sale", debit: 8000, credit: 0, balance: 13000 },
  { id: "L-8", customerId: "CUST-2026-002", date: "2026-06-12", description: "Payment Received - HDFC Bank Transfer", type: "payment", debit: 0, credit: 1000, balance: 12000 },
  // Anil Kumar
  { id: "L-9", customerId: "CUST-2026-003", date: "2026-06-03", description: "Opening Balance Setup", type: "opening", debit: 3200, credit: 0, balance: 3200 },
  { id: "L-10", customerId: "CUST-2026-003", date: "2026-06-09", invoiceNo: "INV-2026-112", description: "Sale - Pressure Valve Kit XL", type: "sale", debit: 5000, credit: 0, balance: 8200 },
];

// Initial Communications
const initialCommunicationsList: CustomerCommunication[] = [
  { id: "C-1", customerId: "CUST-2026-001", date: "2026-06-10T16:00:00Z", type: "WhatsApp", subject: "Payment Thank You Broadcast", details: "Dispatched automated thank-you receipt of $1,500.00." },
  { id: "C-2", customerId: "CUST-2026-001", date: "2026-06-15T11:00:00Z", type: "SMS", subject: "Invoice Dispatch Status", details: "Dispatched digital Invoice INV-2026-122 download link." },
  { id: "C-3", customerId: "CUST-2026-003", date: "2026-06-16T15:20:00Z", type: "Call", subject: "Overdue Credit Line Reminder", details: "Outbound agent call regarding $8,200.00 ledger balance. Customer asked for grace extension." }
];

// Initial Notifications / Alerts
const initialNotificationsList: CustomerNotification[] = [
  { id: "N-1", customerId: "CUST-2026-003", type: "credit", title: "Credit Limit Exceeded", message: "Kumar & Sons Trade owe $8,200 (limit is $5,000). Action Needed.", date: "2026-06-18T12:00:00Z", isRead: false },
  { id: "N-2", customerId: "CUST-2026-001", type: "birthday", title: "Rohan Sharma's Birthday", message: "Wish Rohan Sharma today! Send customized WhatsApp offer code.", date: "2026-06-20T08:00:00Z", isRead: false },
  { id: "N-3", customerId: "CUST-2026-002", type: "due", title: "Payment Due In 2 Days", message: "Priya Patel's invoice of $12,000 is maturing. Auto reminder queued.", date: "2026-06-19T10:00:00Z", isRead: false }
];

export default function CustomersView({ isDark, onAddLog, userRole, userName }: CustomersViewProps) {
  // --- Core States ---
  const [customers, setCustomers] = useState<CustomerModel[]>(initialCustomersList);
  const [ledgerEntries, setLedgerEntries] = useState<CustomerLedgerEntry[]>(initialLedgerEntries);
  const [communications, setCommunications] = useState<CustomerCommunication[]>(initialCommunicationsList);
  const [alerts, setAlerts] = useState<CustomerNotification[]>(initialNotificationsList);
  
  // Tabs & Views
  type ActiveTabType = "dashboard" | "directory" | "register" | "payments" | "reports" | "alerts";
  const [activeTab, setActiveTab] = useState<ActiveTabType>("dashboard");

  // Selection state for detail panel
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [outstandingOver, setOutstandingOver] = useState(0);

  // Offline / Sync simulations
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState("Just Now");

  // --- Registration Form state ---
  const initialFormState = {
    name: "",
    mobile: "",
    whatsApp: "",
    email: "",
    gstNo: "",
    panNo: "",
    aadhaarNo: "",
    businessName: "",
    businessCategory: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pinCode: "",
    openingBalance: 0,
    creditLimit: 5000,
    paymentTerms: "Net 30",
    status: "Active" as CustomerStatus,
    customerType: "Retail" as CustomerType,
    profilePhoto: "",
    gstCertificate: "",
    panCard: "",
    tradeLicense: "",
    notes: ""
  };
  const [regForm, setRegForm] = useState(initialFormState);
  const [mockDocs, setMockDocs] = useState<{ gst?: string; pan?: string; trade?: string }>({});

  // --- Payment Management Form State ---
  const [paymentForm, setPaymentForm] = useState({
    customerId: "",
    amount: "",
    paymentMethod: "Cash" as "Cash" | "UPI" | "Bank" | "Cheque" | "Card" | "Wallet",
    referenceNumber: "",
    paymentDate: new Date().toISOString().substring(0, 10),
    remarks: ""
  });

  // --- Communication Form state ---
  const [commType, setCommType] = useState<"Email" | "SMS" | "WhatsApp" | "Call">("WhatsApp");
  const [commSubject, setCommSubject] = useState("");
  const [commDetails, setCommDetails] = useState("");
  const [showCommModal, setShowCommModal] = useState(false);

  // Quick helper to fetch customer current outstanding balance
  const getCustomerOutstanding = (customerId: string) => {
    const custLedger = ledgerEntries.filter(l => l.customerId === customerId);
    let totalDebit = 0;
    let totalCredit = 0;
    custLedger.forEach(e => {
      totalDebit += e.debit;
      totalCredit += e.credit;
    });
    return Math.max(0, totalDebit - totalCredit);
  };

  // Safe checks for Role-based Permissions
  // Admin / Manager / Accountant can manage payments
  const canManageFinancials = userRole === "admin" || userRole === "manager" || userRole === "accounting";
  // Admin / Manager can block / change status
  const canAlterStatus = userRole === "admin" || userRole === "manager";
  // Read Only Checks for staff on high sensitive actions
  const isStaff = userRole === "staff";

  // Detailed computations for Dashboard Cards
  const dashboardKPIs = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === "Active").length;
    const blocked = customers.filter(c => c.status === "Blocked").length;
    
    // New Customers this month (simulation assuming June 2026)
    const newThisMonth = customers.filter(c => c.createdAt.includes("2026-06") || c.createdAt.includes("-06")).length + 2;

    let outstandingSum = 0;
    let totalSales = 0;
    let totalPaymentsValue = 0;

    ledgerEntries.forEach(entry => {
      if (entry.type === "sale") totalSales += entry.debit;
      if (entry.type === "payment") totalPaymentsValue += entry.credit;
    });

    customers.forEach(c => {
      outstandingSum += getCustomerOutstanding(c.id);
    });

    const pendingPayments = outstandingSum;

    return {
      total,
      active,
      blocked,
      newThisMonth,
      outstandingAmount: outstandingSum,
      totalSales,
      paymentsReceived: totalPaymentsValue,
      pendingPayments
    };
  }, [customers, ledgerEntries]);

  // Compute filtered directory list
  const filteredCustomers = useMemo(() => {
    return customers.filter(cust => {
      const matchSearch = 
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.mobile.includes(searchQuery) ||
        (cust.businessName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cust.gstNo || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCity = filterCity ? cust.city?.toLowerCase() === filterCity.toLowerCase() : true;
      const matchStatus = filterStatus ? cust.status === filterStatus : true;
      const matchType = filterType ? cust.customerType === filterType : true;
      const matchOutstanding = getCustomerOutstanding(cust.id) >= outstandingOver;

      return matchSearch && matchCity && matchStatus && matchType && matchOutstanding;
    });
  }, [customers, searchQuery, filterCity, filterStatus, filterType, outstandingOver, ledgerEntries]);

  // Get distinct cities for helper filters
  const citiesList = useMemo(() => {
    return Array.from(new Set(customers.map(c => c.city).filter(Boolean)));
  }, [customers]);

  // Handle Save Customer Reg Form
  const triggerSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim()) {
      alert("Customer Name is strictly required.");
      return;
    }
    
    const newCustId = `CUST-2026-${String(customers.length + 1).padStart(3, "0")}`;
    const newCustomer: CustomerModel = {
      id: newCustId,
      name: regForm.name,
      mobile: regForm.mobile,
      whatsApp: regForm.whatsApp || regForm.mobile,
      email: regForm.email,
      gstNo: regForm.gstNo,
      panNo: regForm.panNo,
      aadhaarNo: regForm.aadhaarNo,
      businessName: regForm.businessName,
      businessCategory: regForm.businessCategory,
      address: regForm.address,
      city: regForm.city,
      state: regForm.state,
      country: regForm.country,
      pinCode: regForm.pinCode,
      openingBalance: Number(regForm.openingBalance) || 0,
      creditLimit: Number(regForm.creditLimit) || 5000,
      paymentTerms: regForm.paymentTerms,
      status: regForm.status,
      customerType: regForm.customerType,
      profilePhoto: regForm.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      notes: regForm.notes,
      gstCertificate: mockDocs.gst,
      panCard: mockDocs.pan,
      tradeLicense: mockDocs.trade,
      createdAt: new Date().toISOString()
    };

    setCustomers(prev => [newCustomer, ...prev]);

    // Insert Opening Balance Ledger Entry if >0
    if (newCustomer.openingBalance > 0) {
      const newL: CustomerLedgerEntry = {
        id: `L-NT-${Date.now()}`,
        customerId: newCustId,
        date: new Date().toISOString().substring(0, 10),
        description: "Opening Outstanding Balance",
        type: "opening",
        debit: newCustomer.openingBalance,
        credit: 0,
        balance: newCustomer.openingBalance
      };
      setLedgerEntries(prev => [...prev, newL]);
    }

    onAddLog("CUSTOMER_REGISTRATION", `Registered Customer ID: ${newCustId} (${newCustomer.name})`);
    
    // Simulate Notification check for credit limits
    if (newCustomer.openingBalance > newCustomer.creditLimit) {
      const newAlert: CustomerNotification = {
        id: `N-${Date.now()}`,
        customerId: newCustId,
        type: "credit",
        title: "Initial Credit Alert",
        message: `${newCustomer.name} initial balance of $${newCustomer.openingBalance} exceeds credit limit ($${newCustomer.creditLimit})`,
        date: new Date().toISOString(),
        isRead: false
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    setRegForm(initialFormState);
    setMockDocs({});
    setSelectedCustomerId(newCustId);
    setActiveTab("directory");
  };

  // Handle Receive Payment Processing
  const triggerReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.customerId || !paymentForm.amount) {
      alert("Please select customer and input valid payment sum.");
      return;
    }

    const value = parseFloat(paymentForm.amount);
    if (isNaN(value) || value <= 0) {
      alert("Invalid payment sum.");
      return;
    }

    const uniqueId = `PAY-${Date.now().toString().substring(7)}`;
    const cust = customers.find(c => c.id === paymentForm.customerId);

    const newLedger: CustomerLedgerEntry = {
      id: `L-${Date.now()}`,
      customerId: paymentForm.customerId,
      date: paymentForm.paymentDate,
      description: `Payment Recv: via [${paymentForm.paymentMethod}] ref: ${paymentForm.referenceNumber || "Direct"} - ${paymentForm.remarks || "No details"}`,
      type: "payment",
      debit: 0,
      credit: value,
      balance: 0 // Will compute dynamically in the UI ledger or updated
    };

    setLedgerEntries(prev => [...prev, newLedger]);

    // Log the transaction
    onAddLog("PAYMENT_RECEIVED", `Logged Payment in ledger for ${cust?.name}. Sum ${value}. method: ${paymentForm.paymentMethod}`);

    // Create virtual communication log for verification receipts
    const receiptComm: CustomerCommunication = {
      id: `C-NT-${Date.now()}`,
      customerId: paymentForm.customerId,
      date: new Date().toISOString(),
      type: "WhatsApp",
      subject: "Instant Payment Acknowledgement",
      details: `Generated receipt ref: ${uniqueId} for sum of $${value.toFixed(2)}`
    };
    setCommunications(prev => [receiptComm, ...prev]);

    // Reset Form
    setPaymentForm({
      customerId: "",
      amount: "",
      paymentMethod: "Cash",
      referenceNumber: "",
      paymentDate: new Date().toISOString().substring(0, 10),
      remarks: ""
    });

    alert("🎉 Payment successfully booked! Custom ledger & automated communications auto-updated.");
    setActiveTab("directory");
    setSelectedCustomerId(paymentForm.customerId);
  };

  const addCommunicationLog = () => {
    if (!selectedCustomerId || !commSubject.trim() || !commDetails.trim()) {
      alert("Please fill all communication logging fields.");
      return;
    }

    const newComm: CustomerCommunication = {
      id: `C-${Date.now()}`,
      customerId: selectedCustomerId,
      date: new Date().toISOString(),
      type: commType,
      subject: commSubject,
      details: commDetails
    };

    setCommunications(prev => [newComm, ...prev]);
    onAddLog("CUSTOMER_COMMUNICATION", `Logged ${commType} summary to customer database ledger bounds.`);
    setCommSubject("");
    setCommDetails("");
    setShowCommModal(false);
  };

  // Dynamic ledger logic helper
  const getSelectedCustomerLedger = (customerId: string) => {
    const records = ledgerEntries.filter(l => l.customerId === customerId);
    // Sort chronologically to compute running balance
    const chronRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    return chronRecords.map(rec => {
      running = running + rec.debit - rec.credit;
      return {
        ...rec,
        runningBalance: running
      };
    }).reverse(); // Return reversly for displaying latest on top
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedLedger = selectedCustomerId ? getSelectedCustomerLedger(selectedCustomerId) : [];
  const selectedComms = selectedCustomerId ? communications.filter(c => c.customerId === selectedCustomerId) : [];

  // Simulate Cloud Sync Action
  const triggerManualBackup = () => {
    onAddLog("SYNC_CLOUD_LEDGER", "Pushed immutable local SQLite cache bounds to secure enterprise cloud storage.");
    setLastSynced(new Date().toLocaleTimeString());
    alert("☁️ Database synced securely with cloud backup servers! All customer ledgers conform to encrypted formats.");
  };

  // Simulated Exports
  const handlePrint = (custName: string) => {
    alert(`🖨️ Initializing raw layout print job inside ERP shell for [${custName} Ledger Statement]`);
  };

  const handleExportPDF = (custName: string) => {
    alert(`📄 Generating Cryptographic SHA-256 PDF Invoice Log for [${custName}]... Sent to local Downloads path.`);
  };

  const handleExportExcel = (custName: string) => {
    alert(`📊 Formatting CSV spreadsheet ledger export for [${custName}]... Downloaded [${custName}_ledger_2026.csv]`);
  };

  const handleShareWhatsApp = (custName: string, outstanding: number, phone: string) => {
    const textMsg = encodeURIComponent(`Hi ${custName}, this is a gentle reminder from our automated billing desk. Your current outstanding ledger balance is $${outstanding.toFixed(2)}. Please settle via your dedicated UPI link. Thank you!`);
    window.open(`https://wa.me/${phone}?text=${textMsg}`, "_blank");
  };

  const handleEmailLedger = (custName: string, email: string) => {
    const subject = encodeURIComponent(`Statement of Accounts - Success ERP`);
    const body = encodeURIComponent(`Dear ${custName},\n\nPlease find attached your updated Customer ledger account statement indicating matching ledger compliance balances.\n\nBest Regards,\n${userName}\nSuccess Business Accounting Team`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto pb-24 font-sans">
      {/* Cloud Sync & Connectivity Banner */}
      <div className={`p-3.5 mb-4 rounded-3xl border flex items-center justify-between transition-all ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-blue-50 border-blue-100"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-2xl ${
            isOffline ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
          }`}>
            {isOffline ? <WifiOff className="w-4 h-4 animate-pulse" /> : <Wifi className="w-4 h-4 animate-pulse" />}
          </div>
          <div>
            <h4 className={`text-xs font-bold leading-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              {isOffline ? "Offline Mode Enabled" : "Cloud Storage Connected"}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Auto Sync Queue: {isOffline ? "1 Local Queue Pending" : "Up to date"} • Sync: {lastSynced}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Offline Toggle */}
          <button 
            onClick={() => {
              setIsOffline(!isOffline);
              onAddLog("TOGGLE_OFFLINE", `Switched connection bounds to ${!isOffline ? "OFFLINE" : "ONLINE"}`);
            }}
            className={`py-1 px-2.5 rounded-lg text-[9px] font-bold uppercase cursor-pointer border ${
              isOffline
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                : "bg-slate-500/10 text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            {isOffline ? "Go Online" : "Go Offline"}
          </button>
          
          <button 
            onClick={triggerManualBackup}
            disabled={isOffline}
            className={`p-1.5 rounded-xl cursor-pointer ${
              isOffline ? "opacity-30 cursor-not-allowed text-slate-500" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            title="Manual Database Backup Backup"
          >
            <Database className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Tab Headers */}
      <div className="grid grid-cols-6 gap-1.5 p-1 mb-5 bg-slate-100 dark:bg-slate-900 rounded-2xl">
        {[
          { id: "dashboard", label: "Dashboard", icon: TrendingUp },
          { id: "directory", label: "Directory", icon: Users },
          { id: "register", label: "Register", icon: UserPlus },
          { id: "payments", label: "Payments", icon: Receipt },
          { id: "reports", label: "Reports", icon: FileText },
          { id: "alerts", label: "Reminders", icon: Bell, count: alerts.filter(a => !a.isRead).length }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ActiveTabType);
                if (tab.id !== "directory" && tab.id !== "reports") {
                  setSelectedCustomerId(null);
                }
              }}
              className={`py-2 px-1.5 rounded-xl text-[9px] font-bold uppercase tracking-tight flex flex-col items-center gap-1 transition-all relative ${
                isSelected 
                  ? "bg-blue-600 text-white shadow-md scale-102" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline-block leading-tight">{tab.label}</span>
              {tab.count ? (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* --- CONTENT A: CUSTOMER DASHBOARD --- */}
      {activeTab === "dashboard" && (
        <div className="space-y-5">
          {/* Main Financial Metrics bento banner */}
          <div className={`p-4 rounded-3xl border ${
            isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100 shadow-xs"
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Global Ledger Aggregates
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Total Outstanding Balance</span>
                <span className="text-xl md:text-2xl font-black text-rose-500">
                  ${dashboardKPIs.outstandingAmount.toFixed(2)}
                </span>
              </div>
              <div className="space-y-1 border-l pl-4 border-slate-800/10 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 font-medium block">Total Sales Booked</span>
                <span className="text-xl md:text-2xl font-black text-emerald-500">
                  ${dashboardKPIs.totalSales.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/5 dark:border-slate-850">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Payments Realized</span>
                <span className="text-lg font-bold text-blue-500">
                  ${dashboardKPIs.paymentsReceived.toFixed(2)}
                </span>
              </div>
              <div className="space-y-1 border-l pl-4 border-slate-800/10 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 font-medium block">Pending Collections</span>
                <span className="text-lg font-bold text-amber-500">
                  ${dashboardKPIs.pendingPayments.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Core Counters Rows */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-slate-900/30 border-slate-850" : "bg-slate-50/50 border-slate-100"}`}>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Accounts</span>
              <strong className={`text-base block mt-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>{dashboardKPIs.total}</strong>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-slate-900/30 border-slate-850" : "bg-slate-50/50 border-slate-100"}`}>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Active Partners</span>
              <strong className="text-base block mt-0.5 text-emerald-500">{dashboardKPIs.active}</strong>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-slate-900/30 border-slate-850" : "bg-slate-50/50 border-slate-100"}`}>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Blocked Accounts</span>
              <strong className="text-base block mt-0.5 text-red-500">{dashboardKPIs.blocked}</strong>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-slate-900/30 border-slate-850" : "bg-slate-50/50 border-slate-100"}`}>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">New This Month</span>
              <strong className="text-base block mt-0.5 text-indigo-500">{dashboardKPIs.newThisMonth}</strong>
            </div>
          </div>

          {/* Quick Recent Customers with Quick Action list */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-800"}`}>
                Recent Customer Onboardings
              </h3>
              <button 
                onClick={() => setActiveTab("directory")}
                className="text-[10px] text-blue-500 hover:underline hover:text-blue-400 font-bold"
              >
                View Directory
              </button>
            </div>

            <div className="space-y-2">
              {customers.slice(0, 3).map(cust => {
                const outstanding = getCustomerOutstanding(cust.id);
                return (
                  <div 
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomerId(cust.id);
                      setActiveTab("directory");
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:translate-x-1 ${
                      isDark 
                        ? "bg-slate-900/40 border-slate-850 hover:bg-slate-900/60" 
                        : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={cust.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                        alt={cust.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-xl object-cover bg-slate-700 border border-slate-600/20"
                      />
                      <div>
                        <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                          {cust.name}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {cust.id} • {cust.businessName || "Individual"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 font-bold block">OUTSTANDING</span>
                      <strong className={`text-xs ${outstanding > 0 ? "text-rose-500" : "text-slate-400"}`}>
                        ${outstanding.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT B: DIRECTORY & SEARCH & LEDGERS --- */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          
          {/* Detailed Customer Detail Page IF ONE is Selected */}
          {selectedCustomerId && selectedCustomer ? (
            <div className="space-y-4">
              {/* Back to list and header */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setSelectedCustomerId(null)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white" : "bg-white border-slate-150 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  ← Back to Directory
                </button>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${
                    selectedCustomer.status === "Active" 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : selectedCustomer.status === "Blocked" 
                        ? "bg-red-500/10 text-red-500 animate-pulse" 
                        : "bg-slate-500/10 text-slate-400"
                  }`}>
                    ● {selectedCustomer.status}
                  </span>

                  {canAlterStatus && (
                    <button
                      onClick={() => {
                        const confirmBlock = confirm(`Change Status for ${selectedCustomer.name}?`);
                        if (confirmBlock) {
                          const nextStatusValue: CustomerStatus = selectedCustomer.status === "Active" ? "Blocked" : "Active";
                          setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, status: nextStatusValue } : c));
                          onAddLog("ALTER_CUSTOMER_STATUS", `Toggled Status of ${selectedCustomer.name} to ${nextStatusValue}`);
                        }
                      }}
                      className="text-[9px] font-bold text-red-500 hover:underline"
                    >
                      Toggle block
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Card Header Grid */}
              <div className={`p-4 rounded-3xl border ${
                isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100 shadow-xs"
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={selectedCustomer.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                      alt={selectedCustomer.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover bg-slate-700 border border-slate-600/20"
                    />
                    <div>
                      <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-md uppercase">
                        {selectedCustomer.customerType} Profile
                      </span>
                      <h3 className={`text-base font-extrabold mt-1 ${isDark ? "text-white" : "text-slate-950"}`}>
                        {selectedCustomer.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {selectedCustomer.businessName || "No Associated Corporation Registered"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/10">
                    <span className="text-[10px] text-slate-450 uppercase font-black block">LEDGER BALANCE DUE</span>
                    <strong className={`text-xl md:text-2xl font-black block ${
                      getCustomerOutstanding(selectedCustomer.id) > selectedCustomer.creditLimit 
                        ? "text-red-500 animate-pulse" 
                        : "text-rose-500"
                    }`}>
                      ${getCustomerOutstanding(selectedCustomer.id).toFixed(2)}
                    </strong>
                    <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                      Credit Limit: ${selectedCustomer.creditLimit.toFixed(2)} • {selectedCustomer.paymentTerms}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/5 dark:border-slate-850 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Mobile Link</span>
                    <span className={isDark ? "text-slate-200" : "text-slate-700"}>{selectedCustomer.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Email Address</span>
                    <span className={`truncate block ${isDark ? "text-slate-200" : "text-slate-700"}`} title={selectedCustomer.email}>
                      {selectedCustomer.email || "No Email Email"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">GST registration</span>
                    <span className={`font-mono text-[10px] ${isDark ? "text-slate-200" : "text-slate-700"}`}>{selectedCustomer.gstNo || "UNREGISTERED"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">PAN / Aadhaar</span>
                    <span className="font-mono text-[10px] text-slate-400">{selectedCustomer.panNo || "NONE"}</span>
                  </div>
                </div>

                {selectedCustomer.notes && (
                  <div className="mt-3.5 p-3 rounded-2xl bg-slate-500/5 text-[10.5px] italic text-slate-400 border border-slate-600/10">
                    <strong className="not-italic text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">Manager Notes & Comments</strong>
                    "{selectedCustomer.notes}"
                  </div>
                )}
              </div>

              {/* Dynamic Ledger Table Area */}
              <div className={`p-4 rounded-3xl border ${
                isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100 shadow-xs"
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Personal Accounts Ledger
                    </h4>
                    <p className="text-[10px] text-slate-400">Statement updates automatically upon invoicing or payments entry</p>
                  </div>

                  {/* Actions for Statement */}
                  <div className="flex items-center flex-wrap gap-1.5 w-full sm:w-auto">
                    <button 
                      onClick={() => handlePrint(selectedCustomer.name)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-400 hover:text-white"
                      title="Print Customer Ledger Statement"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleExportPDF(selectedCustomer.name)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-400 hover:text-white"
                      title="Export Statement as PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleExportExcel(selectedCustomer.name)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-400 hover:text-white"
                      title="Export Statement as CSV / Excel"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleShareWhatsApp(selectedCustomer.name, getCustomerOutstanding(selectedCustomer.id), selectedCustomer.mobile)}
                      className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                      title="Share Reminder & Statement on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleEmailLedger(selectedCustomer.name, selectedCustomer.email || "")}
                      className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                      title="Email update Statement Ledger"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ledger Listing Entries */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/10 dark:border-slate-850 text-slate-400 font-bold text-[9.5px] uppercase">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2 text-right">Debit (+)</th>
                        <th className="pb-2 text-right">Credit (-)</th>
                        <th className="pb-2 text-right">Running</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/5 dark:divide-slate-850">
                      {selectedLedger.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-500">No registered account transactions found.</td>
                        </tr>
                      ) : (
                        selectedLedger.map(rec => (
                          <tr key={rec.id} className="hover:bg-slate-500/5">
                            <td className="py-2.5 font-mono text-[10px] text-slate-400">{rec.date}</td>
                            <td className="py-2.5">
                              <span className="font-bold block text-slate-200 text-[11px]">{rec.description}</span>
                              {rec.invoiceNo && <span className="text-[9px] font-mono py-0.5 px-1 bg-slate-800 text-slate-300 rounded uppercase">{rec.invoiceNo}</span>}
                            </td>
                            <td className="py-2.5 text-right font-mono text-rose-400 font-bold">
                              {rec.debit > 0 ? `$${rec.debit.toFixed(2)}` : "—"}
                            </td>
                            <td className="py-2.5 text-right font-mono text-emerald-400 font-bold">
                              {rec.credit > 0 ? `$${rec.credit.toFixed(2)}` : "—"}
                            </td>
                            <td className="py-2.5 text-right font-mono text-slate-300 font-bold">
                              ${rec.runningBalance.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attachments & Communication Ledger split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Documents / Files */}
                <div className={`p-4 rounded-3xl border ${
                  isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100 shadow-xs"
                }`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                    <FolderOpen className="w-4 h-4 text-amber-500" />
                    Government Verification Documents
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-500/5 border border-slate-800/10 dark:border-slate-850">
                      <div>
                        <span className="text-[9px] font-bold block uppercase text-slate-450">GST Compliance certificate</span>
                        <strong className="text-[10.5px] font-mono text-blue-400">{selectedCustomer.gstCertificate || "Certificate.pdf"}</strong>
                      </div>
                      <span className="text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">VERIFIED</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-500/5 border border-slate-800/10 dark:border-slate-850">
                      <div>
                        <span className="text-[9px] font-bold block uppercase text-slate-450">PAN Card validation card</span>
                        <strong className="text-[10.5px] font-mono text-blue-400">PAN_CD_ENCRYPTED.jpg</strong>
                      </div>
                      <span className="text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">SECURED</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-500/5 border border-slate-800/10 dark:border-slate-850 opacity-60">
                      <div>
                        <span className="text-[9px] font-bold block uppercase text-slate-450">Enterprise Trade License Certificate</span>
                        <strong className="text-[10.5px] font-mono text-slate-400">Not Uploaded</strong>
                      </div>
                      <span className="text-[9px] text-slate-400">Optional</span>
                    </div>
                  </div>
                </div>

                {/* Communication Records */}
                <div className={`p-4 rounded-3xl border ${
                  isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100 shadow-xs"
                }`}>
                  <div className="flex justify-between items-center mb-2.5">
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                      <Send className="w-4 h-4 text-blue-500" />
                      CRM Contact Communications Log
                    </h4>
                    
                    <button
                      onClick={() => setShowCommModal(true)}
                      className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[9px] rounded-lg tracking-wide uppercase cursor-pointer"
                    >
                      + Log CRM Contact
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {selectedComms.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-[11px] italic">No prior communication history recorded.</div>
                    ) : (
                      selectedComms.map(c => (
                        <div key={c.id} className="p-2.5 rounded-2xl bg-slate-500/5 border border-slate-800/10 dark:border-slate-850 text-xs">
                          <div className="flex justify-between items-center text-[10px] mb-1 font-bold">
                            <span className="text-blue-400 uppercase">{c.type} CRM Broadcast</span>
                            <span className="text-slate-500 font-mono">{new Date(c.date).toLocaleDateString()}</span>
                          </div>
                          <strong className={`font-semibold block ${isDark ? "text-slate-300" : "text-slate-800"}`}>{c.subject}</strong>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{c.details}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            // Regular Directory List
            <div className="space-y-4">
              {/* Dynamic Filtering Area */}
              <div className={`p-4 rounded-3xl border ${
                isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-150 shadow-xs"
              }`}>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search Ledger Name, GSTIN, Tel, ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full py-2 pl-9 pr-4 text-xs rounded-2xl border outline-none font-medium ${
                        isDark ? "bg-slate-950 border-slate-850 text-slate-100" : "bg-white border-slate-200 text-slate-940"
                      }`}
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      setFilterCity("");
                      setFilterStatus("");
                      setFilterType("");
                      setOutstandingOver(0);
                      setSearchQuery("");
                    }}
                    className={`py-2 px-3 text-[10px] uppercase font-bold rounded-2xl border transition-all ${
                      isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Reset Grid
                  </button>
                </div>

                {/* Sub Filters Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className={`p-2 text-[10.5px] rounded-xl border outline-none font-bold ${
                      isDark ? "bg-slate-950 border-slate-850 text-slate-400" : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <option value="">All Cities / Regions</option>
                    {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`p-2 text-[10.5px] rounded-xl border outline-none font-bold ${
                      isDark ? "bg-slate-950 border-slate-850 text-slate-400" : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <option value="">All Status Levels</option>
                    <option value="Active">Active Partners</option>
                    <option value="Inactive">Inactive Partners</option>
                    <option value="Blocked">Blocked / Exceeded Limit</option>
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`p-2 text-[10.5px] rounded-xl border outline-none font-bold ${
                      isDark ? "bg-slate-950 border-slate-850 text-slate-400" : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <option value="">All Account Types</option>
                    <option value="Retail">Retail Accounts</option>
                    <option value="Wholesale">Wholesale Accounts</option>
                    <option value="Distributor">Distributor Accounts</option>
                    <option value="Dealer">Dealer Accounts</option>
                  </select>

                  <select
                    value={outstandingOver}
                    onChange={(e) => setOutstandingOver(Number(e.target.value))}
                    className={`p-2 text-[10.5px] rounded-xl border outline-none font-bold ${
                      isDark ? "bg-slate-950 border-slate-850 text-slate-400" : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <option value={0}>Any Outstanding</option>
                    <option value={1000}> outstanding &gt; $1,000</option>
                    <option value={5000}> outstanding &gt; $5,000</option>
                    <option value={10000}> outstanding &gt; $10,000</option>
                  </select>
                </div>
              </div>

              {/* Directory Customer List Cards Grid */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-wider px-1">
                  <span>Matched Partners: {filteredCustomers.length}</span>
                  <span>Balance Due</span>
                </div>

                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-500/5 rounded-3xl border border-dashed border-slate-800">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    No registered matching credentials conform to the grid filters.
                  </div>
                ) : (
                  filteredCustomers.map(cust => {
                    const balance = getCustomerOutstanding(cust.id);
                    const overLimit = balance > cust.creditLimit;
                    return (
                      <div 
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className={`p-3.5 rounded-3xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                          isDark 
                            ? "bg-slate-900/60 border-slate-850 hover:border-slate-750" 
                            : "bg-white border-slate-100 shadow-xs hover:border-slate-250"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={cust.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                            alt={cust.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-2xl object-cover bg-slate-800 border"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className={`text-xs font-black tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                                {cust.name}
                              </h4>
                              <span className={`text-[8px] font-mono font-bold uppercase py-0.5 px-1 rounded ${
                                cust.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500 animate-pulse"
                              }`}>
                                {cust.status}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-medium block">
                              {cust.businessName || "Individual Ledger Entity"} • {cust.city}, {cust.state}
                            </span>
                            <span className="text-[8.5px] font-mono text-slate-450 uppercase block mt-0.5">ID: {cust.id} | TYPE: {cust.customerType}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <strong className={`text-sm block font-black ${overLimit ? "text-red-500 animate-bounce" : (balance > 0 ? "text-rose-500" : "text-slate-400")}`}>
                            ${balance.toFixed(2)}
                          </strong>
                          <span className="text-[8.5px] block text-slate-500 font-mono uppercase">LMT: ${cust.creditLimit}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- CONTENT C: CUSTOMER REGISTRATION --- */}
      {activeTab === "register" && (
        <div className={`p-4 rounded-3xl border ${
          isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-150 shadow-xs"
        }`}>
          
          <div className="mb-4">
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Register Profile Account Ledger
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Create customer account credentials with auto ID trigger & documentation dropzone</p>
          </div>

          <form onSubmit={triggerSaveCustomer} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Name Details */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Customer Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Full Legal Name"
                  value={regForm.name}
                  onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Mobile No</label>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!regForm.mobile) {
                        alert("Please input phone first.");
                        return;
                      }
                      alert("💬 Simulation: OTP code 8829 dispatched to security terminal bounds!");
                    }}
                    className="text-[8px] font-mono text-blue-500 hover:underline uppercase"
                  >
                    Dispatched Check OTP
                  </button>
                </div>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={regForm.mobile}
                  onChange={(e) => setRegForm({...regForm, mobile: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Business Name */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Business Trade Name</label>
                <input
                  type="text"
                  placeholder="Corporate Entity Name"
                  value={regForm.businessName}
                  onChange={(e) => setRegForm({...regForm, businessName: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Business Category */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Industry Class Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Wholesale Metals, Technology"
                  value={regForm.businessCategory}
                  onChange={(e) => setRegForm({...regForm, businessCategory: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Official Email Address</label>
                <input
                  type="email"
                  placeholder="client@corporate.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* GST No */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">GSTIN Register Number</label>
                <input
                  type="text"
                  placeholder="e.g. 27AAAAA1111A1Z1"
                  value={regForm.gstNo}
                  onChange={(e) => setRegForm({...regForm, gstNo: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none font-mono tracking-wider ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* WhatsApp No overrides */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">WhatsApp Broadcast No</label>
                <input
                  type="text"
                  placeholder="Same as mobile if empty"
                  value={regForm.whatsApp}
                  onChange={(e) => setRegForm({...regForm, whatsApp: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* PAN Number */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">PAN ID Card Number</label>
                <input
                  type="text"
                  placeholder="Taxation PAN ID"
                  value={regForm.panNo}
                  onChange={(e) => setRegForm({...regForm, panNo: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none font-mono ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* City Address */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">City Region</label>
                <input
                  type="text"
                  placeholder="Metro City"
                  value={regForm.city}
                  onChange={(e) => setRegForm({...regForm, city: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* State Details */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">State Province</label>
                <input
                  type="text"
                  placeholder="State/UT"
                  value={regForm.state}
                  onChange={(e) => setRegForm({...regForm, state: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Selection: Customer Type */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Classification Grade Type</label>
                <select
                  value={regForm.customerType}
                  onChange={(e) => setRegForm({...regForm, customerType: e.target.value as CustomerType})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none font-bold ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-400" : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <option value="Retail">Retail Store Customer</option>
                  <option value="Wholesale">Wholesale Enterprise</option>
                  <option value="Distributor">Principal Distributor Partner</option>
                  <option value="Dealer">Retail Area Dealer</option>
                  <option value="Online Customer">E-Commerce Web Customer</option>
                  <option value="Walk-in Customer">Walk-in Client Accounts</option>
                </select>
              </div>

              {/* Selection: Payment Terms */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Invoicing Payment Terms</label>
                <select
                  value={regForm.paymentTerms}
                  onChange={(e) => setRegForm({...regForm, paymentTerms: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none font-bold ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-400" : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <option value="Net 30">Net 30 Days Credit Maturity</option>
                  <option value="Net 15">Net 15 Days Credit Maturity</option>
                  <option value="Due on Receipt">Due immediately upon receipt</option>
                  <option value="Cash on Delivery">Cash on Delivery bounds</option>
                </select>
              </div>

              {/* Financial: Opening Balance */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Opening Balance Outstanding ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={regForm.openingBalance || ""}
                  onChange={(e) => setRegForm({...regForm, openingBalance: Number(e.target.value)})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Financial: Credit Limit Constraint */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Credit Exposure Limit Constraint ($)</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={regForm.creditLimit || ""}
                  onChange={(e) => setRegForm({...regForm, creditLimit: Number(e.target.value)})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

            </div>

            {/* Simulated Documents Upload zone as Material cards */}
            <div className="space-y-2 mt-2">
              <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Enterprise Verification uploads</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { key: "gst", label: "GST Registration Certificate", file: mockDocs.gst },
                  { key: "pan", label: "Business PAN ID Card", file: mockDocs.pan },
                  { key: "trade", label: "Valid Trade License Certificate", file: mockDocs.trade }
                ].map(doc => (
                  <button
                    key={doc.key}
                    type="button"
                    onClick={() => {
                      const docName = prompt(`Enter mock filename for ${doc.label}:`, `verified_${doc.key}_2026.pdf`);
                      if (docName) {
                        setMockDocs(prev => ({ ...prev, [doc.key]: docName }));
                        onAddLog("UPLOAD_REGISTRATION_DOC", `Buffered document file for registration: ${docName}`);
                      }
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center border cursor-pointer border-dashed transition-all ${
                      doc.file
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                        : "bg-slate-500/5 hover:bg-slate-500/10 border-slate-800"
                    }`}
                  >
                    <UploadCloud className="w-4 h-4 mb-1" />
                    <span className="text-[8.5px] block font-bold uppercase leading-tight">{doc.label}</span>
                    <span className="text-[8.5px] text-slate-400 font-mono mt-1 block truncate max-w-full">
                      {doc.file || "Drop / Click Upload"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Compliance manager Comments & Notes</label>
              <textarea
                rows={2}
                placeholder="Partner profile behavior, payment terms exceptions etc."
                value={regForm.notes}
                onChange={(e) => setRegForm({...regForm, notes: e.target.value})}
                className={`w-full p-2 text-xs rounded-xl border outline-none ${
                  isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                }`}
              />
            </div>

            {/* Actions Panel */}
            <div className="flex justify-end gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRegForm(initialFormState);
                  setMockDocs({});
                }}
                className={`py-2 px-5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Reset Fields
              </button>
              
              <button
                type="submit"
                className="py-2.5 px-6 shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Record Profile
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- CONTENT D: PAYMENT MANAGEMENT --- */}
      {activeTab === "payments" && (
        <div className={`p-4 rounded-3xl border ${
          isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-150 shadow-xs"
        }`}>
          <div className="mb-4">
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Receive Ledger Account Payment
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Process customer deposit, auto book ledger statement and synchronize live billing streams</p>
          </div>

          {!canManageFinancials && (
            <div className="p-3 mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Permission Denied: Staff roles lack General Ledger booking privileges. View-only mode active.</span>
            </div>
          )}

          <form onSubmit={triggerReceivePayment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Selector Customer */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Select Customer Account</label>
                <select
                  required
                  disabled={!canManageFinancials}
                  value={paymentForm.customerId}
                  onChange={(e) => setPaymentForm({...paymentForm, customerId: e.target.value})}
                  className={`w-full p-2.5 text-xs rounded-xl border outline-none font-bold ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-400 font-sans" : "bg-white border-slate-200 text-slate-700 font-sans"
                  }`}
                >
                  <option value="">-- Choose verified partner --</option>
                  {customers.map(c => {
                    const outstanding = getCustomerOutstanding(c.id);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.businessName || "Individual"}) - Outstanding Due: ${outstanding.toFixed(2)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Payment Amount */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Payment Received Amount ($)</label>
                <input
                  type="number"
                  step="any"
                  required
                  disabled={!canManageFinancials}
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Payment Modality */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Settlement Method</label>
                <select
                  disabled={!canManageFinancials}
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value as any})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none font-bold ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-455" : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <option value="Cash">Cash Ledger Ledger</option>
                  <option value="UPI">Instant UPI (GPay / PhonePe)</option>
                  <option value="Bank">Bank NEFT/RTGS Transfer</option>
                  <option value="Cheque">Physical Clearing Cheque</option>
                  <option value="Card">Business Debit / Credit Card</option>
                  <option value="Wallet">Digital Corporate Wallet</option>
                </select>
              </div>

              {/* Reference ID */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Transaction Reference Number</label>
                <input
                  type="text"
                  disabled={!canManageFinancials}
                  placeholder="e.g. UPI-288339 / CHQ-4091"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, referenceNumber: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none font-mono ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Posting Date */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Ledger Booking Date</label>
                <input
                  type="date"
                  disabled={!canManageFinancials}
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Posting Text */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-slate-450 block">Remarks & Booking Notes</label>
                <input
                  type="text"
                  disabled={!canManageFinancials}
                  placeholder="e.g. Part-payment clearing invoice INV-101"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})}
                  className={`w-full p-2 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={!canManageFinancials}
                className={`py-2.5 px-6 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all ${
                  canManageFinancials 
                    ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-30"
                }`}
              >
                Book & Realize Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- CONTENT E: REPORTS & ANALYTICS --- */}
      {activeTab === "reports" && (
        <div className="space-y-5">
          {/* Bento analytics report description */}
          <div className="p-1 text-[11px] text-slate-400 font-mono">
            *Certified regulatory ledger audit reports. Double entry conformant with automated VAT/GST margins.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Outstanding Statement Report */}
            <div className={`p-4 rounded-3xl border ${
              isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-150 shadow-xs"
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                <TrendingDown className="w-4 h-4 text-rose-500" />
                Customer Outstanding balances
              </h3>

              <div className="space-y-2.5">
                {customers.map(c => {
                  const outst = getCustomerOutstanding(c.id);
                  const perc = Math.min(100, (outst / c.creditLimit) * 100);
                  const limitWarn = outst > c.creditLimit;
                  return (
                    <div key={c.id} className="text-xs">
                      <div className="flex justify-between items-center mb-1 text-slate-350">
                        <span className="font-semibold">{c.name}</span>
                        <span className={limitWarn ? "text-red-500 font-bold" : "text-slate-200 font-bold"}>
                          ${outst.toFixed(2)} <span className="text-[10px] text-slate-500 font-mono">/ {c.creditLimit} limit</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            limitWarn ? "bg-rose-500" : "bg-blue-500"
                          }`} 
                          style={{ width: `${perc}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Account Type distribution / Growth and status list */}
            <div className={`p-4 rounded-3xl border ${
              isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-150 shadow-xs"
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                <Info className="w-4 h-4 text-blue-400" />
                Regulatory Status Report
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between p-2 rounded-xl bg-slate-500/5 items-center">
                  <span className="text-xs text-slate-405">Highest Outstanding limit</span>
                  <strong className="text-xs text-rose-500">$12,000.00 (Priya Patel)</strong>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-slate-500/5 items-center">
                  <span className="text-xs text-slate-405">Blocked / Over-limits accounts</span>
                  <strong className="text-xs text-red-500">1 Account (Anil Kumar)</strong>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-slate-500/5 items-center">
                  <span className="text-xs text-slate-450">Inactive Since &gt;30 Days</span>
                  <strong className="text-xs text-slate-400">1 Partner (Aditi Rao)</strong>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-slate-500/5 items-center">
                  <span className="text-xs text-slate-450">E-Commerce online Syncs</span>
                  <strong className="text-xs text-blue-400">All Nodes Conforming</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- CONTENT F: ALERTS, LIMIT CHECKS & NOTIFICATIONS --- */}
      {activeTab === "alerts" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 mb-2">
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-800"}`}>
                Compliance Alarms & Reminders
              </h3>
              <p className="text-[10px] text-slate-400">Action constraints and billing alerts triggered by ledger bounds</p>
            </div>
            
            <button 
              onClick={() => {
                setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
                onAddLog("CLEAR_CRUCIAL_REMINDS", "Cleared dynamic database alert backlog.");
              }}
              className="text-[10px] text-blue-500 hover:underline font-bold"
            >
              Mark all read
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.map(a => (
              <div 
                key={a.id} 
                className={`p-3.5 rounded-3xl border flex items-start gap-3 transition-all ${
                  a.isRead ? "opacity-50" : ""
                } ${
                  a.type === "credit" 
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}
              >
                <div className="mt-0.5">
                  {a.type === "credit" ? <Ban className="w-4.5 h-4.5" /> : (a.type === "birthday" ? <Cake className="w-4.5 h-4.5 text-pink-400" /> : <AlertCircle className="w-4.5 h-4.5" />)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <strong className={`text-xs block font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>{a.title}</strong>
                    <span className="text-[9px] text-slate-500 font-mono">{new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-tight mt-0.5">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- CRM COMMUNICATION MODAL --- */}
      {showCommModal && (
        <div className="fixed inset-0 bg-slate-950/70 z-55 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-4 rounded-3xl border shadow-2xl ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-150 text-slate-900"
          }`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider">Log CRM Contact History</h4>
              <button onClick={() => setShowCommModal(false)} className="text-slate-400 hover:text-white font-bold text-xs p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-1">CRM Channel</label>
                <select
                  value={commType}
                  onChange={(e) => setCommType(e.target.value as any)}
                  className={`w-full p-2 rounded-xl border outline-none font-bold ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-350" : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email Communication</option>
                  <option value="SMS">Short SMS Message</option>
                  <option value="Call">Outbound Call Log</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-1">Subject / Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Balance follow-up call"
                  value={commSubject}
                  onChange={(e) => setCommSubject(e.target.value)}
                  className={`w-full p-2 rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-1">Log conversation Details</label>
                <textarea
                  rows={2}
                  placeholder="Notes from the client..."
                  value={commDetails}
                  onChange={(e) => setCommDetails(e.target.value)}
                  className={`w-full p-2 rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1.5">
                <button
                  onClick={() => setShowCommModal(false)}
                  className={`py-1.5 px-3.5 rounded-xl border font-bold text-[10px] uppercase ${
                    isDark ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={addCommunicationLog}
                  className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-xl uppercase shadow-md pointer-events-auto cursor-pointer"
                >
                  Log CRM entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
