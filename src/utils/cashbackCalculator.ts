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

export interface MBJCBPillars {
  isMBJCB: boolean;
  // Prerequisite Pillar: Lĩnh vực khác >= 2,000,000 VND
  otherSpent: number;
  otherTarget: number;
  isOtherMet: boolean;
  otherMissing: number;

  // Shopee Pillar: Shopee >= 2,000,000 VND (10%)
  shopeeSpent: number;
  shopeeTarget: number;
  isShopeeMet: boolean;
  shopeeMissing: number;
  shopeeEarned: number;

  // TikTok Shop Pillar: TikTok Shop >= 2,000,000 VND (10%)
  tiktokSpent: number;
  tiktokTarget: number;
  isTikTokMet: boolean;
  tiktokMissing: number;
  tiktokEarned: number;

  // Welcome Bonus: 5 transactions & >= 5,000,000 VND in 60 days (500,000 VND reward)
  welcomeTxCount: number;
  welcomeTxTarget: number;
  welcomeSpent: number;
  welcomeSpendTarget: number;
  isWelcomeMet: boolean;
  welcomeReward: number;

  // Overall Cycle Cap: 500,000 VND
  overallCap: number;
  totalCycleCashback: number;
  capReached: boolean;
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

  // Dedicated pillar breakdown for MB JCB cards
  mbJcbPillars?: MBJCBPillars;
}

/**
 * Calculate expected cashback for a single proposed or recorded transaction
 */
