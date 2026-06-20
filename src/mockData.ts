import { ProductModel, TransactionModel, SystemLogModel } from "./types";

export const initialProducts: ProductModel[] = [];

export const initialTransactions: TransactionModel[] = [];

export const initialLogs: SystemLogModel[] = [
  {
    id: "log-initial-empty",
    action: "ERP_LEDS_CLEARED",
    details: "All dummy transactions, user logs, and inventories cleared by the authorized signee.",
    role: "admin",
    timestamp: new Date().toISOString(),
  }
];

