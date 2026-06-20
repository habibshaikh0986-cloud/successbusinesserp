import React, { useState } from "react";
import { 
  User, Building2, Shield, Phone, Mail, FileText, 
  CreditCard, Bell, Save, CheckCircle2, Sliders, Globe, Heart,
  Users, Trash2, Check, ShieldAlert, KeyRound
} from "lucide-react";
import { UserRole, UserModel } from "../types";

interface SettingsViewProps {
  isDark: boolean;
  onAddLog: (action: string, details: string) => void;
  userName: string;
  setUserName: (val: string) => void;
  userRole: UserRole;
  setUserRole: (val: UserRole) => void;
  userEmail: string;
  setUserEmail: (val: string) => void;
  workPhone: string;
  setWorkPhone: (val: string) => void;
  businessName: string;
  setBusinessName: (val: string) => void;
  gstNo: string;
  setGstNo: (val: string) => void;
  businessAddress: string;
  setBusinessAddress: (val: string) => void;
  registeredUsers?: UserModel[];
  onApproveUser?: (uid: string) => void;
  onDeleteUser?: (uid: string) => void;
}

export default function SettingsView({
  isDark,
  onAddLog,
  userName,
  setUserName,
  userRole,
  setUserRole,
  userEmail,
  setUserEmail,
  workPhone,
  setWorkPhone,
  businessName,
  setBusinessName,
  gstNo,
  setGstNo,
  businessAddress,
  setBusinessAddress,
  registeredUsers = [],
  onApproveUser,
  onDeleteUser
}: SettingsViewProps) {
  // Local active state tab
  const [activeTab, setActiveTab] = useState<"profile" | "business" | "preferences" | "users">("profile");
  
  // Local form state mirror for buffer and saving states
  const [tempName, setTempName] = useState(userName);
  const [tempRole, setTempRole] = useState<UserRole>(userRole);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const [tempPhone, setTempPhone] = useState(workPhone);
  
  const [tempBusinessName, setTempBusinessName] = useState(businessName);
  const [tempGstNo, setTempGstNo] = useState(gstNo);
  const [tempAddress, setTempAddress] = useState(businessAddress);

  // Preference switches
  const [stockAlerts, setStockAlerts] = useState(true);
  const [instantGstInvoice, setInstantGstInvoice] = useState(true);
  const [creditBlockThreshold, setCreditBlockThreshold] = useState("5000");

  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStatus("saving");

    setTimeout(() => {
      // Push back to primary parent state handlers
      setUserName(tempName);
      setUserRole(tempRole);
      setUserEmail(tempEmail);
      setWorkPhone(tempPhone);
      
      setBusinessName(tempBusinessName);
      setGstNo(tempGstNo);
      setBusinessAddress(tempAddress);

      onAddLog("PROFILE_CONFIGURATION_SAVED", `Updated audit profile parameters for ${tempName} (${tempRole.toUpperCase()})`);
      setSavingStatus("saved");

      setTimeout(() => {
        setSavingStatus("idle");
      }, 3000);
    }, 1200);
  };

  return (
    <div id="settings-view" className="space-y-6">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-dashed pb-4 select-none mt-2">
        <div>
          <h3 className={`text-base font-extrabold tracking-tight mb-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
            Profile Setup & Platform Settings
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">
            Configure system auditor identity, legal GST profiles, and automated billing locks.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className={`p-1 rounded-xl flex items-center ${isDark ? "bg-slate-900/50 border border-slate-800" : "bg-slate-100 border border-slate-200"}`}>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-xs"
                : (isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900")
            }`}
          >
            User Profile
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`px-3 py-1 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "business"
                ? "bg-blue-600 text-white shadow-xs"
                : (isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900")
            }`}
          >
            Business/GST Setup
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`px-3 py-1 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "preferences"
                ? "bg-blue-600 text-white shadow-xs"
                : (isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900")
            }`}
          >
            Threshold Rules
          </button>
          {userRole === "admin" && (
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "users"
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                  : (isDark ? "text-slate-450 hover:text-slate-200" : "text-slate-600 hover:text-slate-900")
              }`}
            >
              🔐 Team & Approvals
            </button>
          )}
        </div>
      </div>

      {/* Main Settings Form Panel */}
      <form onSubmit={handleSaveChanges} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-8 space-y-5">
          {/* Active Tab Screen Area */}
          {activeTab === "profile" && (
            <div className={`p-5 rounded-[24px] border ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-150 shadow-xs"}`}>
              <div className="flex items-center gap-2 mb-4 border-b border-dashed pb-3">
                <User className="text-blue-500 w-4.5 h-4.5" />
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Personal Auditor Profile
                </h4>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Authorized Signatory Name</label>
                    <input
                      type="text"
                      required
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className={`w-full py-2 px-3.5 text-xs rounded-xl border outline-none font-bold focus:ring-2 focus:ring-blue-500/30 ${
                        isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                      placeholder="e.g. Priya Patel"
                    />
                  </div>

                  {/* Role dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ERP System Authorization Level</label>
                    <select
                      value={tempRole}
                      onChange={(e) => setTempRole(e.target.value as UserRole)}
                      className={`w-full py-2.0 px-3 text-xs font-bold rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/30 ${
                        isDark ? "bg-slate-950 border-slate-800 text-white animate-transition" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    >
                      <option value="admin">Administrator (Full Control)</option>
                      <option value="accountant">Accountant Ledger Mode</option>
                      <option value="general">General Operations-Bypassed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Work Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Encrypted Business Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className={`w-full py-2 pl-9 pr-3.5 text-xs rounded-xl border outline-none font-semibold focus:ring-2 focus:ring-blue-500/30 ${
                          isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                        placeholder="email@success-erp.com"
                      />
                    </div>
                  </div>

                  {/* Phone number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Verifiable Contact Mobile</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        className={`w-full py-2 pl-9 pr-3.5 text-xs rounded-xl border outline-none font-bold font-mono focus:ring-2 focus:ring-blue-500/30 ${
                          isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "business" && (
            <div className={`p-5 rounded-[24px] border ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-150 shadow-xs"}`}>
              <div className="flex items-center gap-2 mb-4 border-b border-dashed pb-3">
                <Building2 className="text-blue-500 w-4.5 h-4.5" />
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Enterprise Profile GST Registration
                </h4>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registered Business Legal Trade Name</label>
                    <input
                      type="text"
                      required
                      value={tempBusinessName}
                      onChange={(e) => setTempBusinessName(e.target.value)}
                      className={`w-full py-2 px-3.5 text-xs rounded-xl border outline-none font-black focus:ring-2 focus:ring-blue-500/30 ${
                        isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                      placeholder="e.g. Success Corp Enterprise Ltd."
                    />
                  </div>

                  {/* GSTIN NO */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">GST Identification Number (GSTIN)</label>
                    <input
                      type="text"
                      maxLength={15}
                      required
                      value={tempGstNo}
                      onChange={(e) => setTempGstNo(e.target.value.toUpperCase())}
                      className={`w-full py-2 px-3.5 text-xs rounded-xl border outline-none font-bold font-mono tracking-widest focus:ring-2 focus:ring-blue-500/30 ${
                        isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                      placeholder="27AAACS1396T1Z4"
                    />
                  </div>
                </div>

                {/* Billing Address office */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Corporate Billing Address / Warehouse Headquarters</label>
                  <textarea
                    rows={2}
                    required
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    className={`w-full p-3 text-xs rounded-xl border outline-none font-medium leading-relaxed focus:ring-2 focus:ring-blue-500/30 ${
                      isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                    placeholder="Provide full legal business address..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className={`p-5 rounded-[24px] border ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-150 shadow-xs"}`}>
              <div className="flex items-center gap-2 mb-4 border-b border-dashed pb-3">
                <Sliders className="text-blue-500 w-4.5 h-4.5" />
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Accounting Thresholds & Limits
                </h4>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Default Credit limit lock */}
                  <div className="space-y-1.55">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Default Client Exposure credit cap (₹)</label>
                    <input
                      type="number"
                      value={creditBlockThreshold}
                      onChange={(e) => setCreditBlockThreshold(e.target.value)}
                      className={`w-full py-2 px-3.5 text-xs rounded-xl border-1 border-dashed outline-none font-bold focus:ring-2 focus:ring-blue-500/30 ${
                        isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-250 text-slate-900"
                      }`}
                      placeholder="e.g. 5000"
                    />
                  </div>

                  {/* Instant GST checkbox */}
                  <div className="space-y-1 flex flex-col justify-end">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Platform Engine Automation</label>
                    <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs font-bold transition-all ${
                      isDark ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}>
                      <span>Apply 18% GST directly on Sales</span>
                      <input
                        type="checkbox"
                        checked={instantGstInvoice}
                        onChange={(e) => setInstantGstInvoice(e.target.checked)}
                        className="rounded accent-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Stock alert preference toggle */}
                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex items-center justify-between select-none">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Bell className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <span className={`text-[11px] font-black ${isDark ? "text-slate-200" : "text-slate-800"}`}>Automatic Minimal Stock Broadcast alerts</span>
                      <p className="text-[9px] text-slate-500 leading-tight">Broadcast a push notification in dashboard when warehouse products fall below strict thresholds.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={stockAlerts}
                    onChange={(e) => setStockAlerts(e.target.checked)}
                    className="rounded accent-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className={`p-5 rounded-[24px] border ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-150 shadow-xs"} space-y-6`}>
              <div className="flex items-center justify-between border-b border-dashed pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-amber-500 w-5 h-5" />
                  <div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      Team Accounts & Admin Approvals
                    </h4>
                    <p className="text-[9px] text-slate-400 font-medium">Verify employee access requests and configure active authorization bounds.</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold font-mono">
                  {registeredUsers.filter(u => !u.isApproved).length} Pending
                </span>
              </div>

              {/* Pending Approvals Section */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Awaiting Verification</h5>
                {registeredUsers.filter(u => !u.isApproved).length === 0 ? (
                  <div className={`p-4 rounded-xl text-center text-xs ${isDark ? "bg-slate-950/40 text-slate-500 border border-dashed border-slate-800" : "bg-slate-50 text-slate-500 border border-dashed border-slate-250"}`}>
                    🎉 No pending registration requests found! All team members are verified.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {registeredUsers.filter(u => !u.isApproved).map((user) => (
                      <div
                        key={user.uid}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDark ? "bg-slate-950 border-slate-850 text-white" : "bg-amber-50/50 border-amber-100 text-slate-850"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-black">{user.name}</strong>
                            <span className="px-2 py-0.5 text-[8.5px] font-black uppercase font-mono rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {user.role?.toUpperCase() || "STAFF"}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
                            <span>📧 {user.email}</span>
                            {user.phoneNumber && <span>📞 {user.phoneNumber}</span>}
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => onApproveUser?.(user.uid)}
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-transform shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve Access
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteUser?.(user.uid)}
                            className="bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-transform"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Verified System Users */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Verified System Members</h5>
                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  {registeredUsers.filter(u => u.isApproved).length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">No active, verified team accounts found.</div>
                  ) : (
                    <div className="divide-y divide-dashed divide-slate-200 dark:divide-slate-800">
                      {registeredUsers.filter(u => u.isApproved).map((user) => {
                        const isSelf = user.email.toLowerCase() === userEmail.toLowerCase();
                        return (
                          <div
                            key={user.uid}
                            className={`p-3.5 flex items-center justify-between text-xs transition-colors ${
                              isSelf ? "bg-blue-500/5" : (isDark ? "bg-slate-900/10" : "bg-white")
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isSelf ? "bg-emerald-500 animate-pulse" : "bg-blue-500 opacity-60"}`}></span>
                                <strong className={`font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>{user.name}</strong>
                                {isSelf && (
                                  <span className="text-[8px] bg-blue-500/15 text-blue-500 px-1.5 py-0.2 rounded font-mono font-black uppercase">
                                    YOU
                                  </span>
                                )}
                                <span className="text-[8.5px] px-1.5 py-0.1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded font-mono font-black text-slate-500 uppercase">
                                  {user.role}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-500 font-mono">
                                {user.email} {user.phoneNumber ? `| ${user.phoneNumber}` : ""}
                              </p>
                            </div>

                            {/* Self Safeguard */}
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to terminate ${user.name}'s active system session bounds?`)) {
                                    onDeleteUser?.(user.uid);
                                  }
                                }}
                                className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="Terminate System Access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Submit Row */}
          {activeTab !== "users" && (
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={savingStatus === "saving"}
                className={`py-3 px-6 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md outline-none cursor-pointer ${
                  savingStatus === "saving"
                    ? "bg-blue-600/50 text-white cursor-not-allowed scale-98"
                    : (savingStatus === "saved"
                        ? "bg-emerald-500 text-white shadow-emerald-500/10"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-blue-500/10")
                }`}
              >
                <Save className="w-4 h-4" />
                <span>
                  {savingStatus === "saving" ? "Syncing configs..." : (savingStatus === "saved" ? "Sync completed!" : "Save Changes")}
                </span>
              </button>

              {savingStatus === "saved" && (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Audit parameters updated and deployed to cloud vault successfully.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Preview Card block (Bento Grid Style) */}
        <div className="md:col-span-4 space-y-4">
          <div className={`p-5 rounded-[24px] border ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-150 text-slate-800 shadow-xs"}`}>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-4">
              Real-time Auditor Badge Preview
            </span>

            <div className="flex flex-col items-center text-center space-y-3">
              {/* Profile Avatar simulation */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg font-black text-xl select-none">
                  {tempName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "SA"}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full h-4.5 w-4.5 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white" title="Active Verified Badge">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <strong className="text-sm font-black tracking-tight block">{tempName || "Priya Patel"}</strong>
                <span className="text-[9px] font-bold bg-blue-500/10 text-blue-500 dark:text-sky-300 border border-blue-500/20 px-2 py-0.5 rounded-full inline-block mt-1 font-mono uppercase tracking-wider">
                  {tempRole.toUpperCase()} USER
                </span>
              </div>

              <div className="w-full border-t border-dashed border-slate-800/10 dark:border-slate-800 pt-3 space-y-2 text-left select-none text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">GST Registration:</span>
                  <strong className="text-slate-300 uppercase shrink-0">{tempGstNo || "Pending..."}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Office Branch:</span>
                  <span className="text-slate-300 truncate max-w-[120px]">{tempBusinessName || "Success Corp"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sync Pipeline:</span>
                  <span className="text-cyan-400 font-extrabold">Active [M3 Node]</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-[20px] border text-[10px] space-y-2 leading-relaxed ${isDark ? "bg-slate-900/40 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
            <div className="font-extrabold uppercase text-[9.5px] text-slate-500 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Multi-Factor OTP Regulatory Act</span>
            </div>
            <p>
              Under section 3.5(M) of MSME Ledger Guidelines, all signup and login processes are bound to compulsory SMS dispatch protocols. OTP bypass is verified by standard gateway simulator key <strong className="text-blue-500 font-mono font-black">4899</strong>.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
