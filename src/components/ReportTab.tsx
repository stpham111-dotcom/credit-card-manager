import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  ShieldCheck, 
  AlertCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { CreditCard, SpendingCategory, Transaction } from '../types';
import { analyzeCardCycle } from '../utils/cashbackCalculator';
import { formatVND } from '../utils/formatters';

interface ReportTabProps {
  cards: CreditCard[];
  transactions: Transaction[];
  categories: SpendingCategory[];
}

interface CycleSummary {
  id: string;
  name: string;
  period: string;
  txCount: number;
  expense: number;
  income: number;
  net: number;
  cashback: number;
  statusBadge: string;
  statusColor: string;
}

export const ReportTab: React.FC<ReportTabProps> = ({
  cards,
  transactions,
  categories,
}) => {
  const activeCards = cards.filter(c => c.isActive);

  // Separation of expenses and income
  const expenseTxs = transactions.filter(t => t.type !== 'income');
  const incomeTxs = transactions.filter(t => t.type === 'income');

  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const netSpend = Math.max(0, totalExpense - totalIncome);
  const totalCashback = transactions.reduce((sum, t) => sum + t.cashbackEarned, 0);
  const totalLimit = activeCards.reduce((sum, c) => sum + c.creditLimit, 0);
  
  const overallCashbackRate = totalExpense > 0 ? (totalCashback / totalExpense) * 100 : 0;
  const overallUtilization = totalLimit > 0 ? (netSpend / totalLimit) * 100 : 0;

  // Breakdown by category (only for expenses)
  const categorySpendMap = new Map<string, { spent: number; cashback: number }>();
  expenseTxs.forEach((t) => {
    const existing = categorySpendMap.get(t.categoryId) || { spent: 0, cashback: 0 };
    categorySpendMap.set(t.categoryId, {
      spent: existing.spent + t.amount,
      cashback: existing.cashback + t.cashbackEarned,
    });
  });

  const categoryBreakdown = categories.map((cat) => {
    const data = categorySpendMap.get(cat.id) || { spent: 0, cashback: 0 };
    const pct = totalExpense > 0 ? (data.spent / totalExpense) * 100 : 0;
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
    const exp = cardTx.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);
    const inc = cardTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const cashback = cardTx.reduce((sum, t) => sum + t.cashbackEarned, 0);
    const rate = exp > 0 ? (cashback / exp) * 100 : 0;
    return {
      card,
      expense: exp,
      income: inc,
      net: Math.max(0, exp - inc),
      cashback,
      rate,
    };
  }).sort((a, b) => b.cashback - a.cashback);

  // Cycle Summaries across 4 statements
  const cycleDefinitions = [
    {
      id: 'cycle-1',
      name: 'Kỳ 1: Mở thẻ đầu tiên',
      period: '09/08/2026 – 08/09/2026',
      start: '2026-08-09',
      end: '2026-09-08',
      statusBadge: 'Đã thanh toán',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'cycle-2',
      name: 'Kỳ 2: Kỳ trước (Sao kê T10)',
      period: '09/09/2026 – 08/10/2026',
      start: '2026-09-09',
      end: '2026-10-08',
      statusBadge: 'Quá hạn (Hạn 23/10)',
      statusColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'cycle-3',
      name: 'Kỳ 3: Vừa chốt (Sao kê T11)',
      period: '09/10/2026 – 08/11/2026',
      start: '2026-10-09',
      end: '2026-11-08',
      statusBadge: 'Chờ thanh toán (Hạn 23/11)',
      statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'cycle-4',
      name: 'Kỳ 4: Kỳ hiện tại (Sao kê T12)',
      period: '09/11/2026 – 08/12/2026',
      start: '2026-11-09',
      end: '2026-12-08',
      statusBadge: 'Đang chi tiêu',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  const cycleSummaries: CycleSummary[] = cycleDefinitions.map(def => {
    const cycleTxs = transactions.filter(t => t.date >= def.start && t.date <= def.end);
    const exp = cycleTxs.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);
    const inc = cycleTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const cb = cycleTxs.reduce((sum, t) => sum + t.cashbackEarned, 0);
    return {
      id: def.id,
      name: def.name,
      period: def.period,
      txCount: cycleTxs.length,
      expense: exp,
      income: inc,
      net: Math.max(0, exp - inc),
      cashback: cb,
      statusBadge: def.statusBadge,
      statusColor: def.statusColor,
    };
  });

  return (
    <div className="space-y-6">
      {/* 4 High Level Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Expense */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tổng tiền ra (Chi tiêu)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 my-1">
            {formatVND(totalExpense)}
          </div>
          <div className="text-xs text-slate-500">
            Từ {expenseTxs.length} giao dịch quẹt thẻ
          </div>
        </div>

        {/* Card 2: Income / Refunds */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tiền vào &amp; Hoàn trả</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 my-1">
            +{formatVND(totalIncome)}
          </div>
          <div className="text-xs text-slate-500">
            {incomeTxs.length} giao dịch hoàn tiền / trả góp
          </div>
        </div>

        {/* Card 3: Net Cashflow Out */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Dòng tiền chi thuần (Net)</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 my-1">
            {formatVND(netSpend)}
          </div>
          <div className="text-xs text-slate-500">
            Chiếm {overallUtilization.toFixed(1)}% hạn mức thẻ
          </div>
        </div>

        {/* Card 4: Cashback */}
        <div className="bg-[#f0fbf5] rounded-2xl p-5 border border-[#c3e9d2] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#056c4c] font-semibold mb-1">
            <span>Tổng tiền hoàn (Cashback)</span>
            <Gift className="w-4 h-4 text-[#056c4c]" />
          </div>
          <div className="text-2xl font-black text-[#056c4c] my-1">
            +{formatVND(totalCashback)}
          </div>
          <div className="text-xs text-[#056c4c]/80 font-medium">
            Tỷ lệ hoàn bình quân: <strong>{overallCashbackRate.toFixed(2)}%</strong>
          </div>
        </div>
      </div>

      {/* Cycle-by-Cycle Breakdown Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#056c4c]" />
              <span>Đối soát Dòng tiền theo từng Kỳ Sao kê (4 chu kỳ)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tổng hợp chi tiết tiền ra, tiền vào và dư nợ thực tế phải trả của 79 giao dịch
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            79 giao dịch • 4 chu kỳ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600">
                <th className="py-3 px-3 font-semibold rounded-l-xl">Kỳ sao kê</th>
                <th className="py-3 px-3 font-semibold">Thời gian chu kỳ</th>
                <th className="py-3 px-3 font-semibold text-center">Số GD</th>
                <th className="py-3 px-3 font-semibold text-right">Tiền ra (Chi)</th>
                <th className="py-3 px-3 font-semibold text-right">Tiền vào (Thu)</th>
                <th className="py-3 px-3 font-semibold text-right">Dư nợ thuần (Net)</th>
                <th className="py-3 px-3 font-semibold text-center rounded-r-xl">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cycleSummaries.map((cyc) => (
                <tr key={cyc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {cyc.name}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                    {cyc.period}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                    {cyc.txCount} GD
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                    {formatVND(cyc.expense)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                    {cyc.income > 0 ? `+${formatVND(cyc.income)}` : '0 ₫'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                    {formatVND(cyc.net)}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${cyc.statusColor}`}>
                      {cyc.statusBadge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#056c4c]" />
          <span>Cơ cấu chi tiêu &amp; Hoàn tiền theo danh mục</span>
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
          <span>Hiệu suất thẻ mang lại tiền hoàn</span>
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
                    Chi tiêu ròng: {formatVND(item.net)} • Tỷ lệ hoàn bình quân: {item.rate.toFixed(2)}%
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
