import { CreditCard, Transaction } from '../types';
import { getCardCycleInfo, isDateWithin } from './formatters';

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  totalSpent: number;
  rate: number;
  rawCashback: number;
  actualCashback: number; // capped
  maxCashback?: number;
  isCapped: boolean;
}

export interface CardCycleAnalysis {
  card: CreditCard;
  cycleStartDate: string;
  cycleEndDate: string;
  dueDate: string;
  daysUntilStatement: number;
  daysUntilDue: number;
  totalSpent: number;
  creditLimit: number;
  utilizationRate: number; // percentage, e.g. 25.4%
  isSafeUtilization: boolean; // < 50%
  
  // Cashback calculation
  isQualifiedForCashback: boolean;
  minSpendRequired: number;
  spendNeededToQualify: number;
  
  totalRawCashback: number;
  totalCappedCashback: number; // Final projected cashback
  overallCap: number; // 0 if unlimited
  isOverallCapped: boolean;
  
  categories: CategorySummary[];
  actionTips: string[];
  transactionsInCycle: Transaction[];
}

/**
 * Calculate expected cashback for a single proposed or recorded transaction
 */
export function estimateTransactionCashback(
  card: CreditCard,
  amount: number,
  categoryId: string
): { cashback: number; rate: number; ruleMatched?: string } {
  const policy = card.cashbackPolicy;
  const matchedRule = policy.categoryRules.find(r => r.categoryId === categoryId);

  if (matchedRule) {
    const raw = (amount * matchedRule.percentage) / 100;
    return {
      cashback: raw,
      rate: matchedRule.percentage,
      ruleMatched: `${matchedRule.percentage}% (${matchedRule.categoryName})`,
    };
  }

  const defaultRate = policy.defaultPercentage || 0.5;
  return {
    cashback: (amount * defaultRate) / 100,
    rate: defaultRate,
    ruleMatched: `${defaultRate}% (Chi tiêu mặc định)`,
  };
}

/**
 * Computes full analysis of a card's current billing cycle
 */
export function analyzeCardCycle(
  card: CreditCard,
  allTransactions: Transaction[],
  refDate: Date = new Date()
): CardCycleAnalysis {
  const cycle = getCardCycleInfo(card, refDate);
  const transactionsInCycle = allTransactions.filter(
    t => t.cardId === card.id && isDateWithin(t.date, cycle.startDate, cycle.endDate)
  );

  const totalSpent = transactionsInCycle.reduce((sum, t) => sum + t.amount, 0);
  const policy = card.cashbackPolicy;
  const minSpend = policy.minCycleSpendToQualify || 0;
  const isQualified = totalSpent >= minSpend;
  const spendNeededToQualify = isQualified ? 0 : Math.max(0, minSpend - totalSpent);

  // Group by category
  const spendByCategory = new Map<string, number>();
  transactionsInCycle.forEach(t => {
    spendByCategory.set(t.categoryId, (spendByCategory.get(t.categoryId) || 0) + t.amount);
  });

  const categories: CategorySummary[] = [];
  let totalRawCashback = 0;
  let totalCappedCategories = 0;

  // Process configured category rules
  policy.categoryRules.forEach(rule => {
    const spent = spendByCategory.get(rule.categoryId) || 0;
    const raw = (spent * rule.percentage) / 100;
    const cap = rule.maxCashback;
    let actual = raw;
    let isCapped = false;

    if (cap && cap > 0 && actual > cap) {
      actual = cap;
      isCapped = true;
    }

    totalRawCashback += raw;
    totalCappedCategories += actual;

    categories.push({
      categoryId: rule.categoryId,
      categoryName: rule.categoryName,
      totalSpent: spent,
      rate: rule.percentage,
      rawCashback: raw,
      actualCashback: actual,
      maxCashback: cap,
      isCapped,
    });
  });

  // Other categories that use default percentage
  const defaultRate = policy.defaultPercentage || 0.5;
  let otherSpent = 0;
  spendByCategory.forEach((spent, catId) => {
    if (!policy.categoryRules.some(r => r.categoryId === catId)) {
      otherSpent += spent;
    }
  });

  if (otherSpent > 0 || categories.length === 0) {
    const rawOther = (otherSpent * defaultRate) / 100;
    totalRawCashback += rawOther;
    totalCappedCategories += rawOther;
    categories.push({
      categoryId: 'other',
      categoryName: 'Chi tiêu khác & Phổ thông',
      totalSpent: otherSpent,
      rate: defaultRate,
      rawCashback: rawOther,
      actualCashback: rawOther,
      isCapped: false,
    });
  }

  // Apply overall cap
  const overallCap = policy.overallMaxCashback || 0;
  let finalCashback = totalCappedCategories;
  let isOverallCapped = false;

  if (overallCap > 0 && finalCashback > overallCap) {
    finalCashback = overallCap;
    isOverallCapped = true;
  }

  // If not qualified for minimum spend, actual earned is 0 (or pending)
  const effectiveCashback = isQualified ? finalCashback : 0;

  // Credit utilization
  const utilizationRate = card.creditLimit > 0 ? (totalSpent / card.creditLimit) * 100 : 0;
  const isSafeUtilization = utilizationRate <= 50;

  // Smart action tips
  const actionTips: string[] = [];

  if (minSpend > 0 && !isQualified) {
    actionTips.push(
      `Cần chi thêm ${spendNeededToQualify.toLocaleString('vi-VN')} đ trước ngày ${cycle.endDate} để kích hoạt hoàn tiền kỳ này (Đã tích lũy ${finalCashback.toLocaleString('vi-VN')} đ).`
    );
  } else if (minSpend > 0 && isQualified) {
    actionTips.push(`Đã hoàn thành điều kiện chi tiêu tối thiểu của thẻ!`);
  }

  categories.forEach(cat => {
    if (cat.isCapped && cat.maxCashback) {
      actionTips.push(
        `Đã đạt trần hoàn tiền danh mục "${cat.categoryName}" (${cat.maxCashback.toLocaleString('vi-VN')} đ). Chuyển sang thẻ khác cho danh mục này!`
      );
    }
  });

  if (isOverallCapped) {
    actionTips.push(
      `Đã đạt mức hoàn tiền tối đa của thẻ (${overallCap.toLocaleString('vi-VN')} đ/kỳ). Hãy dùng thẻ khác để không lãng phí cashback!`
    );
  }

  if (utilizationRate > 70) {
    actionTips.push(
      `Cảnh báo: Tỷ lệ sử dụng hạn mức ${utilizationRate.toFixed(1)}% (> 70%), có thể ảnh hưởng điểm tín dụng CIC. Cân nhắc thanh toán sớm một phần.`
    );
  }

  if (cycle.daysUntilStatement <= 3 && cycle.daysUntilStatement >= 0) {
    actionTips.push(`Sắp tới ngày chốt sao kê (${cycle.endDate})!`);
  }

  return {
    card,
    cycleStartDate: cycle.startDate,
    cycleEndDate: cycle.endDate,
    dueDate: cycle.dueDate,
    daysUntilStatement: cycle.daysUntilStatement,
    daysUntilDue: cycle.daysUntilDue,
    totalSpent,
    creditLimit: card.creditLimit,
    utilizationRate,
    isSafeUtilization,
    isQualifiedForCashback: isQualified,
    minSpendRequired: minSpend,
    spendNeededToQualify,
    totalRawCashback,
    totalCappedCashback: effectiveCashback,
    overallCap,
    isOverallCapped,
    categories,
    actionTips,
    transactionsInCycle,
  };
}
