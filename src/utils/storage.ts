import { CreditCard, Transaction, SpendingCategory, DisplayOptions } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { INITIAL_SAMPLE_CARDS } from '../data/defaultCards';

const INITIALIZED_FLAG = 'hoantien_initialized_v2';
const CARDS_KEY = 'hoantien_cards_v2';
const TRANSACTIONS_KEY = 'hoantien_transactions_v2';
const CATEGORIES_KEY = 'hoantien_categories_v2';
const DISPLAY_OPTIONS_KEY = 'hoantien_display_options_v2';
const PAID_STATUS_KEY = 'hoantien_paid_status_v2';

export const DEFAULT_DISPLAY_OPTIONS: DisplayOptions = {
  showPersonalTarget: true,
  showEstimatedCashback: true,
  showCategoryCashback: true,
  showCardTerms: true,
  showPreviousStatement: true,
  showSpendingTime: true,
  showActionTips: true,
};

export function isAppInitialized(): boolean {
  try {
    return localStorage.getItem(INITIALIZED_FLAG) === 'true';
  } catch {
    return false;
  }
}

export function markAppInitialized() {
  try {
    localStorage.setItem(INITIALIZED_FLAG, 'true');
  } catch (e) {
    console.error('Failed to mark app initialized', e);
  }
}

export function loadCards(): CreditCard[] {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    if (raw === null) {
      // Check legacy key v1 if upgrading
      const legacy = localStorage.getItem('hoantien_cards_v1');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        saveCards(parsed);
        return parsed;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading cards from storage', e);
    return [];
  }
}

export function saveCards(cards: CreditCard[]) {
  try {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
    markAppInitialized();
  } catch (e) {
    console.error('Error saving cards to storage', e);
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (raw === null) {
      const legacy = localStorage.getItem('hoantien_transactions_v1');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        saveTransactions(parsed);
        return parsed;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading transactions from storage', e);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]) {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    markAppInitialized();
  } catch (e) {
    console.error('Error saving transactions to storage', e);
  }
}

export function loadCategories(): SpendingCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw === null) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: SpendingCategory[]) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories to storage', e);
  }
}

export function loadDisplayOptions(): DisplayOptions {
  try {
    const raw = localStorage.getItem(DISPLAY_OPTIONS_KEY);
    if (!raw) return DEFAULT_DISPLAY_OPTIONS;
    return { ...DEFAULT_DISPLAY_OPTIONS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_DISPLAY_OPTIONS;
  }
}

export function saveDisplayOptions(options: DisplayOptions) {
  try {
    localStorage.setItem(DISPLAY_OPTIONS_KEY, JSON.stringify(options));
  } catch (e) {
    console.error('Error saving display options', e);
  }
}

export function loadPaidStatus(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PAID_STATUS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePaidStatus(status: Record<string, boolean>) {
  try {
    localStorage.setItem(PAID_STATUS_KEY, JSON.stringify(status));
  } catch (e) {
    console.error('Error saving paid status', e);
  }
}

export function seedSampleData(): { cards: CreditCard[]; transactions: Transaction[] } {
  const cards = INITIAL_SAMPLE_CARDS;
  const today = new Date();
  const formatD = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const sampleTransactions: Transaction[] = [
    {
      id: 'tx-1',
      cardId: 'card-sample-1',
      amount: 1450000,
      date: formatD(2),
      categoryId: 'dining',
      note: 'Ăn tối lẩu Haidilao Landmark',
      cashbackEarned: 145000,
      cashbackRate: 10,
    },
    {
      id: 'tx-2',
      cardId: 'card-sample-1',
      amount: 850000,
      date: formatD(5),
      categoryId: 'supermarket',
      note: 'Siêu thị Winmart cuối tuần',
      cashbackEarned: 42500,
      cashbackRate: 5,
    },
    {
      id: 'tx-3',
      cardId: 'card-sample-1',
      amount: 1200000,
      date: formatD(8),
      categoryId: 'dining',
      note: 'Nhà hàng Pizza 4P’s',
      cashbackEarned: 120000,
      cashbackRate: 10,
    },
    {
      id: 'tx-4',
      cardId: 'card-sample-2',
      amount: 2100000,
      date: formatD(3),
      categoryId: 'online_shopping',
      note: 'Mua sắm đồ gia dụng Shopee Mall',
      cashbackEarned: 315000,
      cashbackRate: 15,
    },
    {
      id: 'tx-5',
      cardId: 'card-sample-2',
      amount: 500000,
      date: formatD(7),
      categoryId: 'transport',
      note: 'Đổ xăng Petrolimex',
      cashbackEarned: 25000,
      cashbackRate: 5,
    },
    {
      id: 'tx-6',
      cardId: 'card-sample-1',
      amount: 2500000,
      date: formatD(12),
      categoryId: 'other',
      note: 'Bảo dưỡng xe máy Honda',
      cashbackEarned: 12500,
      cashbackRate: 0.5,
    },
  ];

  saveCards(cards);
  saveTransactions(sampleTransactions);
  saveCategories(DEFAULT_CATEGORIES);
  markAppInitialized();

  return { cards, transactions: sampleTransactions };
}

export function clearAllUserData() {
  saveCards([]);
  saveTransactions([]);
  savePaidStatus({});
  markAppInitialized();
}

export function exportBackupJSON(): string {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    cards: loadCards(),
    transactions: loadTransactions(),
    categories: loadCategories(),
    displayOptions: loadDisplayOptions(),
    paidStatus: loadPaidStatus(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.cards && Array.isArray(data.cards)) {
      saveCards(data.cards);
    }
    if (data.transactions && Array.isArray(data.transactions)) {
      saveTransactions(data.transactions);
    }
    if (data.categories && Array.isArray(data.categories)) {
      saveCategories(data.categories);
    }
    if (data.displayOptions) {
      saveDisplayOptions(data.displayOptions);
    }
    if (data.paidStatus) {
      savePaidStatus(data.paidStatus);
    }
    markAppInitialized();
    return true;
  } catch (e) {
    console.error('Failed to import backup JSON', e);
    return false;
  }
}
