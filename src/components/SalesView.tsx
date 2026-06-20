import React, { useState } from "react";
import { 
  TrendingUp, ShoppingBag, Receipt, Plus, Search, Check, 
  ArrowUpRight, Download, Printer, Percent, ShieldCheck, UserPlus
} from "lucide-react";
import { ProductModel, TransactionModel, UserRole } from "../types";

interface SalesViewProps {
  products: ProductModel[];
  transactions: TransactionModel[];
  onAddTransaction: (newTx: {
    title: string;
    amount: number;
    type: "sale" | "purchase" | "expense";
    category: string;
    paymentMethod: "Cash" | "Bank" | "Mobile Pay";
  }) => void;
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
  const [customClientName, setCustomClientName] = useState("Alpha Hardware Traders");
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [taxPercent, setTaxPercent] = useState<number>(18); // GST standard
  const [selectedPayment, setSelectedPayment] = useState<"Cash" | "Bank" | "Mobile Pay">("Bank");

  const [salesSearch, setSalesSearch] = useState("");
  const [showInvoicePrint, setShowInvoicePrint] = useState<TransactionModel | null>(null);

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
    onAddTransaction({
      title: receiptTitle,
      amount: totalBill,
      type: "sale",
      category: targetProd.category,
      paymentMethod: selectedPayment
    });

    onAddLog("SALE_POSTED", `Sold ${salesQty} units of ${targetProd.sku} generating $${totalBill.toFixed(2)} receivable`);
    
    // Reset quantities
    setSalesQty(1);
    alert("Enterprise Sale logged, stock decremented, and cash receipt broadcasted to General Journal!");
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
          <span className="text-[9px] font-mono font-medium text-slate-400">TARGET: $25k</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-xl font-black ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
            ${calculateTotalSalesToday().toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  {p.name} (${p.retailPrice.toFixed(2)} - Stock: {p.currentStock})
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
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Discounts applied:</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxable Subtotal:</span>
              <span>${taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-blue-400">
              <span>Sales Tax ({taxPercent}%):</span>
              <span>+${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-850 pt-2 font-bold text-xs">
              <span className={isDark ? "text-slate-200" : "text-slate-800"}>TOTAL ACCOUNT DUE:</span>
              <span className="text-emerald-500">${totalBill.toFixed(2)}</span>
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
                <span className="font-extrabold text-emerald-500 block">+${sh.amount.toFixed(2)}</span>
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
              <span>${showInvoicePrint.amount.toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert("ASCII Receipt binary broadcast pushed to client download!");
                  setShowInvoicePrint(null);
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-center cursor-pointer font-bold"
              >
                Download TXT
              </button>
              <button
                onClick={() => setShowInvoicePrint(null)}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-center cursor-pointer font-bold"
              >
                Close Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
