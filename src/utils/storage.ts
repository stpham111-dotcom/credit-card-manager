import { CreditCard, Transaction, SpendingCategory, DisplayOptions } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { INITIAL_SAMPLE_CARDS } from '../data/defaultCards';
import { REAL_MB_TRANSACTIONS } from '../data/realTransactions';

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
    const cards = loadCards();
    const mbCard = cards.find(c => c.cardName.toLowerCase().includes('jcb') || c.bankName.toLowerCase().includes('mb')) || cards[0];
    const targetCardId = mbCard ? mbCard.id : 'card-sample-mb-jcb';

    const getRealWithCardId = () => REAL_MB_TRANSACTIONS.map(t => ({ ...t, cardId: targetCardId }));

    if (raw === null) {
      const initial = getRealWithCardId();
      saveTransactions(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    const userExplicitlyCleared = localStorage.getItem('hoantien_user_cleared_all_tx') === 'true';

    // If storage is empty array or has old mock transactions without MCC (and user hasn't explicitly clicked Clear All)
    const hasReal = Array.isArray(parsed) && parsed.some((t: Transaction) => t.id.startsWith('mb-real-') || t.mcc !== undefined);

    if (!userExplicitlyCleared && (!hasReal || (Array.isArray(parsed) && parsed.length === 0))) {
      const initial = getRealWithCardId();
      saveTransactions(initial);
      return initial;
    }

    if (Array.isArray(parsed)) {
      // Ensure all transactions have valid cardId mapping to user's card if user has only 1 card
      if (cards.length === 1) {
        return parsed.map((t: Transaction) => ({ ...t, cardId: targetCardId }));
      }
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Error loading transactions from storage', e);
    return REAL_MB_TRANSACTIONS;
  }
}

export function resetToRealMBTransactions(targetCardId?: string): Transaction[] {
  try {
    localStorage.removeItem('hoantien_user_cleared_all_tx');
    const cards = loadCards();
    const mbCard = targetCardId 
      ? cards.find(c => c.id === targetCardId) 
      : (cards.find(c => c.cardName.toLowerCase().includes('jcb') || c.bankName.toLowerCase().includes('mb')) || cards[0]);
    const cardId = mbCard ? mbCard.id : 'card-sample-mb-jcb';
    const txs = REAL_MB_TRANSACTIONS.map(t => ({ ...t, cardId }));
    saveTransactions(txs);
    return txs;
  } catch (e) {
    console.error('Error resetting to real MB transactions', e);
    return REAL_MB_TRANSACTIONS;
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

export function seedMBJCBSampleFlow(targetCardId?: string): Transaction[] {
  const cards = loadCards();
  const mbCard = targetCardId 
    ? cards.find(c => c.id === targetCardId) 
    : cards.find(c => c.cardName.toLowerCase().includes('jcb') || c.bankName.toLowerCase().includes('mb'));
  
  const cardId = mbCard ? mbCard.id : 'card-sample-mb-jcb';
  const updatedReal = REAL_MB_TRANSACTIONS.map(t => ({ ...t, cardId }));
  saveTransactions(updatedReal);
  return updatedReal;
}

export function seedSampleData(): { cards: CreditCard[]; transactions: Transaction[] } {
  const cards = INITIAL_SAMPLE_CARDS;
  const sampleTransactions: Transaction[] = REAL_MB_TRANSACTIONS;

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
