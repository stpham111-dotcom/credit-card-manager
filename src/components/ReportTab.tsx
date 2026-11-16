import React from 'react';
import { BarChart3, PieChart, TrendingUp, Gift, ShieldCheck, AlertCircle } from 'lucide-react';
import { CreditCard, SpendingCategory, Transaction } from '../types';
import { analyzeCardCycle } from '../utils/cashbackCalculator';
import { formatVND } from '../utils/formatters';

interface ReportTabProps {
  cards: CreditCard[];
  transactions: Transaction[];
  categories: SpendingCategory[];
}

export const ReportTab: React.FC<ReportTabProps> = ({
  cards,
  transactions,
  categories,
}) => {
  const activeCards = cards.filter(c => c.isActive);

  // Overall totals
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCashback = transactions.reduce((sum, t) => sum + t.cashbackEarned, 0);
  const totalLimit = activeCards.reduce((sum, c) => sum + c.creditLimit, 0);
  
  const overallCashbackRate = totalSpent > 0 ? (totalCashback / totalSpent) * 100 : 0;
  const overallUtilization = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  // Breakdown by category
  const categorySpendMap = new Map<string, { spent: number; cashback: number }>();
  transactions.forEach((t) => {
    const existing = categorySpendMap.get(t.categoryId) || { spent: 0, cashback: 0 };
    categorySpendMap.set(t.categoryId, {
      spent: existing.spent + t.amount,
      cashback: existing.cashback + t.cashbackEarned,
    });
  });

  const categoryBreakdown = categories.map((cat) => {
    const data = categorySpendMap.get(cat.id) || { spent: 0, cashback: 0 };
    const pct = totalSpent > 0 ? (data.spent / totalSpent) * 100 : 0;
    return {
      category: cat,
      spent: data.spent,
      cashback: data.cashback,
      percentOfTotal: pct,
    };
  }).filter(item => item.spent > 0).sort((a, b) => b.spent - a.spent);

  // Breakdown by card
  const cardBreakdown = activeCards.map((card) => {
    const cardTx = transactions.filter(t => t.cardId === card.id);
    const spent = cardTx.reduce((sum, t) => sum + t.amount, 0);
    const cashback = cardTx.reduce((sum, t) => sum + t.cashbackEarned, 0);
    const rate = spent > 0 ? (cashback / spent) * 100 : 0;
    return {
      card,
      spent,
      cashback,
      rate,
    };
  }).sort((a, b) => b.cashback - a.cashback);

  return (
    <div className="space-y-6">
      {/* Top 3 High Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tổng chi tiêu tích lũy</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 my-1">
            {formatVND(totalSpent)}
          </div>
          <div className="text-xs text-slate-500">
            Từ {transactions.length} giao dịch đã ghi nhận
          </div>
        </div>

        <div className="bg-[#f0fbf5] rounded-2xl p-5 border border-[#c3e9d2] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#056c4c] font-semibold mb-1">
            <span>Tổng tiền hoàn (Cashback)</span>
            <Gift className="w-4 h-4 text-[#056c4c]" />
          </div>
          <div className="text-2xl font-black text-[#056c4c] my-1">
            {formatVND(totalCashback)}
          </div>
          <div className="text-xs text-[#056c4c]/80 font-medium">
            Hiệu suất hoàn tiền trung bình: <strong>{overallCashbackRate.toFixed(2)}%</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tỷ lệ dùng hạn mức toàn bộ</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 my-1">
            {overallUtilization.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">
            {overallUtilization < 40 ? (
              <span className="text-emerald-700 font-medium">Rất an toàn cho điểm CIC</span>
            ) : (
              <span className="text-amber-600 font-medium">Nên kiểm soát dưới 50%</span>
            )}
          </div>
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#056c4c]" />
          <span>Cơ cấu chi tiêu & Hoàn tiền theo danh mục</span>
        </h3>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Chưa có giao dịch chi tiêu nào.</p>
        ) : (
          <div className="space-y-4">
            {categoryBreakdown.map((item) => (
              <div key={item.category.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    {item.category.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">{formatVND(item.spent)} ({item.percentOfTotal.toFixed(1)}%)</span>
                    <span className="font-bold text-[#056c4c]">+{formatVND(item.cashback)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentOfTotal}%`,
                      backgroundColor: item.category.color || '#056c4c',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance by Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#056c4c]" />
          <span>Xếp hạng thẻ mang lại nhiều tiền hoàn nhất</span>
        </h3>

        <div className="space-y-3">
          {cardBreakdown.map((item, idx) => (
            <div
              key={item.card.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-slate-400 text-sm">
                  #{idx + 1}
                </span>
                <div
                  className="w-10 h-7 rounded-md flex items-center justify-center text-white text-[9px] font-bold shadow-2xs"
                  style={{ background: item.card.themeColor }}
                >
                  {item.card.bankName}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {item.card.bankName} - {item.card.cardName}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Chi: {formatVND(item.spent)} • Tỷ lệ hoàn bình quân: {item.rate.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-[#056c4c]">
                  +{formatVND(item.cashback)}
                </span>
                <span className="text-[11px] text-slate-400 block">Đã nhận hoàn</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
