export type CardType = 'visa' | 'mastercard' | 'jcb' | 'napas' | 'amex';

export interface CategoryCashbackRule {
  categoryId: string;
  categoryName: string;
  percentage: number; // e.g., 10 for 10%
  maxCashback?: number; // e.g., 300,000 VND cap for this category
  minSpend?: number; // optional min spend in this category
}

export interface CashbackPolicy {
  overallMaxCashback: number; // Maximum total cashback per cycle (e.g., 600,000 VND), 0 for unlimited
  minCycleSpendToQualify: number; // e.g., 5,000,000 VND minimum total cycle spend to receive cashback
  categoryRules: CategoryCashbackRule[];
  defaultPercentage: number; // e.g., 0.5% for other categories
}

export interface CreditCard {
  id: string;
  bankName: string;
  cardName: string;
  cardNumberLast4?: string;
  cardType: CardType;
  creditLimit: number; // e.g. 50,000,000 VND
  statementDay: number; // Day of month card statement is issued (e.g. 20)
  paymentDueDaysAfter: number; // Days after statement day payment is due (e.g. 15-25 days) or fixed day of month
  paymentDueDayFixed?: number; // If bank specifies exact day, e.g. day 23 of month
  paymentMethod?: 'auto_debit' | 'manual'; // Hình thức thanh toán: Trích nợ tự động hoặc Thủ công
  autoDebitAccount?: string; // Tài khoản trích nợ (VD: '004131414 - PHAM THANH SON')
  paymentRate?: 'full' | 'minimum'; // Tỷ lệ thanh toán: Toàn bộ nợ (100%) hoặc Tối thiểu (5%)
  themeColor: string; // Hex or gradient preset name
  cashbackPolicy: CashbackPolicy;
  personalTargetSpend?: number; // Optional personal monthly spending budget
  isActive: boolean;
  order: number;
}

export interface Transaction {
  id: string;
  cardId: string;
  amount: number;
  date: string; // ISO date 'YYYY-MM-DD'
  categoryId: string;
  note?: string;
  mcc?: string; // Merchant Category Code (e.g., '5262', '5411', '5691', '2012')
  type?: 'expense' | 'income'; // 'expense': TIỀN RA (-), 'income': TIỀN VÀO (+)
  cashbackEarned: number; // Calculated cashback for this transaction
  cashbackRate: number; // Percentage applied
  isExcludedFromCashback?: boolean;
}

export interface StatementPeriod {
  cardId: string;
  cycleKey: string; // e.g. '2026-10-21_2026-11-20'
  startDate: string;
  endDate: string;
  dueDate: string;
  totalSpend: number;
  totalCashback: number;
  isPaid: boolean;
  paidAmount?: number;
  paidDate?: string;
}

export interface SpendingCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description?: string;
}

export type ViewTab = 
  | 'overview' 
  | 'transactions'
  | 'statements' 
  | 'reports' 
  | 'recommender' 
  | 'lookup' 
  | 'manage-cards' 
  | 'currency' 
  | 'cashback-policy' 
  | 'categories' 
  | 'toggle-cashbook';

export interface DisplayOptions {
  showPersonalTarget: boolean;
  showEstimatedCashback: boolean;
  showCategoryCashback: boolean;
  showCardTerms: boolean;
  showPreviousStatement: boolean;
  showSpendingTime: boolean;
  showActionTips: boolean;
}
