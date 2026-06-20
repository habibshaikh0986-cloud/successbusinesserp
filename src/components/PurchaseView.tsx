import React, { useState } from "react";
import { 
  Building, CreditCard, Plus, ShoppingBag, ArrowDownLeft, AlertCircle, 
  Search, RefreshCw, Layers, CheckCircle, PackageSearch, Users
} from "lucide-react";
import { ProductModel, TransactionModel, UserRole } from "../types";

interface PurchaseViewProps {
  products: ProductModel[];
  transactions: TransactionModel[];
  onAddTransaction: (newTx: {
    title: string;
    amount: number;
    type: "sale" | "purchase" | "expense";
    category: string;
    paymentMethod: "Cash" | "Bank" | "Mobile Pay";
  }) => void;
  onReplenishStock: (id: string, qty: number) => void;
  isDark: boolean;
  onAddLog: (action: string, details: string) => void;
  userRole: UserRole;
}

export default function PurchaseView({
  products,
  transactions,
  onAddTransaction,
  onReplenishStock,
  isDark,
  onAddLog,
  userRole
}: PurchaseViewProps) {
  // States
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || "");
  const [purchaseQty, setPurchaseQty] = useState<number>(10);
  const [selectedSupplier, setSelectedSupplier] = useState("Vortex Industrial Wholesalers");
  const [purchasePriceOverride, setPurchasePriceOverride] = useState<string>("");
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState<"Cash" | "Bank" | "Mobile Pay">("Bank");
  
  const [purchaseSearch, setPurchaseSearch] = useState("");

  const suppliersList = [
    "Vortex Industrial Wholesalers",
    "Sterling Copper Ltd",
    "Apex Optical Cable Syndicate",
    "Standard Sealants & Adhesives Corp"
  ];

  // Calculations
  const targetProd = products.find(p => p.id === selectedProduct) || products[0];
  const itemPurchasePrice = purchasePriceOverride ? parseFloat(purchasePriceOverride) : (targetProd ? targetProd.purchasePrice : 50.0);
  const totalCost = itemPurchasePrice * purchaseQty;

  const totalPurchasesToday = transactions
    .filter(t => t.type === "purchase")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingReorderItems = products.filter(p => p.currentStock <= p.minRequiredStock);

  const handlePostPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProd) return;

    if (userRole === "general") {
      alert("Permission Blocked: General user credentials cannot post outward procurement journals.");
      return;
    }

    const title = `Purchase - Stock refill of ${targetProd.name} (x${purchaseQty}) from ${selectedSupplier}`;
    onAddTransaction({
      title,
      amount: totalCost,
      type: "purchase",
      category: targetProd.category,
      paymentMethod: purchasePaymentMethod
    });

    // Update stock levels!
    onReplenishStock(targetProd.id, purchaseQty);
    onAddLog("PURCHASE_ORDER_POSTED", `Procured ${purchaseQty} units of SKU ${targetProd.sku} for ₹${totalCost.toFixed(2)}`);

    // Reset overrides
    setPurchaseQty(10);
    setPurchasePriceOverride("");
    alert(`Success: Procurement validated. Added +${purchaseQty} units to ${targetProd.name} stock inventory.`);
  };

  const handleReplenishAllLowStock = () => {
    if (pendingReorderItems.length === 0) {
      alert("Stock levels are optimized. No reorder items found.");
      return;
    }
    if (userRole === "general") {
      alert("General user permission insufficient for bulk restocking operations.");
      return;
    }

    pendingReorderItems.forEach((p) => {
      const unitsToBuy = p.minRequiredStock * 2;
      const refCost = p.purchasePrice * unitsToBuy;
      onReplenishStock(p.id, unitsToBuy);
      onAddTransaction({
        title: `AutoProcure - Bulk reorder fill for SKU: ${p.sku} (x${unitsToBuy})`,
        amount: refCost,
        type: "purchase",
        category: p.category,
        paymentMethod: "Bank"
      });
    });

    onAddLog("BULK_REORDER_FULFILLED", `Refilled ${pendingReorderItems.length} warning items automatically.`);
    alert("Bulk restocking complete. Purchase journal logs written and stock layers augmented.");
  };

  const filteredPurchases = transactions.filter(t => 
    t.type === "purchase" && 
    (t.title.toLowerCase().includes(purchaseSearch.toLowerCase()) || 
     t.referenceNumber.toLowerCase().includes(purchaseSearch.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto pb-20 font-sans">
      <div className="mb-4">
        <h3 className={`text-base font-extrabold tracking-tight mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Procurement & Vendor Logs
        </h3>
        <p className="text-xs text-slate-500">Authorize purchase orders, update wholesale buy values & refill physical stock profiles</p>
      </div>

      {/* Top action cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`p-3.5 rounded-[20px] border flex flex-col justify-between ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-indigo-50/20 border-indigo-100"
        }`}>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Outflow Today</span>
          <div className="mt-1.5">
            <span className={`text-base font-extrabold ${isDark ? 'text-indigo-400' : 'text-indigo-850'}`}>
              ₹{totalPurchasesToday.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[8px] text-slate-400 mt-1">Authorized Ledger Sum</span>
        </div>

        <div className={`p-3.5 rounded-[20px] border flex flex-col justify-between ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-amber-50/25 border-amber-100"
        }`}>
          <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3 animate-ping" /> Deficient items
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-extrabold text-amber-600 font-mono">
              {pendingReorderItems.length} Items
            </span>
            {pendingReorderItems.length > 0 && (
              <button
                onClick={handleReplenishAllLowStock}
                className="text-[8px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-sm hover:bg-amber-600 transition-colors uppercase cursor-pointer"
              >
                Refill All
              </button>
            )}
          </div>
          <span className="text-[8px] text-slate-400 mt-1 leading-none">Below safe-limits threshold</span>
        </div>
      </div>

      {/* Purchase order form */}
      <div className={`p-4 rounded-[24px] border mb-5 ${
        isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100 shadow-xs"
      }`}>
        <span className="text-[9px] p-1 px-2 mb-3 inline-block rounded-full bg-indigo-500/10 text-indigo-500 font-extrabold uppercase tracking-widest">
          🛡️ Vendor Buy Order
        </span>

        <form onSubmit={handlePostPurchase} className="space-y-3">
          {/* Select Stock item */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product to restock</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className={`w-full py-2.5 px-3 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Cur. Stock: {p.currentStock} - Min limit: {p.minRequiredStock})
                </option>
              ))}
            </select>
          </div>

          {/* Supplier and override pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Units to buy</label>
              <input
                type="number"
                min={1}
                required
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-full py-2 px-3 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono ${
                  isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier Source</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className={`w-full py-2 px-3 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                {suppliersList.map(sup => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
            </div>
          </div>

          {/* wholesale override */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Wholesale Unit Price Override (₹) <span className="text-[8px] text-slate-500">(Leave blank to use defaults)</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={`Standard: ₹${targetProd ? targetProd.purchasePrice.toFixed(2) : '50.00'}`}
              value={purchasePriceOverride}
              onChange={(e) => setPurchasePriceOverride(e.target.value)}
              className={`w-full py-2 px-3 text-xs rounded-xl border outline-none ${
                isDark ? "bg-slate-950 border-slate-855 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>

          {/* Payment Method Option */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Payment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Cash", "Bank", "Mobile Pay"] as const).map((pay) => (
                <button
                  key={pay}
                  type="button"
                  onClick={() => setPurchasePaymentMethod(pay)}
                  className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    purchasePaymentMethod === pay 
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" 
                      : (isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-650")
                  }`}
                >
                  {pay}
                </button>
              ))}
            </div>
          </div>

          {/* Cost Preview Panel */}
          <div className={`p-3 text-[10.5px] font-mono text-center rounded-xl ${
            isDark ? "bg-slate-950 text-slate-400" : "bg-slate-50 text-slate-650"
          }`}>
            <span>Total Debited Cost:</span>{" "}
            <strong className="text-indigo-400 text-xs">₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-99 transition-transform text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/15"
          >
            <ShoppingBag className="w-4 h-4" />
            Commit Order & Augment Stock
          </button>
        </form>
      </div>

      {/* Historical Purchases */}
      <div className={`p-4 rounded-[24px] border ${
        isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100 shadow-xs"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-800"}`}>
            Procurements Outward ledger ({filteredPurchases.length})
          </h4>
          <span className="text-[8.5px] font-mono text-slate-500">Order archives</span>
        </div>

        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search custom purchase receipts..."
            value={purchaseSearch}
            onChange={(e) => setPurchaseSearch(e.target.value)}
            className={`w-full py-1.5 pl-9 pr-4 text-[10.5px] rounded-xl border outline-none ${
              isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          />
        </div>

        <div className="space-y-2">
          {filteredPurchases.map((ph) => (
            <div key={ph.id} className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
              isDark ? "bg-slate-950/60 border-slate-850 text-slate-400" : "bg-slate-50/50 border-slate-150"
            }`}>
              <div className="min-w-0 flex-1 pr-1.5">
                <p className={`font-semibold truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>{ph.title}</p>
                <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 font-mono mt-0.5">
                  <span className="text-indigo-400 font-bold">{ph.referenceNumber}</span>
                  <span>•</span>
                  <span>{ph.paymentMethod}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-extrabold text-red-400">-₹{ph.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="text-[8px] text-slate-500 font-semibold block">{new Date(ph.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {filteredPurchases.length === 0 && (
            <div className="text-center py-5 text-[11px] text-slate-450">No purchasing outflows found matching search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
