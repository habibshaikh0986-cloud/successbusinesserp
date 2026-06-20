export type UserRole = "admin" | "accountant" | "general";

export interface UserModel {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  isEmailVerified: boolean;
  pinCode?: string;
  isBiometricEnabled?: boolean;
  password?: string;
  isApproved?: boolean;
}

export type TransactionType = "sale" | "purchase" | "expense";

export interface TransactionModel {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  timestamp: string; // ISO string
  referenceNumber: string;
  loggedBy: string;
  paymentMethod: "Cash" | "Bank" | "Mobile Pay";
}

export interface ProductModel {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  minRequiredStock: number;
  purchasePrice: number;
  retailPrice: number;
  category: string;
}

export interface SystemLogModel {
  id: string;
  action: string;
  details: string;
  role: UserRole;
  timestamp: string;
}

export type CustomerStatus = "Active" | "Inactive" | "Blocked";

export type CustomerType = "Retail" | "Wholesale" | "Distributor" | "Dealer" | "Online Customer" | "Walk-in Customer";

export interface CustomerModel {
  id: string;
  name: string;
  mobile: string;
  whatsApp?: string;
  email?: string;
  gstNo?: string;
  panNo?: string;
  aadhaarNo?: string;
  businessName?: string;
  businessCategory?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  openingBalance: number;
  creditLimit: number;
  paymentTerms?: string;
  status: CustomerStatus;
  customerType: CustomerType;
  profilePhoto?: string;
  gstCertificate?: string;
  panCard?: string;
  tradeLicense?: string;
  notes?: string;
  createdAt: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  invoiceNo?: string;
  description: string;
  type: "sale" | "payment" | "return" | "credit_note" | "debit_note" | "opening";
  debit: number;
  credit: number;
  balance: number;
}

export interface CustomerCommunication {
  id: string;
  customerId: string;
  date: string;
  type: "Email" | "SMS" | "WhatsApp" | "Call";
  subject: string;
  details: string;
}

export interface CustomerNotification {
  id: string;
  customerId?: string;
  type: "due" | "credit" | "birthday" | "anniversary" | "offer";
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