export function estimateTransactionCashback(
  card: CreditCard,
  amount: number,
  categoryId: string
): { cashback: number; rate: number; ruleMatched?: string } {
  const isMBJCB = (card.bankName.toLowerCase().includes('mb') && (card.cardName.toLowerCase().includes('jcb') || card.cardType === 'jcb')) || card.cardName.toLowerCase().includes('mb jcb');

  if (isMBJCB) {
    if (categoryId === 'shopee' || categoryId === 'tiktok_shop') {
      const catName = categoryId === 'shopee' ? 'Shopee' : 'TikTok Shop';
      return {
        cashback: (amount * 10) / 100,
        rate: 10,
        ruleMatched: `10% (${catName} - Khi chi ≥ 2M & ĐK Lĩnh vực khác ≥ 2M)`,
      };
    } else {
      return {
        cashback: 0,
        rate: 0,
        ruleMatched: '0% (Lĩnh vực khác - Tích lũy điều kiện tiên quyết ≥ 2M)',
      };
    }
  }

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

  // Separate expense (TIỀN RA) from income (TIỀN VÀO / thanh toán thẻ / hoàn tiền)
  const expenseTransactions = transactionsInCycle.filter(t => t.type !== 'income');
  const totalSpent = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const policy = card.cashbackPolicy;
  const minSpend = policy.minCycleSpendToQualify || 0;
  const isQualified = totalSpent >= minSpend;
  const spendNeededToQualify = isQualified ? 0 : Math.max(0, minSpend - totalSpent);

  // Group by category for expenses
  const spendByCategory = new Map<string, number>();
  expenseTransactions.forEach(t => {
    spendByCategory.set(t.categoryId, (spendByCategory.get(t.categoryId) || 0) + t.amount);
  });

  // Check if card is MB JCB Platinum / Be The Sky
  const isMBJCB = (card.bankName.toLowerCase().includes('mb') && (card.cardName.toLowerCase().includes('jcb') || card.cardType === 'jcb')) || card.cardName.toLowerCase().includes('mb jcb');

  const categories: CategorySummary[] = [];
  let totalRawCashback = 0;
  let totalCappedCategories = 0;
  let mbJcbPillars: MBJCBPillars | undefined = undefined;

  if (isMBJCB) {
    // Specialized logic for MB JCB Platinum based on official PDF policy
    let shopeeSpent = 0;
    let tiktokSpent = 0;
    let otherSpent = 0;

    expenseTransactions.forEach(t => {
      if (t.categoryId === 'shopee') {
        shopeeSpent += t.amount;
      } else if (t.categoryId === 'tiktok_shop') {
        tiktokSpent += t.amount;
      } else {
        otherSpent += t.amount;
      }
    });

    const isOtherMet = otherSpent >= 2000000;
    const otherMissing = Math.max(0, 2000000 - otherSpent);

    const isShopeeMet = shopeeSpent >= 2000000;
    const shopeeMissing = Math.max(0, 2000000 - shopeeSpent);
    const rawShopeeCashback = (shopeeSpent * 10) / 100;
    const actualShopeeCashback = (isOtherMet && isShopeeMet) ? rawShopeeCashback : 0;

    const isTikTokMet = tiktokSpent >= 2000000;
    const tiktokMissing = Math.max(0, 2000000 - tiktokSpent);
    const rawTikTokCashback = (tiktokSpent * 10) / 100;
    const actualTikTokCashback = (isOtherMet && isTikTokMet) ? rawTikTokCashback : 0;

    // Welcome bonus: 5 transactions & >= 5M spend in 60 days -> 500k reward
    const welcomeTxCount = transactionsInCycle.length;
    const welcomeSpent = totalSpent;
    const isWelcomeMet = welcomeTxCount >= 5 && welcomeSpent >= 5000000;

    const combinedCashback = actualShopeeCashback + actualTikTokCashback;
    const overallCap = policy.overallMaxCashback || 500000;
    const finalMBJCBCashback = Math.min(overallCap, combinedCashback);
    const capReached = combinedCashback >= overallCap;

    mbJcbPillars = {
      isMBJCB: true,
      otherSpent,
      otherTarget: 2000000,
      isOtherMet,
      otherMissing,
      shopeeSpent,
      shopeeTarget: 2000000,
      isShopeeMet,
      shopeeMissing,
      shopeeEarned: actualShopeeCashback,
      tiktokSpent,
      tiktokTarget: 2000000,
      isTikTokMet,
      tiktokMissing,
      tiktokEarned: actualTikTokCashback,
      welcomeTxCount,
      welcomeTxTarget: 5,
      welcomeSpent,
      welcomeSpendTarget: 5000000,
      isWelcomeMet,
      welcomeReward: 500000,
      overallCap,
      totalCycleCashback: finalMBJCBCashback,
      capReached,
    };

    // Category summaries
    categories.push({
      categoryId: 'shopee',
      categoryName: 'Shopee (Hoàn 10% khi ≥ 2M & ĐK Lĩnh vực khác)',
      totalSpent: shopeeSpent,
      rate: 10,
      rawCashback: rawShopeeCashback,
      actualCashback: actualShopeeCashback,
      maxCashback: 500000,
      isCapped: actualShopeeCashback >= 500000,
    });

    categories.push({
      categoryId: 'tiktok_shop',
      categoryName: 'TikTok Shop (Hoàn 10% khi ≥ 2M & ĐK Lĩnh vực khác)',
      totalSpent: tiktokSpent,
      rate: 10,
      rawCashback: rawTikTokCashback,
      actualCashback: actualTikTokCashback,
      maxCashback: 500000,
      isCapped: actualTikTokCashback >= 500000,
    });

    categories.push({
      categoryId: 'other',
      categoryName: 'Lĩnh vực khác (ĐK tiên quyết ≥ 2.000.000 ₫)',
      totalSpent: otherSpent,
      rate: 0,
      rawCashback: 0,
      actualCashback: 0,
      isCapped: false,
    });

    totalRawCashback = rawShopeeCashback + rawTikTokCashback;
    totalCappedCategories = finalMBJCBCashback;
  } else {
    // Process configured category rules for normal cards
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
  }

  // Apply overall cap
  const overallCap = policy.overallMaxCashback || 0;
  let finalCashback = totalCappedCategories;
  let isOverallCapped = false;

  if (overallCap > 0 && finalCashback > overallCap) {
    finalCashback = overallCap;
    isOverallCapped = true;
  }

  // Calculate effective cashback and qualification
  const effectiveCashback = isMBJCB ? (mbJcbPillars?.totalCycleCashback ?? 0) : (isQualified ? finalCashback : 0);
  const actualIsQualified = isMBJCB ? (mbJcbPillars?.isOtherMet ?? false) : isQualified;
  const actualSpendNeeded = isMBJCB ? (mbJcbPillars?.otherMissing ?? 0) : spendNeededToQualify;

  // Credit utilization
  const utilizationRate = card.creditLimit > 0 ? (totalSpent / card.creditLimit) * 100 : 0;
  const isSafeUtilization = utilizationRate <= 50;

  // Smart action tips
  const actionTips: string[] = [];

  if (isMBJCB && mbJcbPillars) {
    if (!mbJcbPillars.isOtherMet) {
      actionTips.push(
        `⚠️ Điều kiện tiên quyết: Cần chi thêm ${mbJcbPillars.otherMissing.toLocaleString('vi-VN')} ₫ ở "Lĩnh vực khác" (Ăn uống, siêu thị, xăng xe...) để kích hoạt hoàn 10% Shopee & TikTok Shop!`
      );
    } else {
      actionTips.push(`✅ Đã đạt điều kiện tiên quyết Lĩnh vực khác (≥ 2.000.000 ₫). Đã mở khóa hoàn 10% Shopee & TikTok Shop!`);
    }

    if (mbJcbPillars.isOtherMet && !mbJcbPillars.isShopeeMet && mbJcbPillars.shopeeSpent > 0) {
      actionTips.push(
        `Shopee đã chi ${mbJcbPillars.shopeeSpent.toLocaleString('vi-VN')} ₫. Cần thêm ${mbJcbPillars.shopeeMissing.toLocaleString('vi-VN')} ₫ để đạt mốc 2.000.000 ₫ nhận hoàn 10%.`
      );
    }

    if (mbJcbPillars.isOtherMet && !mbJcbPillars.isTikTokMet && mbJcbPillars.tiktokSpent > 0) {
      actionTips.push(
        `TikTok Shop đã chi ${mbJcbPillars.tiktokSpent.toLocaleString('vi-VN')} ₫. Cần thêm ${mbJcbPillars.tiktokMissing.toLocaleString('vi-VN')} ₫ để đạt mốc 2.000.000 ₫ nhận hoàn 10%.`
      );
    }

    if (mbJcbPillars.capReached) {
      actionTips.push(
        `🎉 Đã đạt trần hoàn tiền tối đa 500.000 ₫/kỳ của thẻ MB JCB Platinum! Hãy chuyển sang thẻ khác để tối ưu chi tiêu.`
      );
    }

    actionTips.push(
      `🎁 Ưu đãi chào mừng: Đã tích lũy ${mbJcbPillars.welcomeTxCount}/5 giao dịch và ${mbJcbPillars.welcomeSpent.toLocaleString('vi-VN')} ₫ / 5.000.000 ₫ trong 60 ngày đầu (Thưởng 500.000 ₫ tiền mặt).`
    );
  } else {
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
    isQualifiedForCashback: actualIsQualified,
    minSpendRequired: isMBJCB ? 2000000 : minSpend,
    spendNeededToQualify: actualSpendNeeded,
    totalRawCashback,
    totalCappedCashback: effectiveCashback,
    overallCap,
    isOverallCapped: isMBJCB ? (mbJcbPillars?.capReached ?? false) : isOverallCapped,
    categories,
    actionTips,
    transactionsInCycle,
    mbJcbPillars,
  };
}
