import React, { useState } from "react";
import { 
  Package, Search, Plus, Filter, RefreshCw, Pencil, DollarSign, 
  Trash2, Eye, ShieldAlert, BadgeInfo, X, Check
} from "lucide-react";
import { ProductModel, UserRole } from "../types";

interface InventoryViewProps {
  products: ProductModel[];
  onReplenishStock: (id: string, qty: number) => void;
  onUpdatePrice: (id: string, newRetail: number) => void;
  onAddProduct: (newProd: Omit<ProductModel, "id">) => void;
  isDark: boolean;
  onAddLog: (action: string, details: string) => void;
  userRole: UserRole;
}

export default function InventoryView({
  products,
  onReplenishStock,
  onUpdatePrice,
  onAddProduct,
  isDark,
  onAddLog,
  userRole
}: InventoryViewProps) {
  // Filters & searches
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // New Product Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Hardware");
  const [newStock, setNewStock] = useState("");
  const [newMinStock, setNewMinStock] = useState("");
  const [newPurchasePrice, setNewPurchasePrice] = useState("");
  const [newRetailPrice, setNewRetailPrice] = useState("");

  const categories = ["All", "Hardware", "Cables", "Consumables", "Filter Systems"];

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName || !newStock || !newPurchasePrice || !newRetailPrice) {
      alert("Please fill out all product information fields.");
      return;
    }

    if (userRole === "general") {
      alert("Access Blocked: General users are restricted from writing new SKU listings.");
      return;
    }

    onAddProduct({
      sku: newSku.toUpperCase().trim(),
      name: newName.trim(),
      category: newCategory,
      currentStock: parseInt(newStock) || 0,
      minRequiredStock: parseInt(newMinStock) || 5,
      purchasePrice: parseFloat(newPurchasePrice) || 10.0,
      retailPrice: parseFloat(newRetailPrice) || 15.0,
    });

    onAddLog("PRODUCT_SKU_CREATED", `Added new product ${newSku.toUpperCase()} - ${newName}`);
    
    // Reset Form
    setNewSku("");
    setNewName("");
    setNewStock("");
    setNewMinStock("");
    setNewPurchasePrice("");
    setNewRetailPrice("");
    setShowAddForm(false);
    
    alert(`Success: Product added into ERP Ledger registry!`);
  };

  const handleEditPricePrompt = (prod: ProductModel) => {
    if (userRole === "general" || userRole === "accountant") {
      alert("Permission Blocked: Only Administrator can override pricing metrics!");
      return;
    }
    const newPrice = prompt(`Enter new retail rate for ${prod.name}:`, prod.retailPrice.toString());
    if (newPrice && !isNaN(Number(newPrice))) {
      onUpdatePrice(prod.id, parseFloat(newPrice));
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || prod.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalWarehouseStockCount = products.reduce((sum, p) => sum + p.currentStock, 0);

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto pb-20 font-sans">
      <div className="mb-4">
        <h3 className={`text-base font-extrabold tracking-tight mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Warehouse Stock Registry
        </h3>
        <p className="text-xs text-slate-500">Monitor industrial item metrics, track minimum reserves & configure retail matrices</p>
      </div>

      {/* Aggregate Widget */}
      <div className={`p-4 rounded-[20px] border mb-4 flex items-center justify-between ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-purple-50/30 border-purple-100"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 ml-1 rounded-xl bg-purple-500/10 text-purple-500">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Total Warehoused Count</span>
            <span className={`text-lg font-black ${isDark ? "text-purple-400" : "text-purple-900"}`}>
              {totalWarehouseStockCount.toLocaleString()} Units
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            if (userRole === "general") {
              alert("General users cannot define new ERP items.");
              return;
            }
            setShowAddForm(true);
          }}
          className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] uppercase rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> New Item
        </button>
      </div>

      {/* Categories Horizontal Pills view */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
              selectedCategory === cat
                ? "bg-purple-600 text-white shadow-xs"
                : (isDark ? "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white" : "bg-slate-50 border border-slate-150 text-slate-500 hover:bg-slate-100")
            }`}
          >
            {cat}s
          </button>
        ))}
      </div>

      {/* Search Input filter */}
      <div className="relative mb-4">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Filter by SKU or item specification..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full py-2.5 pl-9 pr-4 text-xs rounded-xl border outline-none ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900"
          }`}
        />
      </div>

      {/* Items List */}
      <div className="space-y-3.5">
        {filteredProducts.map((prod) => {
          const isLow = prod.currentStock <= prod.minRequiredStock;
          return (
            <div key={prod.id} className={`p-4 rounded-[20px] border flex flex-col justify-start relative ${
              isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100 shadow-xs"
            }`}>
              
              {/* Product header info */}
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <span className="text-[8.5px] font-mono uppercase bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded font-black">
                    {prod.category}
                  </span>
                  <h4 className={`text-xs font-bold mt-1.5 tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    {prod.name}
                  </h4>
                  <span className="text-[9px] text-slate-500 font-mono">SKU ID: {prod.sku}</span>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-black ${isLow ? "text-amber-500 animate-pulse" : "text-slate-400"}`}>
                    STOCK: {prod.currentStock}
                  </span>
                  <p className="text-[8px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">Min reserve: {prod.minRequiredStock}</p>
                </div>
              </div>

              {/* Buying / Selling Prices */}
              <div className="grid grid-cols-2 gap-3.5 py-2.5 border-t border-b border-slate-850/5 mt-1 text-[11px] leading-snug">
                <div>
                  <span className="text-[8.5px] uppercase text-slate-500 font-bold block">Wholesale Base</span>
                  <span className={`font-mono font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    ₹{prod.purchasePrice.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[8.5px] uppercase text-slate-500 font-bold block">Retail Price Matrix</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-purple-500">₹{prod.retailPrice.toFixed(2)}</span>
                    {userRole !== "general" && userRole !== "accountant" && (
                      <button
                        onClick={() => handleEditPricePrompt(prod)}
                        className="text-[9px] text-slate-400 hover:text-purple-400 hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <Pencil className="w-2.5 h-2.5" /> Matrix
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Operations direct reorder */}
              <div className="mt-2.5 pt-1 flex justify-between items-center">
                {isLow ? (
                  <span className="text-[8.5px] bg-amber-500/10 text-amber-500 font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-3 h-3" /> Reorder Suggested
                  </span>
                ) : (
                  <span className="text-[8.5px] bg-green-500/10 text-green-500 font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Stock Stable
                  </span>
                )}
                
                <button
                  onClick={() => {
                    onReplenishStock(prod.id, 15);
                    onAddLog("INBOUND_REORDER", `Replenished standard +15 wholesale cases of ${prod.name}`);
                    alert(`Fulfilling Procurement order of +15 Units directly to ${prod.name}.`);
                  }}
                  className="px-2.5 py-1 text-[9px] font-bold text-white bg-purple-600 hover:bg-purple-700 cursor-pointer rounded-lg"
                >
                  Procure +15 Case
                </button>
              </div>

            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-xs text-slate-400">
            No warehoused goods correspond to filtered search criteria.
          </div>
        )}
      </div>

      {/* Expandable sliding form to register NEW SKU (Modal) */}
      {showAddForm && (
        <div className="fixed inset-0 z-55 flex items-end bg-slate-950/80 backdrop-blur-xs">
          <div className={`w-full max-h-[85%] rounded-t-3xl border-t p-6 pb-8 overflow-y-auto ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-extrabold tracking-tight">Create SKU Asset Card</h4>
                <p className="text-xs text-slate-400">Register new incoming wholesale materials</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-full hover:bg-slate-800/15"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU Unique Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SKU-COP-313"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className={`w-full py-2 px-3 text-xs rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={`w-full py-2 px-3 text-xs rounded-xl border outline-none ${
                      isDark ? "bg-slate-955 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Cables">Cables</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Filter Systems">Filter Systems</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Title Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Elbow joints 2\"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full py-2 px-3 text-xs rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Stock</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className={`w-full py-2 px-3 text-xs rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min reserve limit</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(e.target.value)}
                    className={`w-full py-2 px-3 text-xs rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wholesale Unit Buy (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 15.00"
                    value={newPurchasePrice}
                    onChange={(e) => setNewPurchasePrice(e.target.value)}
                    className={`w-full py-2 px-3 text-xs rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retail Unit Sell (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 24.99"
                    value={newRetailPrice}
                    onChange={(e) => setNewRetailPrice(e.target.value)}
                    className={`w-full py-2 px-3 text-xs rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl border ${
                    isDark ? "border-slate-800 text-slate-450" : "border-slate-200 text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save SKU Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
