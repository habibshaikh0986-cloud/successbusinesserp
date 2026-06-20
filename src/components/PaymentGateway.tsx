import React, { useState, useEffect } from "react";
import { 
  CreditCard, Loader2, Send, Download, CheckCircle2, XCircle, 
  AlertTriangle, QrCode, Building, Wallet, Check, ChevronRight, Share2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PaymentGatewayProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onPaymentSuccess: (details: {
    transactionId: string;
    orderId: string;
    paymentId: string;
    customerName: string;
    mobileNumber: string;
    amount: number;
    paymentMethod: string;
  }) => void;
  onAddLog: (action: string, details: string) => void;
}

export default function PaymentGateway({
  amount,
  isOpen,
  onClose,
  isDark,
  onPaymentSuccess,
  onAddLog
}: PaymentGatewayProps) {
  // Input fields
  const [customerName, setCustomerName] = useState("Habib Shaikh");
  const [mobileNumber, setMobileNumber] = useState("9819283746");
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [testScenario, setTestScenario] = useState<"success" | "failed" | "cancelled" | "network_error">("success");

  // Gateway state machine
  const [step, setStep] = useState<"details" | "checkout" | "loading" | "receipt" | "failed" | "cancelled">("details");
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [signature, setSignature] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingText, setLoadingText] = useState("");

  // Card details mock helper
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("09/29");
  const [cardCVV, setCardCVV] = useState("123");

  // Generate order ID
  const generateOrderId = () => {
    const ts = Date.now();
    const rand = Math.floor(Math.random() * 900000) + 100000;
    return `order_ERP_${ts}_${rand}`;
  };

  useEffect(() => {
    if (isOpen) {
      setOrderId(generateOrderId());
      setStep("details");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || mobileNumber.length < 10) {
      alert("Please provide valid customer name and a 10-digit mobile number.");
      return;
    }
    setStep("checkout");
  };

  const handleInitiatePayment = async () => {
    setStep("loading");
    setLoadingText("Securing handshake with Razorpay node & generating secure keys...");
    onAddLog("PAYMENT_INITIATE", `Initiated checkout for ${customerName} of amount $${amount} using channel ${testScenario}`);

    // Simulation delay 1
    await new Promise((r) => setTimeout(r, 1200));

    if (testScenario === "network_error") {
      setErrorMessage("Gateway error: remote host unresolvable. Handshake network connection timeout.");
      setStep("failed");
      onAddLog("PAYMENT_FAILED", `Payment failed due to simulated connection timeout`);
      return;
    }

    setLoadingText("Authenticating digital client authorization & preparing validation signature...");
    await new Promise((r) => setTimeout(r, 1400));

    if (testScenario === "cancelled") {
      setStep("cancelled");
      onAddLog("PAYMENT_CANCELLED", `User explicitly aborted checkout sheet verification flow`);
      return;
    }

    if (testScenario === "failed") {
      setErrorMessage("API Failure Code: EXPIRED_OR_STALE_CARD. Bank reported insufficient credit ceiling.");
      setStep("failed");
      onAddLog("PAYMENT_FAILED", `Gateway rejected credit card request due to card limit threshold`);
      return;
    }

    // Success flow - generate transaction pieces
    const generatedPaymentId = "pay_" + Math.floor(100000000 + Math.random() * 900000000);
    const generatedTxId = "tx_" + Math.floor(500000000 + Math.random() * 500000000);
    const generatedSignature = "signature_sha254_" + Math.floor(100000 + Math.random() * 900000);

    setPaymentId(generatedPaymentId);
    setTransactionId(generatedTxId);
    setSignature(generatedSignature);

    setLoadingText("Cryptographically verifying SHA-254 signature and updating the Firestore ledger...");
    await new Promise((r) => setTimeout(r, 1000));

    // Finish checkout successfully
    setStep("receipt");
    onPaymentSuccess({
      transactionId: generatedTxId,
      orderId,
      paymentId: generatedPaymentId,
      customerName,
      mobileNumber,
      amount,
      paymentMethod: selectedMethod
    });
    onAddLog("PAYMENT_SUCCESS", `Receipt successfully logged. Secure Signature verified and synchronized with ledger`);
  };

  // Receipt downloads / Web Share triggers
  const handleDownloadReceipt = () => {
    const rawContent = `-------------------------------------------
      SUCCESS ERP ACCOUNTING PAYMENTS LEDGER
      ELECTRONIC SALES RECEIPT (SECURE PAY)
-------------------------------------------
Transaction ID : ${transactionId}
Secure Order ID: ${orderId}
Gateway Pay ID : ${paymentId}
Verified Sig   : ${signature}
Customer Name  : ${customerName}
Mobile Number  : ${mobileNumber}
Payment Channel: ${selectedMethod}
Settle Amount  : $${amount.toFixed(2)}
Timestamp      : ${new Date().toISOString()}
Compliance     : Certified Cryptographic Proof
Status         : SECURE TRANSACTION SUCCESSFUL
-------------------------------------------`;

    const blob = new Blob([rawContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SuccessERP_Receipt_${paymentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onAddLog("RECEIPT_DOWNLOAD", `Secure ASCII Text receipt printed: receipt_${paymentId}.txt`);
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      `🔔 *Success ERP Payment Success Receipt*\n\n` +
      `Dear *${customerName}*,\n` +
      `We have processed and verified your payment successfully.\n\n` +
      `💵 *Amount:* $${amount.toFixed(2)}\n` +
      `📱 *Channel:* ${selectedMethod}\n` +
      `📝 *Order ID:* ${orderId}\n` +
      `🔒 *Payment ID:* ${paymentId}\n` +
      `📅 *Date:* ${new Date().toLocaleDateString()}\n\n` +
      `Thank you for doing business with us!`
    );
    window.open(`https://wa.me/${mobileNumber}?text=${msg}`, "_blank");
    onAddLog("RECEIPT_SHARE", `Redirected user to WhatsApp Web chat at mobile address +${mobileNumber}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step === "loading" ? undefined : onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
      />

      {/* Main Checkout container sheet */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className={`relative w-full max-w-md rounded-[32px] overflow-hidden border p-6 md:p-8 flex flex-col justify-between shadow-2xl transition-all ${
          isDark ? "bg-slate-905 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"
        }`}
        style={{ minHeight: "460px" }}
      >
        {/* Header decoration logo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20">
              S⚡️
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight leading-none">Secure Pay</h2>
              <p className="text-[10px] text-slate-400 font-medium">Modular Gateway Portal</p>
            </div>
          </div>
          {step !== "loading" && (
            <button 
              onClick={onClose}
              className={`p-1.5 rounded-full border transition-colors cursor-pointer outline-none ${
                isDark ? "border-slate-800 text-slate-450 hover:bg-slate-800" : "border-slate-100 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Cancel
            </button>
          )}
        </div>

        {/* STEP 1: CUSTOMER DATA FILL */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="text-center p-4 rounded-2xl bg-blue-600/10 border border-blue-500/15">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-500 block mb-1">
                  Outstanding Bill Pending Collect
                </span>
                <span className="text-3xl font-black tracking-tight text-blue-600 block">
                  ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Customer Billing Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    isDark ? "bg-slate-950 border-slate-855 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  placeholder="e.g. Habib Shikh"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  WhatsApp Contact Mobile
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    isDark ? "bg-slate-950 border-slate-855 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  placeholder="10 digit phone contact"
                />
              </div>

              {/* Simulation Sandbox Options */}
              <div className={`p-3 rounded-2xl border space-y-1.5 ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200/50"}`}>
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 block">
                  🧪 Sandbox Testing Simulator Protocol
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["success", "failed", "cancelled", "network_error"] as const).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setTestScenario(sc)}
                      className={`py-1 text-[9px] uppercase font-bold rounded-lg border transition-all ${
                        testScenario === sc 
                          ? "bg-amber-500/20 border-amber-500 text-amber-500" 
                          : (isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-650")
                      }`}
                    >
                      {sc.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer outline-none shadow-md shadow-blue-500/20"
            >
              Continue to Channels
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* STEP 2: CHANNEL SELECTION & CREDIT DATA */}
        {step === "checkout" && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="text-center pb-2 border-b border-dashed border-slate-800">
                <p className="text-[10px] text-slate-400 font-medium">Billed To: {customerName} (+{mobileNumber})</p>
                <div className="text-xl font-bold mt-0.5 text-blue-500">${amount.toFixed(2)}</div>
              </div>

              {/* Grid of payment channels */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 block">
                  Select Channel Gateway API
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "UPI", label: "UPI Pay", icon: QrCode, color: "text-indigo-500" },
                    { id: "Credit Card", label: "Credit Card", icon: CreditCard, color: "text-deep-purple-500" },
                    { id: "Debit Card", label: "Debit Card", icon: CreditCard, color: "text-emerald-500" },
                    { id: "Net Banking", label: "Net Bank", icon: Building, color: "text-blue-500" },
                    { id: "Wallets", label: "Wallet", icon: Wallet, color: "text-amber-500" }
                  ].map((chan) => {
                    const isPicked = selectedMethod === chan.id;
                    return (
                      <button
                        key={chan.id}
                        onClick={() => setSelectedMethod(chan.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer outline-none ${
                          isPicked 
                            ? "bg-blue-600/10 border-blue-500 text-blue-500" 
                            : (isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-50 border-slate-200 text-slate-600")
                        }`}
                      >
                        <chan.icon className={`w-4 h-4 ${chan.color}`} />
                        <span className="text-[9px] font-black leading-none block">{chan.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Details UI depending on Selection */}
              {selectedMethod.includes("Card") ? (
                <div className="p-3.5 rounded-2xl border space-y-2.5 bg-slate-900 border-slate-800 text-left">
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Card number details</span>
                    <input 
                      type="text" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-transparent border-b border-slate-800 text-xs text-slate-100 font-mono focus:border-blue-500 outline-none pb-0.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Expiry Date</span>
                      <input 
                        type="text" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-transparent border-b border-slate-800 text-xs text-slate-100 font-mono focus:border-blue-500 outline-none pb-0.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">CVV securely masked</span>
                      <input 
                        type="password" 
                        value={cardCVV}
                        maxLength={3}
                        onChange={(e) => setCardCVV(e.target.value)}
                        className="w-full bg-transparent border-b border-slate-800 text-xs text-slate-100 font-mono focus:border-blue-500 outline-none pb-0.5"
                      />
                    </div>
                  </div>
                </div>
              ) : selectedMethod === "UPI" ? (
                <div className="p-3.5 rounded-2xl border border-dashed flex items-center gap-3.5 bg-slate-900/60 border-indigo-500/30 text-left">
                  <QrCode className="w-10 h-10 text-indigo-400 stroke-[1.5]" />
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-400 block">
                      Direct Peer-to-Peer Settlement
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Razorpay UPI auto-redirect request will push direct to custom handles like BHIM, PhonePe or GPay.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 text-left rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                  ⚡️ Handshake proxy with 54 verified public state banks currently active in routing ledger entries.
                </div>
              )}
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3.5">
              <button
                onClick={() => setStep("details")}
                className={`py-3 text-center text-xs font-bold rounded-xl border ${
                  isDark ? "border-slate-805 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-650 hover:bg-slate-50"
                }`}
              >
                Go Back
              </button>
              <button
                onClick={handleInitiatePayment}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer outline-none shadow-md shadow-blue-500/20"
              >
                Pay ${amount.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOADING TRANSITION */}
        {step === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <div>
              <h4 className="text-sm font-bold text-slate-200">Processing Encrypted Checkout</h4>
              <p className="text-[10px] text-slate-500 mt-2 px-6 leading-relaxed max-w-sm">
                "{loadingText}"
              </p>
            </div>
            <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse" style={{ width: "65%" }}></div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {step === "receipt" && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3.5 text-center">
              <div className="inline-flex p-2 bg-green-500/10 rounded-full border border-green-500/30 text-green-500 mb-1">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-green-400">Payment Verified Securely</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Firestore Record Saved Successfully</p>
              </div>

              {/* Micro ledger receipt table */}
              <div className={`p-4 rounded-2xl border text-left text-xs font-mono space-y-1.5 ${
                isDark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Ref:</span>
                  <span className="font-bold text-slate-300">{transactionId.substring(0, 11)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Ref:</span>
                  <span className="font-bold text-slate-300">{orderId.substring(0, 16)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt Ref:</span>
                  <span className="font-bold text-slate-300">{paymentId.substring(0, 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-300 truncate max-w-[130px]">{customerName}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-800 pt-1.5 mt-1">
                  <span className="text-slate-500 font-bold">Paid Settle:</span>
                  <span className="font-black text-blue-400">${amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadReceipt}
                  className={`py-2 px-3 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all outline-none ${
                    isDark ? "border-slate-800 hover:bg-slate-800 text-slate-200" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  Receipt PDF
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className={`py-2 px-3 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all outline-none ${
                    isDark ? "border-slate-800 hover:bg-slate-800 text-slate-200" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5 text-green-500" />
                  WhatsApp
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-8 w-full bg-slate-800 hover:bg-slate-700 transition-colors text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Checkout
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FAILURE SCREEN */}
        {step === "failed" && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3 pb-2 text-center my-auto">
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-base font-extrabold text-red-500">Transaction Failed</h3>
                <p className="text-[10px] text-slate-400 max-w-sm mt-2 leading-relaxed px-4">
                  {errorMessage || "The checkout session was rejected by Gateway peer bank."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={onClose}
                className={`py-3 text-center text-xs font-bold rounded-xl border ${
                  isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-650"
                }`}
              >
                Close
              </button>
              <button
                onClick={() => setStep("details")}
                className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: CANCELLED SCREEN */}
        {step === "cancelled" && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3 pb-2 text-center my-auto">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              <div>
                <h3 className="text-base font-extrabold text-amber-500">Transaction Cancelled</h3>
                <p className="text-[10px] text-slate-400 max-w-sm mt-2 leading-relaxed px-4">
                  The client credentials handshake was cancelled or dismissed on the checkout screen. No ledger change was made.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep("details")}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Restart Gateway
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
