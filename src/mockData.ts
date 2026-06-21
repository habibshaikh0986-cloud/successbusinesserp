import { ProductModel, TransactionModel, SystemLogModel } from "./types";

export const initialProducts: ProductModel[] = [
  {
    id: "prod-1",
    sku: "CMT-53G",
    name: "UltraTech Cement Grade 53",
    currentStock: 120,
    minRequiredStock: 25,
    purchasePrice: 340.0,
    retailPrice: 420.0,
    category: "Building Materials"
  },
  {
    id: "prod-2",
    sku: "STL-12MM",
    name: "TMT Steel Rods 12mm",
    currentStock: 80,
    minRequiredStock: 15,
    purchasePrice: 512.00,
    retailPrice: 620.00,
    category: "Steel & Iron"
  },
  {
    id: "prod-3",
    sku: "WRE-15C",
    name: "Polycab 1.5 Sqmm Copper Wire Coil",
    currentStock: 45,
    minRequiredStock: 10,
    purchasePrice: 950.00,
    retailPrice: 1250.00,
    category: "Electricals"
  },
  {
    id: "prod-4",
    sku: "PLV-BV4",
    name: "Finolex Brass Gate Valve 4 inch",
    currentStock: 30,
    minRequiredStock: 8,
    purchasePrice: 450.0,
    retailPrice: 580.0,
    category: "Plumbing"
  },
  {
    id: "prod-5",
    sku: "PVC-WP4",
    name: "Supreme PVC Water Pipe 4\" (6m)",
    currentStock: 95,
    minRequiredStock: 20,
    purchasePrice: 210.0,
    retailPrice: 290.0,
    category: "Plumbing"
  }
];

export const initialTransactions: TransactionModel[] = [
  {
    id: "tx-init-1",
    title: "Sale - UltraTech Cement Grade 53 (x10) to Alpha Hardware Traders",
    amount: 4200.00,
    type: "sale",
    category: "Building Materials",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    referenceNumber: "INV-2026-101",
    loggedBy: "Alexander Sterling (ADMIN)",
    paymentMethod: "Bank"
  },
  {
    id: "tx-init-2",
    title: "Sale - TMT Steel Rods 12mm (x5) to Dev & Sons Builders",
    amount: 3100.00,
    type: "sale",
    category: "Steel & Iron",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    referenceNumber: "INV-2026-102",
    loggedBy: "Marcus Lane (GENERAL)",
    paymentMethod: "Cash"
  }
];

export const initialLogs: SystemLogModel[] = [
  {
    id: "log-initial-empty",
    action: "ERP_LEDS_INITIALIZED",
    details: "Compliance general database loaded with 5 high-demand default SKUs and active inventory counts.",
    role: "admin",
    timestamp: new Date().toISOString(),
  }
];


