import { REAL_MB_TRANSACTIONS } from '../src/data/realTransactions.ts';
import { INITIAL_SAMPLE_CARDS } from '../src/data/defaultCards.ts';
import { DEFAULT_CATEGORIES } from '../src/data/defaultCategories.ts';
import { DEFAULT_INSTALLMENT_PLANS } from '../src/data/defaultInstallments.ts';

const payload = {
  version: '2.0',
  exportedAt: new Date().toISOString(),
  cards: INITIAL_SAMPLE_CARDS,
  transactions: REAL_MB_TRANSACTIONS,
  categories: DEFAULT_CATEGORIES,
  paidStatus: {
    'card-sample-mb-jcb_2026-08-09_2026-09-08': true,
  },
  installments: DEFAULT_INSTALLMENT_PLANS,
  displayOptions: {
    showPersonalTarget: true,
    showEstimatedCashback: true,
    showCategoryCashback: true,
    showCardTerms: true,
    showPreviousStatement: true,
    showSpendingTime: true,
    showActionTips: true,
  },
};

console.log('Seeding cloud with:', {
  cards: payload.cards.length,
  transactions: payload.transactions.length,
  categories: payload.categories.length,
  installments: payload.installments.length,
});

async function main() {
  const res = await fetch('https://stpham.netlify.app/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: 'stpham',
      payload,
    }),
  });

  const json = await res.json();
  console.log('Response from Netlify Cloud Sync:', json);
}

main().catch(console.error);
