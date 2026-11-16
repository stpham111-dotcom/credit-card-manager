import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  CreditCard as CardIcon, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  ReceiptText,
  BadgePercent
} from 'lucide-react';
import { CreditCard, Transaction } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';
import { loadPaidStatus, savePaidStatus } from '../utils/storage';

interface StatementTabProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onAddTransaction: (cardId: string) => void;
}

interface CycleDetails {
  key: string;
  cycleId: 'prev' | 'current' | 'next';
  label: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  daysUntilDue: number;
  isOverdue: boolean;
  totalSpent: number;
  totalIncome: number;
  netDue: number;
  txs: Transaction[];
}

export const StatementTab: React.FC<StatementTabProps> = ({
  cards,
  transactions,
  onAddTransaction,
}) => {
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>(() => loadPaidStatus());
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<'all' | 'prev' | 'current'>('all');
  const [expandedCardCycle, setExpandedCardCycle] = useState<string | null>(null);

  const togglePaid = (key: string) => {
    const next = { ...paidStatus, [key]: !paidStatus[key] };
    setPaidStatus(next);
    savePaidStatus(next);
  };

  const activeCards = cards.filter(c => c.isActive);

  // Compute 2 primary cycles: Kỳ trước (09/09 - 08/10) và Kỳ này (09/10 - 08/11)
  const getCyclesForCard = (card: CreditCard): CycleDetails[] => {
    const refYear = 2026;
    const stmtDay = card.statementDay || 8;
    const dueDay = card.paymentDueDayFixed || 23;
    const today = new Date(2026, 10, 16); // 16/11/2026

    const toIso = (y: number, m: number, d: number) => {
      const mm = String(m).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    };

    // Cycle 1: Kỳ trước (Tháng 9 -> Tháng 10)
    // 09/09/2026 -> 08/10/2026, hạn thanh toán 23/10/2026
    const prevStart = toIso(refYear, 9, stmtDay + 1);
    const prevEnd = toIso(refYear, 10, stmtDay);
    const prevDue = toIso(refYear, 10, dueDay);
    const prevDueMs = new Date(refYear, 9, dueDay).getTime();
    const prevDaysUntilDue = Math.ceil((prevDueMs - today.getTime()) / (1000 * 60 * 60 * 24));

    const prevTxs = transactions.filter(t => t.cardId === card.id && t.date >= prevStart && t.date <= prevEnd);
    const prevExpense = prevTxs.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);
    const prevIncome = prevTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    // Cycle 2: Kỳ này (Tháng 10 -> Tháng 11)
    // 09/10/2026 -> 08/11/2026, hạn thanh toán 23/11/2026
    const currStart = toIso(refYear, 10, stmtDay + 1);
    const currEnd = toIso(refYear, 11, stmtDay);
    const currDue = toIso(refYear, 11, dueDay);
    const currDueMs = new Date(refYear, 10, dueDay).getTime();
    const currDaysUntilDue = Math.ceil((currDueMs - today.getTime()) / (1000 * 60 * 60 * 24));

    const currTxs = transactions.filter(t => t.cardId === card.id && t.date >= currStart && t.date <= currEnd);
    const currExpense = currTxs.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);
    const currIncome = currTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    return [
      {
        key: `${card.id}_${prevStart}_${prevEnd}`,
        cycleId: 'prev',
        label: 'Kỳ trước',
        startDate: prevStart,
        endDate: prevEnd,
        dueDate: prevDue,
        daysUntilDue: prevDaysUntilDue,
        isOverdue: prevDaysUntilDue < 0,
        totalSpent: prevExpense,
        totalIncome: prevIncome,
        netDue: prevExpense,
        txs: prevTxs,
      },
      {
        key: `${card.id}_${currStart}_${currEnd}`,
        cycleId: 'current',
        label: 'Kỳ này',
        startDate: currStart,
        endDate: currEnd,
        dueDate: currDue,
        daysUntilDue: currDaysUntilDue,
        isOverdue: currDaysUntilDue < 0,
        totalSpent: currExpense,
        totalIncome: currIncome,
        netDue: currExpense,
        txs: currTxs,
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#056c4c]" />
            <span>Theo dõi kỳ sao kê &amp; Hạn thanh toán</span>
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi chi tiết ngày chốt sao kê, lịch trích nợ tự động và trạng thái thanh toán của từng kỳ.
          </p>
        </div>

        {/* Filter cycle buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setSelectedCycleFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedCycleFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả kỳ
          </button>
          <button
            onClick={() => setSelectedCycleFilter('prev')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCycleFilter === 'prev'
                ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Kỳ trước (Chưa thanh toán)</span>
          </button>
          <button
            onClick={() => setSelectedCycleFilter('current')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedCycleFilter === 'current'
                ? 'bg-[#edf8f2] text-[#056c4c] font-bold border border-[#c3e9d2] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kỳ này (Chốt 08/11)
          </button>
        </div>
      </div>

      {/* Warning Notice if Previous Cycle is Unpaid */}
      {activeCards.some(card => {
        const cycles = getCyclesForCard(card);
        const prev = cycles.find(c => c.cycleId === 'prev');
        return prev && !paidStatus[prev.key];
      }) && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-rose-950 text-sm">
              Cảnh báo: Kỳ sao kê trước (09/09/2026 – 08/10/2026) CHƯA THANH TOÁN!
            </h4>
            <p className="text-rose-800 leading-relaxed">
              Hạn thanh toán kỳ trước là ngày <strong>23/10/2026</strong> (hiện đã quá hạn). Hãy kiểm tra lại số dư tài khoản trích nợ tự động hoặc thanh toán dư nợ để tránh bị ngân hàng MB Bank tính lãi quá hạn và phí phạt chậm trả.
            </p>
          </div>
        </div>
      )}

      {/* Main Cards List */}
      {activeCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 text-slate-500 text-sm">
          Chưa có thẻ tín dụng nào được kích hoạt. Hãy thêm thẻ tại mục Tổng quan hoặc Quản lý thẻ.
        </div>
      ) : (
        <div className="space-y-6">
          {activeCards.map((card) => {
            const allCycles = getCyclesForCard(card);
            const filteredCycles = allCycles.filter(c => {
              if (selectedCycleFilter === 'all') return true;
              return c.cycleId === selectedCycleFilter;
            });

            return (
              <div key={card.id} className="space-y-4">
                {/* Card Title Banner */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-7 rounded-md shadow-xs flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: card.themeColor }}
                    >
                      {card.bankName}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        {card.bankName} - {card.cardName}
                      </h3>
                      <span className="text-xs text-slate-500">
                        Hạn mức: {formatVND(card.creditLimit)} • Trích nợ: {card.paymentRate === 'minimum' ? 'Tối thiểu 5%' : 'Toàn bộ nợ (100%)'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddTransaction(card.id)}
                    className="text-xs text-[#056c4c] font-semibold hover:underline cursor-pointer hidden sm:block"
                  >
                    + Nhập giao dịch
                  </button>
                </div>

                {/* Cycles Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredCycles.map((cycle) => {
                    const isPaid = !!paidStatus[cycle.key];
                    const isExpanded = expandedCardCycle === cycle.key;

                    return (
                      <div
                        key={cycle.key}
                        className={`bg-white rounded-2xl border transition-shadow p-5 flex flex-col justify-between ${
                          cycle.cycleId === 'prev' && !isPaid
                            ? 'border-rose-300 shadow-xs ring-1 ring-rose-200'
                            : 'border-slate-200/90 shadow-2xs'
                        }`}
                      >
                        <div>
                          {/* Cycle Header */}
                          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  cycle.cycleId === 'prev'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {cycle.label}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                  {formatDateVN(cycle.startDate)} – {formatDateVN(cycle.endDate)}
                                </span>
                              </div>
                            </div>

                            {/* Payment Status Badge */}
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : cycle.isOverdue
                                  ? 'bg-rose-50 text-rose-700 border border-rose-300 font-bold'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isPaid ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Đã thanh toán</span>
                                </>
                              ) : cycle.isOverdue ? (
                                <>
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                                  <span>Chưa thanh toán (Quá hạn!)</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Chưa thanh toán</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Key Dates Strip */}
                          <div className="grid grid-cols-2 gap-3 py-4">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-xs text-slate-500 block mb-0.5">Ngày lên sao kê</span>
                              <span className="text-xs font-bold text-slate-800 block">
                                {formatDateVN(cycle.endDate)}
                              </span>
                              <span className="text-[11px] text-slate-400 mt-0.5 block">
                                Mùng {card.statementDay} hàng tháng
                              </span>
                            </div>

                            <div className={`p-3 rounded-xl border ${
                              !isPaid && cycle.isOverdue
                                ? 'bg-rose-50/70 border-rose-200'
                                : 'bg-slate-50 border-slate-100'
                            }`}>
                              <span className="text-xs text-slate-500 block mb-0.5">Kỳ hạn thanh toán</span>
                              <span className={`text-xs font-bold block ${
                                !isPaid && cycle.isOverdue ? 'text-rose-700' : 'text-slate-800'
                              }`}>
                                {formatDateVN(cycle.dueDate)}
                              </span>
                              <span className={`text-[11px] font-semibold mt-0.5 block ${
                                isPaid
                                  ? 'text-emerald-600'
                                  : cycle.isOverdue
                                  ? 'text-rose-600 font-bold'
                                  : 'text-amber-600'
                              }`}>
                                {isPaid
                                  ? 'Đã hoàn tất thanh toán'
                                  : cycle.daysUntilDue < 0
                                  ? `Đã quá hạn ${Math.abs(cycle.daysUntilDue)} ngày!`
                                  : `Còn ${cycle.daysUntilDue} ngày nữa`}
                              </span>
                            </div>
                          </div>

                          {/* Auto debit details */}
                          {card.paymentMethod === 'auto_debit' && (
                            <div className="p-3 rounded-xl bg-[#edf8f2] border border-[#c3e9d2] mb-3 text-xs space-y-1">
                              <div className="flex justify-between items-center text-slate-700">
                                <span className="text-slate-500">Hình thức thanh toán:</span>
                                <strong className="text-[#056c4c]">Trích nợ tự động (Toàn bộ nợ 100%)</strong>
                              </div>
                              {card.autoDebitAccount && (
                                <div className="flex justify-between items-center text-slate-700">
                                  <span className="text-slate-500">Tài khoản trích nợ:</span>
                                  <span className="font-mono font-semibold text-slate-800">{card.autoDebitAccount}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Amount Balances */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-slate-500 block">
                                {card.paymentRate === 'minimum' ? 'Số tiền tối thiểu 5%:' : 'Số tiền sao kê cần thanh toán:'}
                              </span>
                              <span className={`text-lg font-bold block ${
                                !isPaid && cycle.isOverdue ? 'text-rose-600' : 'text-slate-900'
                              }`}>
                                {formatVND(card.paymentRate === 'minimum' ? cycle.netDue * 0.05 : cycle.netDue)}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-slate-500 block">Giao dịch trong kỳ:</span>
                              <span className="text-sm font-semibold text-slate-700">
                                {cycle.txs.length} giao dịch
                              </span>
                            </div>
                          </div>

                          {/* Collapsible Transactions list in this cycle */}
                          {cycle.txs.length > 0 && (
                            <div className="mb-3">
                              <button
                                onClick={() => setExpandedCardCycle(isExpanded ? null : cycle.key)}
                                className="w-full text-left text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between py-2 px-1 cursor-pointer"
                              >
                                <span>Xem chi tiết {cycle.txs.length} giao dịch kỳ này</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                                  {cycle.txs.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between py-1 border-b border-slate-100/80 last:border-0">
                                      <div className="truncate pr-2">
                                        <span className="text-slate-700 font-medium block truncate">{tx.note || 'Chi tiêu thẻ'}</span>
                                        <span className="text-[10px] text-slate-400">{formatDateVN(tx.date)} {tx.mcc ? `• MCC ${tx.mcc}` : ''}</span>
                                      </div>
                                      <span className={`font-semibold shrink-0 ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                        {tx.type === 'income' ? `+${formatVND(tx.amount)}` : `-${formatVND(tx.amount)}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom Action Button: Toggle Paid */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Cập nhật trạng thái thanh toán:
                          </span>

                          <button
                            onClick={() => togglePaid(cycle.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isPaid
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : cycle.isOverdue
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                                : 'bg-[#056c4c] hover:bg-[#04593e] text-white shadow-xs'
                            }`}
                          >
                            {isPaid ? 'Đánh dấu Chưa thanh toán' : 'Đánh dấu Đã thanh toán xong'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
