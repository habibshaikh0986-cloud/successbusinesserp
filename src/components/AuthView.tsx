import React, { useState } from "react";
import { 
  KeyRound, ShieldCheck, Mail, Lock, User, Phone, Check, ArrowRight, 
  RotateCcw, Fingerprint, RefreshCw, Eye, EyeOff, AlertCircle
} from "lucide-react";
import { UserRole, UserModel } from "../types";

interface AuthViewProps {
  onLoginSuccess: (role: UserRole, name: string, email?: string, phone?: string) => void;
  isDark: boolean;
  onAddLog: (action: string, details: string) => void;
  authMode?: "login" | "register" | "forgot" | "pin" | "otp" | "verifyEmail";
  setAuthMode?: (mode: "login" | "register" | "forgot" | "pin" | "otp" | "verifyEmail") => void;
  registeredUsers: UserModel[];
  onRegisterUser: (user: UserModel) => void;
}

export default function AuthView({ 
  onLoginSuccess, 
  isDark, 
  onAddLog,
  authMode: controlledAuthMode,
  setAuthMode: controlledSetAuthMode,
  registeredUsers,
  onRegisterUser
}: AuthViewProps) {
  const [localAuthMode, setLocalAuthMode] = useState<"login" | "register" | "forgot" | "pin" | "otp" | "verifyEmail">("login");
  const authMode = controlledAuthMode !== undefined ? controlledAuthMode : localAuthMode;
  const setAuthMode = controlledSetAuthMode !== undefined ? controlledSetAuthMode : setLocalAuthMode;
  
  // Input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // States
  const [pinValue, setPinValue] = useState<string>("");
  const [otpValue, setOtpValue] = useState<string>("");
  const [biometricPrompt, setBiometricPrompt] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [otpPurpose, setOtpPurpose] = useState<"login" | "register">("login");

  const triggerNotification = (message: string) => {
    setInfoMessage(message);
    setTimeout(() => setInfoMessage(null), 7000);
  };

  const handleClassicLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Look up user accounts in our registered database base
    const matchedUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matchedUser) {
      triggerNotification("❌ This Email Address is not registered. Click 'Register Credentials' to signup!");
      onAddLog("LOGIN_FAILED", `Auth attempt failed: ${email} is not in directory`);
      return;
    }

    if (matchedUser.password !== password) {
      triggerNotification("❌ Invalid password specified! Please audit correct override credentials.");
      onAddLog("LOGIN_FAILED", `Credentials check failed for ${email}`);
      return;
    }

    if (!matchedUser.isApproved) {
      triggerNotification("⚠️ Account PENDING Admin Approval! Your account must be approved by the Admin before logging in.");
      onAddLog("LOGIN_BLOCKED", `Authentication blocked for unapproved login request: ${email}`);
      return;
    }

    // Synchronize selected fields with matching profile attributes
    setRole(matchedUser.role);
    setName(matchedUser.name);
    setPhoneNumber(matchedUser.phoneNumber || "");

    onAddLog("LOGIN_INITIATED", `Classic login password approved. Compulsory OTP validation triggered for user role: ${matchedUser.role.toUpperCase()}`);
    setOtpPurpose("login");
    triggerOtpSend();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const existingUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existingUser) {
      triggerNotification("❌ Email already exists! Try another email or recover password.");
      return;
    }

    if (!registerPassword || registerPassword.length < 4) {
      triggerNotification("❌ Password must be at least 4 characters long!");
      return;
    }

    onAddLog("USER_REGISTERED_INITIATED", `Profile registration request received for ${name} (${role}). Compulsory OTP validation triggered`);
    setOtpPurpose("register");
    triggerOtpSend();
  };

  const handlePinPress = (num: string) => {
    if (pinValue.length >= 4) return;
    const newVal = pinValue + num;
    setPinValue(newVal);

    if (newVal === "1234") {
      setTimeout(() => {
        // By default PIN is only allowed if there's an approved admin or accountant. We'll find one to bypass login
        const defaultApprovedUser = registeredUsers.find(u => u.isApproved);
        if (defaultApprovedUser) {
          setRole(defaultApprovedUser.role);
          setName(defaultApprovedUser.name);
          setEmail(defaultApprovedUser.email);
          setPhoneNumber(defaultApprovedUser.phoneNumber || "");
          
          onAddLog("PIN_AUTH_GRANTED", `Secure PIN matched. Logging in bypass as ${defaultApprovedUser.name}`);
          setOtpPurpose("login");
          triggerOtpSend();
        } else {
          triggerNotification("❌ No active verified profiles in database directory! Please register a new account on the Signup tab.");
        }
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
      if (otpPurpose === "register") {
        onAddLog("USER_OTP_REGISTER_SUCCESS", `Signup OTP verification approved for ${name} [${role.toUpperCase()}]`);
        
        // Admin, Accountant, and General registrations are auto-approved so they can log in right away!
        const isApproved = true;
        
        const newUser: UserModel = {
          uid: `user-${Date.now()}`,
          email: email.trim(),
          name: name.trim(),
          role,
          phoneNumber: phoneNumber.trim(),
          isEmailVerified: true,
          password: registerPassword,
          isApproved
        };

        onRegisterUser(newUser);

        if (isApproved) {
          triggerNotification(`🎉 Admin Account Successfully Created! Welcoming master session...`);
          setTimeout(() => {
            onLoginSuccess(role, name, email, phoneNumber);
            setOtpValue("");
          }, 1500);
        } else {
          triggerNotification(`📝 Signup request submitted! Awaiting Admin Approval to log in. Please contact Admin.`);
          setTimeout(() => {
            setAuthMode("login");
            setOtpValue("");
            // Clear passwords
            setRegisterPassword("");
          }, 2500);
        }
      } else {
        onAddLog("OTP_AUTH_SUCCESS", `Multifactor login approved for ${name} [${role.toUpperCase()}] via secure OTP`);
        onLoginSuccess(role, name, email, phoneNumber);
        setOtpValue("");
      }
    } else {
      triggerNotification("❌ Invalid security token checksum! Please audit correct code '4899'.");
      setOtpValue("");
    }
  };

  const triggerOtpSend = () => {
    setOtpSent(true);
    setAuthMode("otp");
    onAddLog("OTP_DISPATCHED", "Secure SMS OTP challenge token dispatched to register phone");
    setTimeout(() => {
      triggerNotification("📲 SUCCESS ERP CODE: Your secure sign-in verification code is [ 4899 ]");
    }, 1000);
  };

  const triggerBiometricAuth = () => {
    setBiometricPrompt(true);
    onAddLog("BIOMETRICS_TRIGGERED", "Biometric fingerprint enrollment verification initiated");
  };

  const completeBiometricAuth = () => {
    setBiometricPrompt(false);
    onAddLog("BIOMETRICS_MATCH", "Biometric pattern verified. Launching compulsory OTP security challenge");
    setOtpPurpose("login");
    triggerOtpSend();
  };

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-blue-600/5 via-transparent to-transparent font-sans overflow-y-auto">
      {/* Top App Identity */}
      <div className="pt-8 pb-4 text-center px-4 flex flex-col items-center">
        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3.5">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Success Business
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

      {/* Centered Segmented Control / Tabs Switcher */}
      <div className="px-5 mt-4 mb-2 shrink-0">
        <div className={`p-1.5 rounded-2xl flex items-center ${
          isDark ? "bg-slate-900 border border-slate-800" : "bg-slate-100 border border-slate-200"
        }`}>
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              onAddLog("AUTH_MODE_SHIFT", "Switched gateway state to LOGIN interface form");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === "login" || authMode === "pin" || authMode === "otp" || authMode === "forgot"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10 scale-100 font-extrabold"
                : (isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900")
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-sky-300" />
            <span>Login Vault</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("register");
              onAddLog("AUTH_MODE_SHIFT", "Switched gateway state to NEW CREDENTIAL REGISTER form");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === "register" || authMode === "verifyEmail"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10 scale-100 font-extrabold"
                : (isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900")
            }`}
          >
            <User className="w-4 h-4 text-sky-300" />
            <span>Signup</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE SCREEN CONTROLLER */}
      <div className="flex-1 px-5 py-4">
        {/* LOGIN FORM SCREEN */}
        {authMode === "login" && (
          <form onSubmit={handleClassicLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Role Selection</label>
              <div className="grid grid-cols-3 gap-1">
                {(["admin", "accountant", "general"] as const).map((roleType) => (
                  <button
                    key={roleType}
                    type="button"
                    onClick={() => {
                      setRole(roleType);
                      // Only prefill mock credentials as an onboarding sandbox helper if inputs are current empty
                      if (!email && !password) {
                        if (roleType === "admin") {
                          setName("Habib Shaikh");
                          setEmail("habibshaikh0986@gmail.com");
                          setPassword("admin");
                        } else if (roleType === "accountant") {
                          setName("Alex Wong");
                          setEmail("alex.wong@success-erp.com");
                          setPassword("123");
                        } else {
                          setName("Marcus Lane");
                          setEmail("general.user@success-erp.com");
                          setPassword("general");
                        }
                      }
                    }}
                    className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all tracking-wider ${
                      role === roleType 
                        ? "bg-blue-600 text-white shadow-sm border border-blue-600" 
                        : (isDark ? "bg-slate-800/60 border border-slate-700/50 text-slate-400" : "bg-slate-100 border border-slate-200 text-slate-600")
                    }`}
                  >
                    {roleType === "accountant" ? "ACCT" : roleType}
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
                <option value="accountant">Accountant</option>
                <option value="general">General</option>
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

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Set Account Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className={`w-full py-2.5 pl-10 pr-10 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  placeholder="Set your account password"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 outline-none cursor-pointer"
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              {otpPurpose === "register" ? "Signup Verify OTP" : "Login Verify OTP"}
            </h2>
            <p className="text-[11px] text-slate-400 -mt-2.5 leading-tight">
              A compulsory security passkey was fired. Enter code to authenticate.
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
                  onAddLog("EMAIL_VERIFIED_BYPASS", `${name || "Verified Client"} logged in after email verification status verified`);
                  onLoginSuccess(role, name, email, phoneNumber);
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
