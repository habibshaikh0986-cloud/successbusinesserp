import React, { useState } from "react";
import { 
  KeyRound, ShieldCheck, Mail, Lock, User, Phone, Check, ArrowRight, 
  RotateCcw, Fingerprint, RefreshCw, Eye, EyeOff, AlertCircle
} from "lucide-react";
import { UserRole } from "../types";

interface AuthViewProps {
  onLoginSuccess: (role: UserRole, name: string) => void;
  isDark: boolean;
  onAddLog: (action: string, details: string) => void;
}

export default function AuthView({ onLoginSuccess, isDark, onAddLog }: AuthViewProps) {
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot" | "pin" | "otp" | "verifyEmail">("login");
  
  // Input fields
  const [email, setEmail] = useState("admin@success-erp.com");
  const [password, setPassword] = useState("••••••••");
  const [name, setName] = useState("Alexander Sterling");
  const [phoneNumber, setPhoneNumber] = useState("+1 (555) 019-2834");
  const [role, setRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [pinValue, setPinValue] = useState<string>("");
  const [otpValue, setOtpValue] = useState<string>("");
  const [biometricPrompt, setBiometricPrompt] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const triggerNotification = (message: string) => {
    setInfoMessage(message);
    setTimeout(() => setInfoMessage(null), 7000);
  };

  const handleClassicLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog("LOGIN_SUCCESS", `Logged in via general password module as ${role.toUpperCase()}`);
    onLoginSuccess(role, name);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog("USER_REGISTERED", `New profile request submitted for ${name} (${role})`);
    
    // Switch to Email Verification flow
    setAuthMode("verifyEmail");
    triggerNotification("✉️ Verification link broadcasted to info server!");
  };

  const handlePinPress = (num: string) => {
    if (pinValue.length >= 4) return;
    const newVal = pinValue + num;
    setPinValue(newVal);

    if (newVal === "1234") {
      setTimeout(() => {
        onAddLog("PIN_AUTH_SUCCESS", "Device unlocked via clean 4-digit security PIN");
        onLoginSuccess(role, name);
        setPinValue("");
      }, 300);
    } else if (newVal.length === 4) {
      setTimeout(() => {
        triggerNotification("❌ Wrong PIN code. Try dialing '1-2-3-4' standard bypass PIN.");
        setPinValue("");
      }, 500);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue === "4899") {
      onAddLog("OTP_AUTH_SUCCESS", "Multifactor authentication approved via telecommunication secure hash.");
      onLoginSuccess(role, name);
      setOtpValue("");
    } else {
      triggerNotification("❌ Invalid security token checksum! Please audit correct code '4899'.");
      setOtpValue("");
    }
  };

  const triggerOtpSend = () => {
    setOtpSent(true);
    setAuthMode("otp");
    onAddLog("OTP_DISPATCHED", "Secure SMS OTP challenge token dispatched to auth server registry");
    setTimeout(() => {
      triggerNotification("📲 SUCCESS ERP CODE: Your secure sign-in verification code is [ 4899 ]");
    }, 1500);
  };

  const triggerBiometricAuth = () => {
    setBiometricPrompt(true);
    onAddLog("BIOMETRICS_TRIGGERED", "Biometric fingerprint enrollment verification initiated");
  };

  const completeBiometricAuth = () => {
    setBiometricPrompt(false);
    onAddLog("BIOMETRICS_MATCH", "Dermal fingerprint pattern validated successfully");
    onLoginSuccess(role, name);
  };

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-blue-600/5 via-transparent to-transparent font-sans overflow-y-auto">
      {/* Top App Identity */}
      <div className="pt-8 pb-4 text-center px-4 flex flex-col items-center">
        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3.5">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Success Business Accounting ERP
        </h1>
        <p className="text-[11px] text-slate-500 font-medium">
          M3 Compliant Zero-Knowledge Security Vault
        </p>
      </div>

      {/* Info notification banners */}
      <div className="px-5">
        {infoMessage && (
          <div className="p-3 bg-blue-600 rounded-xl text-[10px] text-white font-medium shadow-md border border-blue-500/30 flex items-center gap-2 animate-bounce">
            <AlertCircle className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-300" />
            <span>{infoMessage}</span>
          </div>
        )}
      </div>

      {/* RENDER ACTIVE SCREEN CONTROLLER */}
      <div className="flex-1 px-5 py-4">
        {/* LOGIN FORM SCREEN */}
        {authMode === "login" && (
          <form onSubmit={handleClassicLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Role Selection</label>
              <div className="grid grid-cols-4 gap-1">
                {(["admin", "manager", "accounting", "staff"] as const).map((roleType) => (
                  <button
                    key={roleType}
                    type="button"
                    onClick={() => {
                      setRole(roleType);
                      if (roleType === "admin") {
                        setName("Alexander Sterling");
                        setEmail("admin@success-erp.com");
                      } else if (roleType === "manager") {
                        setName("Sarah Jenkins");
                        setEmail("sarah.j@success-erp.com");
                      } else if (roleType === "accounting") {
                        setName("Alex Wong");
                        setEmail("alex.wong@success-erp.com");
                      } else {
                        setName("Marcus Lane");
                        setEmail("marcus.lane@success-erp.com");
                      }
                    }}
                    className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all tracking-wider ${
                      role === roleType 
                        ? "bg-blue-600 text-white shadow-sm border border-blue-600" 
                        : (isDark ? "bg-slate-800/60 border border-slate-700/50 text-slate-400" : "bg-slate-100 border border-slate-200 text-slate-600")
                    }`}
                  >
                    {roleType === "accounting" ? "ACCT" : roleType}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  placeholder="e.g. employee@success-erp.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full py-2.5 pl-10 pr-10 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                type="button"
                onClick={() => setAuthMode("forgot")}
                className="text-blue-500 hover:underline font-semibold outline-none"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("pin")}
                className="text-slate-400 hover:text-slate-300 font-semibold flex items-center gap-1.5 outline-none"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                PIN Login Lock
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-transform shadow-md shadow-blue-500/10 cursor-pointer outline-none"
            >
              Sign In Vault
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick action grid */}
            <div className={`${isDark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"} border p-3 rounded-2xl`}>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                M3 Alternative Auth Schemes
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={triggerBiometricAuth}
                  className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1.5 outline-none hover:bg-slate-800/10 ${
                    isDark ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-700"
                  }`}
                >
                  <Fingerprint className="w-4 h-4 text-blue-500" />
                  Biometrics
                </button>
                <button
                  type="button"
                  onClick={triggerOtpSend}
                  className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1.5 outline-none hover:bg-slate-800/10 ${
                    isDark ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-700"
                  }`}
                >
                  <Mail className="w-4 h-4 text-blue-500" />
                  SMS secure OTP
                </button>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-500 py-2">
              New to ERP ledger database?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="text-blue-500 hover:underline font-bold"
              >
                Register Credentials
              </button>
            </div>
          </form>
        )}

        {/* REGISTER USER SCREEN */}
        {authMode === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className={`text-base font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              Register ERP Credentials
            </h2>
            <p className="text-[11px] text-slate-500 -mt-2 leading-tight">
              Create an encrypted cloud registry profile to sync with Firestore.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  placeholder="Employee Full Name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={`w-full py-2.5 px-3 text-xs rounded-xl border outline-none ${
                  isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <option value="admin">Administrator</option>
                <option value="manager">Wholesales Manager</option>
                <option value="accounting">Auditor / Accountant</option>
                <option value="staff">Floor Staff / Operator</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Work Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Encrypted Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  placeholder="employee@success-erp.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl outline-none"
            >
              Request Access Enrollment
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="w-full text-center text-xs text-slate-500 hover:underline pt-2 outline-none font-semibold"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD SCREEN */}
        {authMode === "forgot" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              triggerNotification("📩 Password recovery link dispatched. Reset instructions forwarded to cloud mailbox.");
              setAuthMode("login");
            }}
            className="space-y-5"
          >
            <h2 className={`text-base font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              Credentials Vault Recovery
            </h2>
            <p className="text-[11px] text-slate-500 -mt-3 leading-relaxed">
              Input verified work credentials. System will send key vault override link to restore accounting dashboard access.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verifiable Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  className={`w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  placeholder="employee@success-erp.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
            >
              Verify & Send Cloud Token
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="w-full text-center text-xs text-slate-500 hover:underline outline-none font-semibold"
            >
              Return to Login Panel
            </button>
          </form>
        )}

        {/* NUMERICAL PIN KEYPAD LOCK CODE SCREEN */}
        {authMode === "pin" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-800"}`}>
                Numeric Security Lock PIN
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Dial secure 4-digit code to bypass credentials. (Try: 1-2-3-4)
              </p>
            </div>

            {/* Display Indicator Circles */}
            <div className="flex justify-center gap-3 py-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border-1.5 transition-all ${
                    pinValue.length > idx
                      ? "bg-blue-500 border-blue-500 scale-110"
                      : "bg-transparent border-slate-600"
                  }`}
                />
              ))}
            </div>

            {/* Pin Custom Keypad 3x4 Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[210px] mx-auto pb-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinPress(num)}
                  className={`w-12 h-12 rounded-full text-sm font-extrabold flex items-center justify-center border outline-none active:scale-90 transition-transform ${
                    isDark
                      ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-white"
                      : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinValue("")}
                className="w-12 h-12 rounded-full text-[10px] font-bold flex items-center justify-center hover:bg-red-500/15 text-red-500"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handlePinPress("0")}
                className={`w-12 h-12 rounded-full text-sm font-extrabold flex items-center justify-center border outline-none active:scale-90 transition-transform ${
                  isDark
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-white"
                    : "bg-slate-100 border-slate-200 hover:bg-slate-250 text-slate-800"
                }`}
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="w-12 h-12 rounded-full text-[10px] font-bold flex items-center justify-center hover:underline text-slate-500"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* SMS OTP CHALLENGE INPUT VIEW */}
        {authMode === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4 text-center">
            <h2 className={`text-base font-extrabold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              SMS Multi-Factor Check
            </h2>
            <p className="text-[11px] text-slate-400 -mt-2.5 leading-tight">
              A temporary secure passkey was fired. Enter code to unlock financial accounting ledger.
            </p>

            <div className="space-y-3.5 py-2">
              <input
                type="text"
                maxLength={4}
                required
                placeholder="••••"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className={`w-36 py-3 text-center text-lg font-bold font-mono tracking-widest rounded-xl border-2 outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
              <p className="text-[10px] text-slate-400">
                Type <strong className="text-blue-500 font-extrabold font-mono">4899</strong> to authenticate bypassing sms logic.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
            >
              Verify OTP Safe Token
            </button>

            <button
              type="button"
              onClick={triggerOtpSend}
              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mx-auto pt-2 outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resend OTP Challenge SMS
            </button>
          </form>
        )}

        {/* EMAIL VERIFICATION REQUIRED ALERT VIEW */}
        {authMode === "verifyEmail" && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className={`text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              Verification Link Sent
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-[240px] mx-auto">
              Please click the verification URL inside <strong className="text-slate-300 font-medium">{email}</strong> to confirm security credentials and launch Firestore.
            </p>

            <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl text-[10px] text-left text-slate-400 flex items-start gap-1.5 leading-tight">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <span>
                <strong>Workspace Sync Notice:</strong> Once clicked, the User model field <code className="text-blue-400">isEmailVerified</code> gets set to <code className="text-blue-400">true</code>.
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onAddLog("EMAIL_VERIFIED_BYPASS", `${name} logged in after email verification status verified`);
                  onLoginSuccess(role, name);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Simulate Direct Verification Login
              </button>

              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="w-full text-center text-xs text-slate-500 hover:underline pt-3.5 outline-none font-semibold"
              >
                Return to Login screen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BIOMETRICS POPUP OVERLAY */}
      {biometricPrompt && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className={`w-full max-w-[250px] p-5 rounded-2xl text-center border space-y-4 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-150 text-slate-800"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Fingerprint Enrollment</h3>
            <p className="text-[10px] text-slate-500 leading-tight">
              Touch the fingerprint reader to authenticate biometric session.
            </p>

            <button
              onClick={completeBiometricAuth}
              className="w-20 h-20 rounded-full bg-blue-600/10 hover:bg-blue-600/20 active:scale-95 text-blue-500 border border-blue-500/30 flex items-center justify-center mx-auto transition-transform cursor-pointer"
            >
              <Fingerprint className="w-10 h-10 animate-pulse" />
            </button>

            <button
              onClick={() => setBiometricPrompt(false)}
              className="text-xs text-slate-400 hover:text-slate-200 hover:underline font-semibold"
            >
              Bypass / Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
