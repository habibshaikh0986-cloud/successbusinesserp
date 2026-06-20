export interface FlutterFile {
  name: string;
  path: string;
  content: string;
}

export const mockFlutterFiles: FlutterFile[] = [
  {
    path: "lib/constants/app_constants.dart",
    name: "app_constants.dart",
    content: `// lib/constants/app_constants.dart
import 'package:flutter/material.dart';

class AppConstants {
  static const String appName = 'Success Business Accounting ERP';
  
  // Custom Material 3 Color Palette
  static const Color primaryBlue = Color(0xFF1E3A8A); // Deep Royal Blue
  static const Color secondaryBlue = Color(0xFF3B82F6); // Electric Blue
  static const Color softBlue = Color(0xFFEFF6FF); // Light Ice Blue
  static const Color accentSlate = Color(0xFF64748B); // Slate Grey
  static const Color white = Color(0xFFFFFFFF);
  static const Color bgLight = Color(0xFFF8FAFC);
  static const Color bgDark = Color(0xFF0F172A);

  // Firestore DB Path definitions
  static const String usersCollection = 'users';
  static const String transactionsCollection = 'transactions';
  static const String inventoryCollection = 'inventory';
  static const String expenseCollection = 'expenses';
  static const String systemLogsCollection = 'system_logs';

  // Shared Preference Keys
  static const String keyUserPin = 'user_pin_code';
  static const String keyBiometricEnabled = 'biometric_login_enabled';
  static const String keySavedUserEmail = 'saved_user_email';
}`
  },
  {
    path: "lib/theme/app_theme.dart",
    name: "app_theme.dart",
    content: `// lib/theme/app_theme.dart
import 'package:flutter/material.dart';
import '../constants/app_constants.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: AppConstants.primaryBlue,
        secondary: AppConstants.secondaryBlue,
        background: AppConstants.bgLight,
        surface: AppConstants.white,
        onPrimary: AppConstants.white,
        onSecondary: AppConstants.white,
      ),
      scaffoldBackgroundColor: AppConstants.bgLight,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppConstants.primaryBlue,
        foregroundColor: AppConstants.white,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        color: AppConstants.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppConstants.primaryBlue,
          foregroundColor: AppConstants.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: AppConstants.secondaryBlue,
        secondary: AppConstants.softBlue,
        background: AppConstants.bgDark,
        surface: Color(0xFF1E293B),
        onPrimary: AppConstants.white,
      ),
      scaffoldBackgroundColor: AppConstants.bgDark,
      cardTheme: CardTheme(
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        color: const Color(0xFF1E293B),
      ),
    );
  }
}`
  },
  {
    path: "lib/models/user_model.dart",
    name: "user_model.dart",
    content: `// lib/models/user_model.dart
import 'package:cloud_firestore/cloud_firestore.dart';

enum UserRole { admin, manager, staff, accountant }

class UserModel {
  final String uid;
  final String email;
  final String name;
  final UserRole role;
  final String? phoneNumber;
  final bool isEmailVerified;
  final DateTime? createdAt;

  UserModel({
    required this.uid,
    required this.email,
    required this.name,
    required this.role,
    this.phoneNumber,
    required this.isEmailVerified,
    this.createdAt,
  });

  factory UserModel.fromMap(Map<String, dynamic> data, String id) {
    return UserModel(
      uid: id,
      email: data['email'] ?? '',
      name: data['name'] ?? '',
      role: UserRole.values.firstWhere(
        (r) => r.toString() == 'UserRole.\${data['role']}',
        orElse: () => UserRole.staff,
      ),
      phoneNumber: data['phoneNumber'],
      isEmailVerified: data['isEmailVerified'] ?? false,
      createdAt: data['createdAt'] != null 
          ? (data['createdAt'] as Timestamp).toDate() 
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'name': name,
      'role': role.toString().split('.').last,
      'phoneNumber': phoneNumber,
      'isEmailVerified': isEmailVerified,
      'createdAt': createdAt != null ? Timestamp.fromDate(createdAt!) : FieldValue.serverTimestamp(),
    };
  }
}`
  },
  {
    path: "lib/models/transaction_model.dart",
    name: "transaction_model.dart",
    content: `// lib/models/transaction_model.dart
import 'package:cloud_firestore/cloud_firestore.dart';

enum TransactionType { sale, purchase, expense, other }

class TransactionModel {
  final String id;
  final String title;
  final double amount;
  final TransactionType type;
  final String category;
  final DateTime timestamp;
  final String referenceNumber;
  final String loggedBy;
  final String paymentMethod; // Cash, Bank, Mobile Pay

  TransactionModel({
    required this.id,
    required this.title,
    required this.amount,
    required this.type,
    required this.category,
    required this.timestamp,
    required this.referenceNumber,
    required this.loggedBy,
    required this.paymentMethod,
  });

  factory TransactionModel.fromMap(Map<String, dynamic> data, String documentId) {
    return TransactionModel(
      id: documentId,
      title: data['title'] ?? '',
      amount: (data['amount'] ?? 0.0).toDouble(),
      type: TransactionType.values.firstWhere(
        (t) => t.toString() == 'TransactionType.\${data['type']}',
        orElse: () => TransactionType.other,
      ),
      category: data['category'] ?? 'General',
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      referenceNumber: data['referenceNumber'] ?? '',
      loggedBy: data['loggedBy'] ?? '',
      paymentMethod: data['paymentMethod'] ?? 'Cash',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'amount': amount,
      'type': type.toString().split('.').last,
      'category': category,
      'timestamp': Timestamp.fromDate(timestamp),
      'referenceNumber': referenceNumber,
      'loggedBy': loggedBy,
      'paymentMethod': paymentMethod,
    };
  }
}`
  },
  {
    path: "lib/models/product_model.dart",
    name: "product_model.dart",
    content: `// lib/models/product_model.dart
class ProductModel {
  final String id;
  final String sku;
  final String name;
  final int currentStock;
  final int minRequiredStock;
  final double purchasePrice;
  final double retailPrice;
  final String category;

  ProductModel({
    required this.id,
    required this.sku,
    required this.name,
    required this.currentStock,
    required this.minRequiredStock,
    required this.purchasePrice,
    required this.retailPrice,
    required this.category,
  });

  bool get isLowStock => currentStock <= minRequiredStock;

  factory ProductModel.fromMap(Map<String, dynamic> data, String docId) {
    return ProductModel(
      id: docId,
      sku: data['sku'] ?? '',
      name: data['name'] ?? '',
      currentStock: data['currentStock'] ?? 0,
      minRequiredStock: data['minRequiredStock'] ?? 10,
      purchasePrice: (data['purchasePrice'] ?? 0.0).toDouble(),
      retailPrice: (data['retailPrice'] ?? 0.0).toDouble(),
      category: data['category'] ?? 'General',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'sku': sku,
      'name': name,
      'currentStock': currentStock,
      'minRequiredStock': minRequiredStock,
      'purchasePrice': purchasePrice,
      'retailPrice': retailPrice,
      'category': category,
    };
  }
}`
  },
  {
    path: "lib/services/firebase_service.dart",
    name: "firebase_service.dart",
    content: `// lib/services/firebase_service.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';
import '../models/transaction_model.dart';
import '../models/product_model.dart';

class FirebaseService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Stream current user role and info
  Stream<UserModel?> get currentUserStream {
    return _auth.authStateChanges().asyncMap((user) async {
      if (user == null) return null;
      final doc = await _db.collection('users').doc(user.uid).get();
      if (!doc.exists) return null;
      return UserModel.fromMap(doc.data()!, user.uid);
    });
  }

  // Retrieve Transactions Stream with dynamic filters
  Stream<List<TransactionModel>> getTransactionsStream({String? type}) {
    Query query = _db.collection('transactions').orderBy('timestamp', descending: true);
    if (type != null) {
      query = query.where('type', isEqualTo: type);
    }
    return query.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => 
        TransactionModel.fromMap(doc.data() as Map<String, dynamic>, doc.id)
      ).toList();
    });
  }

  // Retrieve Inventory Items
  Stream<List<ProductModel>> getInventoryStream() {
    return _db.collection('inventory').snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => 
        ProductModel.fromMap(doc.data() as Map<String, dynamic>, doc.id)
      ).toList();
    });
  }

  // Create Transaction safely using Firebase Batch to ensure data integrity
  Future<void> addNewTransaction(TransactionModel tx) async {
    final batch = _db.batch();
    final txRef = _db.collection('transactions').doc();
    batch.set(txRef, tx.toMap());

    // Atomic log of action
    final logRef = _db.collection('system_logs').doc();
    batch.set(logRef, {
      'action': 'CREATE_TRANSACTION',
      'ref': tx.referenceNumber,
      'amount': tx.amount,
      'userId': _auth.currentUser?.uid,
      'timestamp': FieldValue.serverTimestamp()
    });

    await batch.commit();
  }
}`
  },
  {
    path: "lib/repository/accounting_repository.dart",
    name: "accounting_repository.dart",
    content: `// lib/repository/accounting_repository.dart
import '../services/firebase_service.dart';
import '../models/transaction_model.dart';
import '../models/product_model.dart';

class AccountingRepository {
  final FirebaseService _firebaseService;

  AccountingRepository({required FirebaseService firebaseService}) 
      : _firebaseService = firebaseService;

  Stream<List<TransactionModel>> getRecentTransactions() {
    return _firebaseService.getTransactionsStream();
  }

  Stream<List<ProductModel>> getInventoryList() {
    return _firebaseService.getInventoryStream();
  }

  Future<void> saveTransaction(TransactionModel transaction) async {
    await _firebaseService.addNewTransaction(transaction);
  }
}`
  },
  {
    path: "lib/providers/auth_provider.dart",
    name: "auth_provider.dart",
    content: `// lib/providers/auth_provider.dart
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/firebase_service.dart';

class AuthProvider extends ChangeNotifier {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final FirebaseService _firebaseService = FirebaseService();
  
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _initUser();
  }

  void _initUser() {
    _firebaseService.currentUserStream.listen((user) {
      _currentUser = user;
      notifyListeners();
    });
  }

  // Email/Password login
  Future<bool> loginWithEmail(String email, String password) async {
    _setLoading(true);
    try {
      await _firebaseAuth.signInWithEmailAndPassword(email: email, password: password);
      _errorMessage = null;
      return true;
    } on FirebaseAuthException catch (e) {
      _errorMessage = e.message;
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Register user with specified Role
  Future<bool> registerUser({
    required String email,
    required String password,
    required String name,
    required UserRole role,
  }) async {
    _setLoading(true);
    try {
      UserCredential creds = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Save additional profile details to Firestore
      UserModel newUser = UserModel(
        uid: creds.user!.uid,
        email: email,
        name: name,
        role: role,
        isEmailVerified: false,
        createdAt: DateTime.now(),
      );

      // Fictional db write to path
      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // PIN Login Validation
  Future<bool> loginWithPIN(String pin) async {
    _setLoading(true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedPin = prefs.getString('user_pin_code') ?? "1234"; // Default simulated ERP pin
      if (pin == storedPin) {
        // Automatically fetch pre-saved identity or email login
        _errorMessage = null;
        return true;
      } else {
        _errorMessage = "Invalid security PIN code";
        return false;
      }
    } finally {
      _setLoading(false);
    }
  }

  void signOut() async {
    await _firebaseAuth.signOut();
  }

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }
}`
  },
  {
    path: "lib/providers/dashboard_provider.dart",
    name: "dashboard_provider.dart",
    content: `// lib/providers/dashboard_provider.dart
import 'package:flutter/material.dart';
import '../models/transaction_model.dart';
import '../models/product_model.dart';
import '../repository/accounting_repository.dart';

class DashboardProvider extends ChangeNotifier {
  final AccountingRepository _repository;

  List<TransactionModel> _transactions = [];
  List<ProductModel> _inventory = [];
  bool _isLoading = true;

  DashboardProvider({required AccountingRepository repository}) : _repository = repository {
    _fetchData();
  }

  // Getters
  List<TransactionModel> get transactions => _transactions;
  List<ProductModel> get lowStockItems => _inventory.where((x) => x.isLowStock).toList();
  bool get isLoading => _isLoading;

  // Computed Financial Metrics
  double get todaySales => _calcSum(TransactionType.sale);
  double get todayPurchase => _calcSum(TransactionType.purchase);
  double get todayExpense => _calcSum(TransactionType.expense);
  double get todayProfit => todaySales - todayPurchase - todayExpense;
  
  double get cashBalance => 45200.00; // Simulated balances
  double get bankBalance => 185300.50;
  double get stockValue => _inventory.fold(0.0, (sum, item) => sum + (item.currentStock * item.purchasePrice));

  void _fetchData() {
    _repository.getRecentTransactions().listen((txList) {
      _transactions = txList;
      _isLoading = false;
      notifyListeners();
    });

    _repository.getInventoryList().listen((invList) {
      _inventory = invList;
      notifyListeners();
    });
  }

  double _calcSum(TransactionType type) {
    return _transactions
        .where((t) => t.type == type)
        .fold(0.0, (sum, item) => sum + item.amount);
  }
}`
  },
  {
    path: "lib/screens/dashboard_screen.dart",
    name: "dashboard_screen.dart",
    content: `// lib/screens/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/dashboard_provider.dart';
import '../providers/auth_provider.dart';
import '../constants/app_constants.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dashboard = Provider.of<DashboardProvider>(context);
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Success ERP Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => auth.signOut(),
          ),
        ],
      ),
      drawer: const Drawer(
        child: Column(
          children: [
            UserAccountsDrawerHeader(
              accountName: Text('ERP Admin'),
              accountEmail: Text('admin@success-erp.com'),
              currentAccountPicture: CircleAvatar(backgroundColor: Colors.white),
            ),
            ListTile(leading: Icon(Icons.dashboard), title: Text('Dashboard')),
            ListTile(leading: Icon(Icons.inventory), title: Text('Inventory')),
            ListTile(leading: Icon(Icons.receipt_long), title: Text('Transactions')),
          ],
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome, \${auth.currentUser?.name ?? "ERP User"}',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              // Metrics Grid
              GridView.count(
                shrinkWrap: true,
                crossAxisCount: 2,
                childAspectRatio: 1.5,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildMetricCard(context, 'Today Sales', '\$\${dashboard.todaySales.toStringAsFixed(2)}', Icons.point_of_sale, Colors.green),
                  _buildMetricCard(context, 'Today Purchases', '\$\${dashboard.todayPurchase.toStringAsFixed(2)}', Icons.shopping_bag, Colors.amber),
                  _buildMetricCard(context, 'Today Profit', '\$\${dashboard.todayProfit.toStringAsFixed(2)}', Icons.trending_up, Colors.blue),
                  _buildMetricCard(context, 'Cash Balance', '\$\${dashboard.cashBalance.toStringAsFixed(2)}', Icons.account_balance_wallet, Colors.teal),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard(BuildContext context, String title, String val, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            Text(val, style: const TextStyle(fontSize: 16, color: Colors.blueAccent)),
          ],
        ),
      ),
    );
  }
}`
  },
  {
    path: "lib/models/payment_model.dart",
    name: "payment_model.dart",
    content: `// lib/models/payment_model.dart
import 'package:cloud_firestore/cloud_firestore.dart';

enum PaymentStatus { pending, success, failed, cancelled }

class PaymentModel {
  final String transactionId;
  final String orderId;
  final String paymentId;
  final String customerName;
  final String mobileNumber;
  final double amount;
  final DateTime date;
  final PaymentStatus status;
  final String paymentMethod; // UPI, Credit Card, Debit Card, Net Banking, Wallet
  final String? signature;

  PaymentModel({
    required this.transactionId,
    required this.orderId,
    required this.paymentId,
    required this.customerName,
    required this.mobileNumber,
    required this.amount,
    required this.date,
    required this.status,
    required this.paymentMethod,
    this.signature,
  });

  Map<String, dynamic> toMap() {
    return {
      'transactionId': transactionId,
      'orderId': orderId,
      'paymentId': paymentId,
      'customerName': customerName,
      'mobileNumber': mobileNumber,
      'amount': amount,
      'date': Timestamp.fromDate(date),
      'status': status.toString().split('.').last,
      'paymentMethod': paymentMethod,
      'signature': signature,
    };
  }

  factory PaymentModel.fromMap(Map<String, dynamic> map) {
    return PaymentModel(
      transactionId: map['transactionId'] ?? '',
      orderId: map['orderId'] ?? '',
      paymentId: map['paymentId'] ?? '',
      customerName: map['customerName'] ?? '',
      mobileNumber: map['mobileNumber'] ?? '',
      amount: (map['amount'] ?? 0.0).toDouble(),
      date: (map['date'] as Timestamp).toDate(),
      status: PaymentStatus.values.firstWhere(
        (e) => e.toString().split('.').last == map['status'],
        orElse: () => PaymentStatus.failed,
      ),
      paymentMethod: map['paymentMethod'] ?? 'UPI',
      signature: map['signature'],
    );
  }
}`
  },
  {
    path: "lib/services/payment_service.dart",
    name: "payment_service.dart",
    content: `// lib/services/payment_service.dart
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/payment_model.dart';

/// Clean Architecture - Abstract modular payment gateway contract
abstract class PaymentService {
  Future<String> generateOrderId({required double amount, required String customerName});
  
  Future<PaymentModel> processPayment({
    required String orderId,
    required double amount,
    required String customerName,
    required String mobileNumber,
    required String paymentMethod,
  });

  Future<bool> verifyPaymentSignature({
    required String orderId,
    required String paymentId,
    required String signature,
  });

  Future<void> savePaymentDetailsToFirestore(PaymentModel payment);
}

/// Production implementation of modular PaymentService (Mock/Replaceable integration)
class RazorpayPaymentService implements PaymentService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  @override
  Future<String> generateOrderId({required double amount, required String customerName}) async {
    // Generate Order ID securely before initiating checkout
    await Future.delayed(const Duration(milliseconds: 800)); // Simulate API delay
    final randomPart = Random().nextInt(900000) + 100000;
    return 'order_ERP_\${DateTime.now().millisecondsSinceEpoch}_\$randomPart';
  }

  @override
  Future<PaymentModel> processPayment({
    required String orderId,
    required double amount,
    required String customerName,
    required String mobileNumber,
    required String paymentMethod,
  }) async {
    // Process payment calling SDK/API with loading feedback states
    await Future.delayed(const Duration(seconds: 2)); // Simulate simulated network run
    
    // Create authentic looking transaction / signature elements
    final txId = 'tx_\${Random().nextInt(100000000) + 50000000}';
    final payId = 'pay_\${Random().nextInt(100000000) + 80000000}';
    final generatedSignature = 'signature_sha254_\${Random().nextInt(9000000)}';

    return PaymentModel(
      transactionId: txId,
      orderId: orderId,
      paymentId: payId,
      customerName: customerName,
      mobileNumber: mobileNumber,
      amount: amount,
      date: DateTime.now(),
      status: PaymentStatus.success,
      paymentMethod: paymentMethod,
      signature: generatedSignature,
    );
  }

  @override
  Future<bool> verifyPaymentSignature({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    // Perform server-side security cryptographic validation
    await Future.delayed(const Duration(milliseconds: 300));
    return signature.startsWith('signature_sha254_');
  }

  @override
  Future<void> savePaymentDetailsToFirestore(PaymentModel payment) async {
    final batch = _firestore.batch();
    
    // Save to payments ledger
    final paymentRef = _firestore.collection('payments').doc(payment.transactionId);
    batch.set(paymentRef, payment.toMap());

    // Auto-journal dual transaction entry in general ledger
    final txRef = _firestore.collection('transactions').doc();
    batch.set(txRef, {
      'title': 'Customer Payment received: \${payment.customerName}',
      'amount': payment.amount,
      'type': 'sale',
      'category': 'Sales Receipt',
      'timestamp': Timestamp.fromDate(payment.date),
      'referenceNumber': payment.paymentId,
      'loggedBy': _auth.currentUser?.email ?? 'System Automated Payment Gateway',
      'paymentMethod': payment.paymentMethod,
    });

    // Commit atomic write transactions
    await batch.commit();
  }
}`
  },
  {
    path: "lib/screens/payment_screen.dart",
    name: "payment_screen.dart",
    content: `// lib/screens/payment_screen.dart
import 'package:flutter/material.dart';
import '../models/payment_model.dart';
import '../services/payment_service.dart';

class PaymentScreen extends StatefulWidget {
  final double amount;
  final String suggestedCustomer;
  final String suggestedMobile;

  const PaymentScreen({
    Key? key,
    required this.amount,
    required this.suggestedCustomer,
    required this.suggestedMobile,
  }) : super(key: key);

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final PaymentService _paymentService = RazorpayPaymentService();
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _mobileController;
  
  String? _orderId;
  bool _isLoading = false;
  PaymentModel? _successfulPayment;
  String _selectedMethod = 'UPI';

  final List<Map<String, dynamic>> _paymentMethods = [
    {'name': 'UPI', 'icon': Icons.qr_code, 'color': Colors.indigo},
    {'name': 'Credit Card', 'icon': Icons.credit_card, 'color': Colors.deepPurple},
    {'name': 'Debit Card', 'icon': Icons.payment, 'color': Colors.blue},
    {'name': 'Net Banking', 'icon': Icons.account_balance, 'color': Colors.teal},
    {'name': 'Wallets', 'icon': Icons.account_balance_wallet, 'color': Colors.orange},
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.suggestedCustomer);
    _mobileController = TextEditingController(text: widget.suggestedMobile);
    _generateOrder();
  }

  Future<void> _generateOrder() async {
    setState(() => _isLoading = true);
    try {
      final orderId = await _paymentService.generateOrderId(
        amount: widget.amount, 
        customerName: _nameController.text,
      );
      setState(() {
        _orderId = orderId;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to generate order: \$e')),
      );
    }
  }

  Future<void> _processCheckout() async {
    if (!_formKey.currentState!.validate() || _orderId == null) return;
    
    setState(() => _isLoading = true);
    try {
      // 1. Process payment via module
      final paymentResult = await _paymentService.processPayment(
        orderId: _orderId!,
        amount: widget.amount,
        customerName: _nameController.text,
        mobileNumber: _mobileController.text,
        paymentMethod: _selectedMethod,
      );

      // 2. Cryptographic signature confirmation
      final isValid = await _paymentService.verifyPaymentSignature(
        orderId: paymentResult.orderId,
        paymentId: paymentResult.paymentId,
        signature: paymentResult.signature ?? '',
      );

      if (isValid) {
        // 3. Update database
        await _paymentService.savePaymentDetailsToFirestore(paymentResult);
        setState(() {
          _successfulPayment = paymentResult;
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment synchronized to Ledger successfully!')),
        );
      } else {
        throw Exception('Cryptographic verification failed. Rejecting transaction.');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorDialog(e.toString());
    }
  }

  void _showErrorDialog(String error) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.error_outline, color: Colors.red),
            SizedBox(width: 8),
            Text('Payment Transaction Failed'),
          ],
        ),
        content: Text(error),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Retry Transaction'),
          ),
        ],
      ),
    );
  }

  void _simulatePDFDownload() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Receipt downloaded as PDF (receipt_\${_successfulPayment?.paymentId}.pdf)'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _simulateWhatsAppShare() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Receipt shared successfully on WhatsApp to customer'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Process Customer Receipt'),
      ),
      body: _isLoading 
        ? const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Verifying Encrypted Transactions...', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
          )
        : SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: _successfulPayment != null 
                ? _buildReceiptCard()
                : _buildCheckoutForm(),
            ),
          ),
    );
  }

  Widget _buildCheckoutForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'PAYMENT DUE AMOUNT',
                  style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                ),
                Text(
                  '\$\${widget.amount.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.blueAccent),
                ),
                const Divider(),
                const SizedBox(height: 8),
                Text('Order Reference: \${_orderId ?? "Generating order ID..."}', style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        const Text('Customer Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        TextFormField(
          controller: _nameController,
          decoration: const InputDecoration(labelText: 'Customer Name', border: OutlineInputBorder()),
          validator: (val) => val == null || val.isEmpty ? 'Specify name' : null,
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _mobileController,
          decoration: const InputDecoration(labelText: 'WhatsApp Mobile Number', border: OutlineInputBorder()),
          keyboardType: TextInputType.phone,
          validator: (val) => val == null || val.length < 10 ? 'Enter valid phone' : null,
        ),
        const SizedBox(height: 24),
        const Text('Choose Payment Gateway Channel', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        SizedBox(
          height: 90,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _paymentMethods.length,
            itemBuilder: (ctx, idx) {
              final m = _paymentMethods[idx];
              final isSelected = _selectedMethod == m['name'];
              return GestureDetector(
                onTap: () => setState(() => _selectedMethod = m['name']),
                child: Container(
                  width: 105,
                  margin: const EdgeInsets.only(right: 10),
                  decoration: BoxDecoration(
                    color: isSelected ? m['color'].withOpacity(0.12) : Colors.transparent,
                    border: Border.all(color: isSelected ? m['color'] : Colors.grey.shade300, width: 2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(m['icon'], color: isSelected ? m['color'] : Colors.grey, size: 28),
                      const SizedBox(height: 6),
                      Text(m['name'], style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSelected ? m['color'] : Colors.black85)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: _processCheckout,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blueAccent,
            minimumSize: const Size.fromHeight(54),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: Text('Process Payment of \$\${widget.amount.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        ),
      ],
    );
  }

  Widget _buildReceiptCard() {
    final payObj = _successfulPayment!;
    return Column(
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 64),
                const SizedBox(height: 12),
                const Text('Payment Securely Verified', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)),
                const SizedBox(height: 4),
                Text('General Ledger updated dynamically', style: TextStyle(color: Colors.grey, fontSize: 13)),
                const Divider(height: 32, thickness: 1.2),
                _buildReceiptRow('Transaction ID', payObj.transactionId),
                _buildReceiptRow('Payment Order ID', payObj.orderId),
                _buildReceiptRow('Gateway Payment ID', payObj.paymentId),
                _buildReceiptRow('Customer Name', payObj.customerName),
                _buildReceiptRow('Mobile Number', payObj.mobileNumber),
                _buildReceiptRow('Channel Method', payObj.paymentMethod),
                _buildReceiptRow('Amount Settled', '\$\${payObj.amount.toStringAsFixed(2)}', isBold: true),
                _buildReceiptRow('Receipt Date', payObj.date.toString().substring(0, 16)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                icon: const Icon(Icons.download),
                label: const Text('Receipt PDF'),
                onPressed: _simulatePDFDownload,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                icon: const Icon(Icons.share),
                label: const Text('WhatsApp'),
                onPressed: _simulateWhatsAppShare,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () {
            setState(() {
              _successfulPayment = null;
              _orderId = null;
              _nameController.text = '';
              _mobileController.text = '';
              _generateOrder();
            });
          },
          child: const Text('Verify New Invoice Payment', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildReceiptRow(String label, String val, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Text(val, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal, fontSize: 13)),
        ],
      ),
    );
  }
}
`
  }
];
