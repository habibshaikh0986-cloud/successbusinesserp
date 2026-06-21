import React, { useState } from "react";
import { 
  TrendingUp, ShoppingBag, Receipt, Plus, Search, Check, 
  ArrowUpRight, Download, Printer, Percent, ShieldCheck, UserPlus
} from "lucide-react";
import { ProductModel, TransactionModel, UserRole } from "../types";
import { jsPDF } from "jspdf";

interface SalesViewProps {
  products: ProductModel[];
  transactions: TransactionModel[];
  onAddTransaction: (newTx: {
    title: string;
    amount: number;
    type: "sale" | "purchase" | "expense";
    category: string;
    paymentMethod: "Cash" | "Bank" | "Mobile Pay";
  }) => any;
  isDark: boolean;
  onAddLog: (action: string, details: string) => void;
  userRole: UserRole;
}

export default function SalesView({
  products,
  transactions,
  onAddTransaction,
  isDark,
  onAddLog,
  userRole
}: SalesViewProps) {
  // Calculator states
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || "");
  const [salesQty, setSalesQty] = useState<number>(1);
  const [customClientName, setCustomClientName] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [taxPercent, setTaxPercent] = useState<number>(18); // GST standard
  const [selectedPayment, setSelectedPayment] = useState<"Cash" | "Bank" | "Mobile Pay">("Bank");

  const [salesSearch, setSalesSearch] = useState("");
  const [showInvoicePrint, setShowInvoicePrint] = useState<TransactionModel | null>(null);

  const generateInvoicePDF = (tx: TransactionModel) => {
    try {
      const doc = new jsPDF();
      
      let productName = "General Product / Unit Service";
      let quantity = 1;
      let clientName = "Alpha Hardware Traders";
      
      const title = tx.title;
      if (title.startsWith("Sale - ")) {
        const parts = title.substring(7).split(" to ");
        if (parts.length >= 2) {
          clientName = parts.slice(1).join(" to ");
        }
        const itemPart = parts[0];
        const qMatch = itemPart.match(/\(x(\d+)\)/);
        if (qMatch) {
          quantity = parseInt(qMatch[1]) || 1;
          productName = itemPart.replace(/\(x\d+\)/, "").trim();
        } else {
          productName = itemPart.trim();
        }
      } else {
        productName = title;
      }

      const total = tx.amount;
      const calculatedUnitPrice = total / quantity;

      // Card / Border background
      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(255, 255, 255);
      
      // Top header band
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(0, 0, 210, 15, "F");

      // App Title Branding
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("SUCCESS ERP SOLUTIONS", 14, 32);

      doc.setFontSize(9);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Automated Cloud Ledger Accounting Portal", 14, 38);
      
      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 45, 196, 45);

      // Left Column: Client Bill To Info
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("BILL TO:", 14, 56);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(clientName, 14, 62);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Business Client Account", 14, 68);
      doc.text(`Payment Mode: ${tx.paymentMethod}`, 14, 73);

      // Right Column: Invoice Details Info
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("INVOICE METADATA:", 120, 56);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Invoice Ref:   ${tx.referenceNumber}`, 120, 62);
      doc.text(`Date Created:  ${new Date(tx.timestamp).toLocaleString()}`, 120, 68);
      doc.text(`Auditor Role:  ${tx.loggedBy}`, 120, 73);
      doc.text(`Billing Status: PAID`, 120, 78);

      // Main Table of charges
      const tableTop = 90;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, tableTop, 182, 8, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text("Line Item / Service Description", 18, tableTop + 5.5);
      doc.text("Qty", 120, tableTop + 5.5);
      doc.text("Unit Price (INR)", 140, tableTop + 5.5);
      doc.text("Total (INR)", 170, tableTop + 5.5);

      // Data Row
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(productName, 18, tableTop + 14);
      doc.text(String(quantity), 120, tableTop + 14);
      doc.text(calculatedUnitPrice.toFixed(2), 140, tableTop + 14);
      doc.text(total.toFixed(2), 170, tableTop + 14);

      // Row separator line
      doc.setDrawColor(241, 245, 249);
      doc.line(14, tableTop + 19, 196, tableTop + 19);

      // Summary Totals Right Align
      const summaryTop = tableTop + 28;
      
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("Gross Ledger Value:", 115, summaryTop);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(`INR ${total.toFixed(2)}`, 165, summaryTop);

      doc.setFont("Helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("Total Paid Due (Net):", 115, summaryTop + 7);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(16, 185, 129); // Green
      doc.text(`INR ${total.toFixed(2)}`, 165, summaryTop + 7);

      // Seal and Signatory Area
      const sealTop = summaryTop + 20;
      doc.setDrawColor(16, 185, 129); // emerald
      doc.setFillColor(240, 253, 250); // emerald-50
      doc.rect(14, sealTop, 75, 26, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(4, 120, 87); // emerald-700
      doc.text("SUCCESS ERP COMPLIANCE", 18, sealTop + 6.5);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 120, 135);
      doc.text("Verification Code: SUCCESS-SHA-256", 18, sealTop + 12);
      doc.text("Authority: Automatic ERP System Seal", 18, sealTop + 17);
      doc.text("Status: VERIFIED & CLEAR", 18, sealTop + 22);

      // System Signature Placeholders
      doc.setDrawColor(226, 232, 240);
      doc.line(130, sealTop + 18, 190, sealTop + 18);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Receiver Signature", 145, sealTop + 23);

      // Bottom informational footer
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("Disclaimer: This is a computer-generated tax transaction slip conforming to matching business records.", 14, sealTop + 38);
      doc.text("All sales are subject to standard return policy terms mentioned in custom ERP service parameters.", 14, sealTop + 42);

      // Save PDF
      doc.save(`Invoice_${tx.referenceNumber}.pdf`);
      onAddLog("PDF_GENERATED", `Successfully exported PDF Invoice Ref: ${tx.referenceNumber}`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Error generating PDF: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const generateInvoiceTXT = (tx: TransactionModel) => {
    try {
      let productName = "General Product / Unit Service";
      let quantity = 1;
      let clientName = "Alpha Hardware Traders";
      
      const title = tx.title;
      if (title.startsWith("Sale - ")) {
        const parts = title.substring(7).split(" to ");
        if (parts.length >= 2) {
          clientName = parts.slice(1).join(" to ");
        }
        const itemPart = parts[0];
        const qMatch = itemPart.match(/\(x(\d+)\)/);
        if (qMatch) {
          quantity = parseInt(qMatch[1]) || 1;
          productName = itemPart.replace(/\(x\d+\)/, "").trim();
        } else {
          productName = itemPart.trim();
        }
      } else {
        productName = title;
      }

      const total = tx.amount;
      const calculatedUnitPrice = total / quantity;

      const divider = "==================================================\n";
      const dotted = "--------------------------------------------------\n";

      let out = "";
      out += divider;
      out += "               SUCCESS ERP SOLUTIONS              \n";
      out += "              OFFICIAL SECURE TAX INVOICE          \n";
      out += divider;
      out += `Reference:    ${tx.referenceNumber}\n`;
      out += `Timestamp:    ${new Date(tx.timestamp).toLocaleString()}\n`;
      out += `Auditor Agent: ${tx.loggedBy}\n`;
      out += `Payment Mode: ${tx.paymentMethod}\n`;
      out += divider;
      out += `BILL TO:\n`;
      out += `Client Name:  ${clientName}\n`;
      out += divider;
      out += `ITEMIZED LEDGER CHARGES:\n`;
      out += `Description:  ${productName}\n`;
      out += `Quantity:     ${quantity}\n`;
      out += `Unit Price:   INR ${calculatedUnitPrice.toFixed(2)}\n`;
      out += dotted;
      out += `TOTAL CASH REVENUE REC: INR ${total.toFixed(2)}\n`;
      out += divider;
      out += "         LEDGER RECORD BROADCAST SUCCESS          \n";
      out += "       Thank you for your business / trust!       \n";
      out += divider;

      const blob = new Blob([out], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${tx.referenceNumber}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      
      onAddLog("TXT_GENERATED", `Successfully exported Text Receipt Ref: ${tx.referenceNumber}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Retrieve selected item specs
  const targetProd = products.find(p => p.id === selectedProduct) || products[0];
  const unitPrice = targetProd ? targetProd.retailPrice : 100.0;
  const subtotal = unitPrice * salesQty;
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxPercent / 100);
  const totalBill = taxableAmount + taxAmount;

  // Filter existing sales transactions
  const salesHistory = transactions.filter(t => t.type === "sale" && 
    (t.title.toLowerCase().includes(salesSearch.toLowerCase()) || 
     t.referenceNumber.toLowerCase().includes(salesSearch.toLowerCase()))
  );

  const handlePostSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProd) return;

    if (salesQty > targetProd.currentStock) {
      alert(`Warning: Insufficient Warehouse stock. Only ${targetProd.currentStock} units available for ${targetProd.name}.`);
      return;
    }

    const receiptTitle = `Sale - ${targetProd.name} (x${salesQty}) to ${customClientName}`;
    const newTx = onAddTransaction({
      title: receiptTitle,
      amount: totalBill,
      type: "sale",
      category: targetProd.category,
      paymentMethod: selectedPayment
    });

    onAddLog("SALE_POSTED", `Sold ${salesQty} units of ${targetProd.sku} generating ₹${totalBill.toFixed(2)} receivable`);
    
    // Reset quantities
    setSalesQty(1);
    
    // Instantly open the invoice spec modal for printing/downloading PDF!
    if (newTx) {
      setShowInvoicePrint(newTx);
    } else {
      alert("Enterprise Sale logged, stock decremented, and cash receipt broadcasted to General Journal!");
    }
  };

  const calculateTotalSalesToday = () => {
    return transactions.filter(t => t.type === "sale").reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto pb-20 font-sans">
      {/* Banner */}
      <div className="mb-4">
        <h3 className={`text-base font-extrabold tracking-tight mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Direct Corporate Sales Suite
        </h3>
        <p className="text-xs text-slate-500">Record custom consumer bills, calculate discounts & download itemized receipts</p>
      </div>

      {/* Sales target widget */}
      <div className={`p-4 rounded-[20px] border mb-4 relative overflow-hidden ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-emerald-50/40 border-emerald-100"
      }`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5 text-emerald-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Enterprise Performance</span>
          </div>
          <span className="text-[9px] font-mono font-medium text-slate-400">TARGET: ₹25k</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-xl font-black ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
            ₹{calculateTotalSalesToday().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400">Total Cleared</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-slate-800/10 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min((calculateTotalSalesToday() / 25000) * 100, 100)}%` }} 
          />
        </div>
        <div className="flex justify-between text-[8.5px] text-slate-400 mt-1 font-semibold">
          <span>Active Streak</span>
          <span>{Math.round(Math.min((calculateTotalSalesToday() / 25000) * 100, 100))}% toward Daily Ceiling</span>
        </div>
      </div>

      {/* New Sale Form */}
      <div className={`p-4 rounded-[24px] border mb-5 ${
        isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100 shadow-xs"
      }`}>
        <span className="text-[9px] p-1 px-2 mb-3 inline-block rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold uppercase tracking-widest">
          ⚡️ Instant Invoicing Terminal
        </span>

        <form onSubmit={handlePostSale} className="space-y-3.5">
          {/* Product selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className={`w-full py-2.5 px-3 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.retailPrice.toFixed(2)} - Stock: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</label>
              <input
                type="number"
                min={1}
                required
                value={salesQty}
                onChange={(e) => setSalesQty(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-full py-2 px-3 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono ${
                  isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            {/* Client Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name</label>
              <input
                type="text"
                required
                placeholder="Enter Client Name"
                value={customClientName}
                onChange={(e) => setCustomClientName(e.target.value)}
                className={`w-full py-2 px-3 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Discount Percentage */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount</label>
                <span className="text-[10px] font-bold text-emerald-500">{discountPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={5}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-700 rounded-full"
              />
            </div>

            {/* Tax Percentage */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VAT/GST Duty</label>
                <span className="text-[10px] font-bold text-blue-500">{taxPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={1}
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1 bg-slate-700 rounded-full"
              />
            </div>
          </div>

          {/* Dynamic Invoice Calculator Ledger Sheet */}
          <div className={`p-4 rounded-2xl space-y-1.5 font-mono text-[10px] ${
            isDark ? "bg-slate-950 text-slate-400" : "bg-slate-50 text-slate-600"
          }`}>
             <div className="flex justify-between">
              <span>Retail Base Settle:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Discounts applied:</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxable Subtotal:</span>
              <span>₹{taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-blue-400">
              <span>Sales Tax ({taxPercent}%):</span>
              <span>+₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-850 pt-2 font-bold text-xs">
              <span className={isDark ? "text-slate-200" : "text-slate-800"}>TOTAL ACCOUNT DUE:</span>
              <span className="text-emerald-500">₹{totalBill.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Payment routing</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Cash", "Bank", "Mobile Pay"] as const).map((pay) => (
                <button
                  key={pay}
                  type="button"
                  onClick={() => setSelectedPayment(pay)}
                  className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    selectedPayment === pay 
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                      : (isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600")
                  }`}
                >
                  {pay}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-600 active:scale-99 transition-transform text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/15"
          >
            <Receipt className="w-4 h-4" />
            Validate & Print Cash Memo
          </button>
        </form>
      </div>

      {/* Historical Sales Search List */}
      <div className={`p-4 rounded-[24px] border ${
        isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100 shadow-xs"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-800"}`}>
            Recent Outward Receipts ({salesHistory.length})
          </h4>
          <span className="text-[8.5px] font-mono text-slate-500">Sales Record Room</span>
        </div>

        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search sales history..."
            value={salesSearch}
            onChange={(e) => setSalesSearch(e.target.value)}
            className={`w-full py-2 pl-9 pr-4 text-[11px] rounded-xl border outline-none ${
              isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          />
        </div>

        <div className="space-y-2.5">
          {salesHistory.map((sh) => (
            <div key={sh.id} className={`p-3 rounded-xl border flex justify-between items-center text-xs leading-normal ${
              isDark ? "bg-slate-950/60 border-slate-850 text-slate-300" : "bg-slate-50/50 border-slate-150"
            }`}>
              <div className="min-w-0 flex-1 pr-2">
                <p className={`font-semibold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>{sh.title}</p>
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono mt-0.5">
                  <span className="text-emerald-500 font-bold">{sh.referenceNumber}</span>
                  <span>•</span>
                  <span>{sh.paymentMethod}</span>
                  <span>•</span>
                  <span className="truncate">{new Date(sh.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-extrabold text-emerald-500 block">+₹{sh.amount.toFixed(2)}</span>
                <button
                  onClick={() => setShowInvoicePrint(sh)}
                  className="text-[9px] text-blue-500 hover:underline cursor-pointer flex items-center gap-0.5 justify-end"
                >
                  <Printer className="w-2.5 h-2.5" /> Specs
                </button>
              </div>
            </div>
          ))}

          {salesHistory.length === 0 && (
            <div className="text-center py-6 text-[11px] text-slate-400">No outbound receipts match search query.</div>
          )}
        </div>
      </div>

      {/* Invoice Specs Drilldown dialog modal */}
      {showInvoicePrint && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className={`w-full max-w-sm rounded-[32px] border p-6 font-mono text-xs ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <h4 className="text-center text-sm font-black tracking-tight mb-2 uppercase text-emerald-500">
              Tax Sales Cash Receipt
            </h4>
            <p className="text-center text-[9px] text-slate-500 mb-4 font-mono">SUCCESS ERP ACCOUNTING SYSTEM V1.0</p>
            
            <div className="space-y-1.5 border-t border-b border-dashed border-slate-800 py-3 mb-4 text-[10px]">
              <div className="flex justify-between"><span>INVOICE REF:</span><span className="font-bold text-emerald-500">{showInvoicePrint.referenceNumber}</span></div>
              <div className="flex justify-between"><span>DATE STAMP:</span><span>{new Date(showInvoicePrint.timestamp).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>PAY ROUTE:</span><span>{showInvoicePrint.paymentMethod}</span></div>
              <div className="flex justify-between"><span>AUDITOR ID:</span><span>{showInvoicePrint.loggedBy}</span></div>
              <div className="flex justify-between border-t border-slate-800/10 pt-1.5 mt-1"><span>LINE ITEM:</span><span className="font-bold truncate max-w-[150px]">{showInvoicePrint.title}</span></div>
            </div>

            <div className="flex justify-between font-bold text-sm mb-5 text-emerald-500">
              <span>NET RECEIVED:</span>
              <span>₹{showInvoicePrint.amount.toFixed(2)}</span>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => {
                  generateInvoicePDF(showInvoicePrint);
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white rounded-xl text-center cursor-pointer font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF Invoice
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    generateInvoiceTXT(showInvoicePrint);
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 rounded-lg text-center cursor-pointer font-bold text-[11px]"
                >
                  Download TXT
                </button>
                <button
                  onClick={() => setShowInvoicePrint(null)}
                  className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-lg text-center cursor-pointer font-bold text-[11px]"
                >
                  Close Memo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
