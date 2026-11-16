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
  BadgePercent,
  Percent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info
} from 'lucide-react';
import { CreditCard, Transaction, InstallmentPlan } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';
import { loadPaidStatus, savePaidStatus, loadInstallments } from '../utils/storage';

interface StatementTabProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onAddTransaction: (cardId: string) => void;
}

interface CycleDetails {
  key: string;
  cycleId: 'first' | 'prev' | 'closed' | 'current';
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
  instalmentPrincipal: number;
  instalmentFee: number;
  instalmentOffset: number;
}

export const StatementTab: React.FC<StatementTabProps> = ({
  cards,
  transactions,
  onAddTransaction,
}) => {
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>(() => {
    const loaded = loadPaidStatus();
    // Default the first cycle (09/08 - 08/09) to paid as it was settled on 21/09
    return {
      'card-sample-mb-jcb_2026-08-09_2026-09-08': true,
      ...loaded,
    };
  });
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<'all' | 'first' | 'prev' | 'closed' | 'current' | 'instalment'>('all');
  const [expandedCardCycle, setExpandedCardCycle] = useState<string | null>('card-sample-mb-jcb_2026-10-09_2026-11-08');
  const [showScheduleDetails, setShowScheduleDetails] = useState<boolean>(true);

  const installmentPlans: InstallmentPlan[] = loadInstallments();

  const togglePaid = (key: string) => {
    const next = { ...paidStatus, [key]: !paidStatus[key] };
    setPaidStatus(next);
    savePaidStatus(next);
  };

  const activeCards = cards.filter(c => c.isActive);

  // Compute 3 primary cycles:
  // 1. Kỳ trước (09/09 - 08/10, hạn trả 23/10/2026) -> Đã quá hạn nếu chưa thanh toán
  // 2. Kỳ vừa chốt (09/10 - 08/11, hạn trả 23/11/2026) -> Chứa kỳ 1 trả góp Uniqlo
  // 3. Kỳ hiện tại (09/11 - 08/12, hạn trả 23/12/2026) -> Đang phát sinh chi tiêu mới
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

    // Cycle 0: Kỳ mở thẻ đầu tiên (Tháng 8 -> Tháng 9)
    // 09/08/2026 -> 08/09/2026, hạn thanh toán 23/09/2026 (Đã thanh toán)
    const firstStart = toIso(refYear, 8, stmtDay + 1);
    const firstEnd = toIso(refYear, 9, stmtDay);
    const firstDue = toIso(refYear, 9, dueDay);
    const firstDueMs = new Date(refYear, 8, dueDay).getTime();
    const firstDaysUntilDue = Math.ceil((firstDueMs - today.getTime()) / (1000 * 60 * 60 * 24));

    const firstTxs = transactions.filter(t => t.cardId === card.id && t.date >= firstStart && t.date <= firstEnd);
    const firstExpense = firstTxs.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);
    const firstIncome = firstTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const firstNetDue = Math.max(0, firstExpense - firstIncome);

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
    const prevNetDue = Math.max(0, prevExpense - prevIncome);

    // Cycle 2: Kỳ sao kê vừa chốt (Tháng 10 -> Tháng 11)
    // 09/10/2026 -> 08/11/2026, hạn thanh toán 23/11/2026
    const closedStart = toIso(refYear, 10, stmtDay + 1);
    const closedEnd = toIso(refYear, 11, stmtDay);
    const closedDue = toIso(refYear, 11, dueDay);
    const closedDueMs = new Date(refYear, 10, dueDay).getTime();
    const closedDaysUntilDue = Math.ceil((closedDueMs - today.getTime()) / (1000 * 60 * 60 * 24));

    const closedTxs = transactions.filter(t => t.cardId === card.id && t.date >= closedStart && t.date <= closedEnd);
    const closedExpense = closedTxs.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);
    const closedIncome = closedTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    
    // Phân tích chi tiết hạch toán trả góp trong kỳ này
    const instalmentPrincipal = closedTxs
      .filter(t => t.note?.includes('Principal Due') || t.note?.includes('Gốc trả góp'))
      .reduce((sum, t) => sum + t.amount, 0);
    const instalmentFee = closedTxs
      .filter(t => t.note?.includes('Creation Fee') || t.note?.includes('Phí chuyển đổi'))
      .reduce((sum, t) => sum + t.amount, 0);
    const instalmentOffset = closedTxs
      .filter(t => t.type === 'income' && (t.note?.includes('Retail Creation') || t.note?.includes('Chuyển đổi trả góp')))
      .reduce((sum, t) => sum + t.amount, 0);

    // Net Due chuẩn ngân hàng: Tổng tiền ra - Tổng tiền vào (bao gồm gạch nợ giao dịch gốc Uniqlo)
    const closedNetDue = Math.max(0, closedExpense - closedIncome);

    // Cycle 3: Kỳ chi tiêu hiện tại (Tháng 11 -> Tháng 12)
    // 09/11/2026 -> 08/12/2026, hạn thanh toán 23/12/2026
    const currStart = toIso(refYear, 11, stmtDay + 1);
    const currEnd = toIso(refYear, 12, stmtDay);
    const currDue = toIso(refYear, 12, dueDay);
    const currDueMs = new Date(refYear, 11, dueDay).getTime();
    const currDaysUntilDue = Math.ceil((currDueMs - today.getTime()) / (1000 * 60 * 60 * 24));

    const currTxs = transactions.filter(t => t.cardId === card.id && t.date >= currStart && t.date <= currEnd);
    const currExpense = currTxs.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);
    const currIncome = currTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const currNetDue = Math.max(0, currExpense - currIncome);

    return [
      {
        key: `${card.id}_${firstStart}_${firstEnd}`,
        cycleId: 'first',
        label: 'Kỳ đầu (09/08 – 08/09)',
        startDate: firstStart,
        endDate: firstEnd,
        dueDate: firstDue,
        daysUntilDue: firstDaysUntilDue,
        isOverdue: false,
        totalSpent: firstExpense,
        totalIncome: firstIncome,
        netDue: firstNetDue,
        txs: firstTxs,
        instalmentPrincipal: 0,
        instalmentFee: 0,
        instalmentOffset: 0,
      },
      {
        key: `${card.id}_${prevStart}_${prevEnd}`,
        cycleId: 'prev',
        label: 'Kỳ trước (09/09 – 08/10)',
        startDate: prevStart,
        endDate: prevEnd,
        dueDate: prevDue,
        daysUntilDue: prevDaysUntilDue,
        isOverdue: prevDaysUntilDue < 0,
        totalSpent: prevExpense,
        totalIncome: prevIncome,
        netDue: prevNetDue,
        txs: prevTxs,
        instalmentPrincipal: 0,
        instalmentFee: 0,
        instalmentOffset: 0,
      },
      {
        key: `${card.id}_${closedStart}_${closedEnd}`,
        cycleId: 'closed',
        label: 'Kỳ sao kê vừa chốt (09/10 – 08/11)',
        startDate: closedStart,
        endDate: closedEnd,
        dueDate: closedDue,
        daysUntilDue: closedDaysUntilDue,
        isOverdue: closedDaysUntilDue < 0,
        totalSpent: closedExpense,
        totalIncome: closedIncome,
        netDue: closedNetDue,
        txs: closedTxs,
        instalmentPrincipal,
        instalmentFee,
        instalmentOffset,
      },
      {
        key: `${card.id}_${currStart}_${currEnd}`,
        cycleId: 'current',
        label: 'Kỳ chi tiêu hiện tại (09/11 – 08/12)',
        startDate: currStart,
        endDate: currEnd,
        dueDate: currDue,
        daysUntilDue: currDaysUntilDue,
        isOverdue: currDaysUntilDue < 0,
        totalSpent: currExpense,
        totalIncome: currIncome,
        netDue: currNetDue,
        txs: currTxs,
        instalmentPrincipal: 0,
        instalmentFee: 0,
        instalmentOffset: 0,
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
            <span>Theo dõi kỳ sao kê &amp; Hạch toán Trả góp ngân hàng</span>
          </h2>
          <p className="text-xs text-slate-500">
            Tính toán dư nợ sao kê, lịch trích nợ tự động và quản lý dư nợ gốc trả góp 0% chuẩn theo sổ kế toán MB Bank.
          </p>
        </div>

        {/* Filter cycle buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setSelectedCycleFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedCycleFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSelectedCycleFilter('closed')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCycleFilter === 'closed'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Kỳ chốt 08/11 (Đến hạn 23/11)</span>
          </button>
          <button
            onClick={() => setSelectedCycleFilter('instalment')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCycleFilter === 'instalment'
                ? 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-indigo-600" />
            <span>Gói trả góp Uniqlo (6 kỳ)</span>
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
            <span>Kỳ trước (Quá hạn)</span>
          </button>
          <button
            onClick={() => setSelectedCycleFilter('first')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCycleFilter === 'first'
                ? 'bg-slate-200 text-slate-800 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kỳ đầu (09/08 – 08/09)</span>
          </button>
        </div>
      </div>

      {/* Warning for Unpaid Previous Statement */}
      {cards.some(card => {
        const cycles = getCyclesForCard(card);
        const prevCycle = cycles.find(c => c.cycleId === 'prev');
        return prevCycle && prevCycle.isOverdue && !paidStatus[prevCycle.key];
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

      {/* DEDICATED SECTION: MB INSTALMENT TRACKER (Khối Trả góp 0% UNIQLO Chuẩn MB App) */}
      {(selectedCycleFilter === 'all' || selectedCycleFilter === 'instalment' || selectedCycleFilter === 'closed') && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-indigo-800/40 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                    UNIQLO AEONMALL-LC-HP
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    0% LÃI SUẤT
                  </span>
                </div>
                <div className="text-xs text-indigo-200/80 mt-0.5 flex items-center gap-2">
                  <span>JCB CREDIT | **** 0764</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đang trả góp
                  </span>
                </div>
              </div>
            </div>

            {/* Remaining Installment Debt */}
            <div className="text-left sm:text-right bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-xs text-indigo-200/70 block mb-0.5">Dư nợ trả góp còn lại:</span>
              <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
                980.833 VND
              </div>
              <span className="text-[11px] text-white/60">
                (Khóa trong hạn mức thẻ cho tới khi trả hết)
              </span>
            </div>
          </div>

          {/* Progress Bar & Summary */}
          <div className="py-5">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-indigo-200 font-medium">Tiến độ thanh toán trả góp:</span>
              <span className="font-bold text-white font-mono">
                196.167 VND / 1.177.000 VND <span className="text-indigo-300">(Kỳ 1/6)</span>
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-700 shadow-sm"
                style={{ width: `${(196167 / 1177000) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-white/50 mt-1.5">
              <span>Đã lên sao kê: Kỳ 1 (196.167 ₫)</span>
              <span>Còn lại 5 kỳ (980.833 ₫)</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-t border-b border-white/10 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-indigo-200/70 block mb-1">Kỳ hạn trả góp</span>
              <span className="font-bold text-white text-sm">6 tháng</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-indigo-200/70 block mb-1">Lãi suất</span>
              <span className="font-bold text-emerald-400 text-sm">0%</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-indigo-200/70 block mb-1">Phí chuyển đổi thu trước</span>
              <span className="font-bold text-amber-300 text-sm">56.496 VND</span>
              <span className="text-[10px] text-white/50 block mt-0.5">Thu vào kỳ sao kê đầu tiên</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-indigo-200/70 block mb-1">Mã khoản trả góp</span>
              <span className="font-bold text-white font-mono text-sm">53854385050</span>
            </div>
          </div>

          {/* Dates & Schedule */}
          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-indigo-200/90">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-white/50 block text-[11px]">Ngày đăng ký:</span>
                <strong className="text-white">04/11/2026</strong>
              </div>
              <div>
                <span className="text-white/50 block text-[11px]">Ngày bắt đầu:</span>
                <strong className="text-white">09/11/2026</strong>
              </div>
              <div>
                <span className="text-white/50 block text-[11px]">Ngày kết thúc:</span>
                <strong className="text-emerald-400 font-bold">23/04/2027</strong>
              </div>
            </div>

            <button
              onClick={() => setShowScheduleDetails(!showScheduleDetails)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <span>{showScheduleDetails ? 'Ẩn lịch trình 6 kỳ' : 'Xem lịch trình 6 kỳ'}</span>
              {showScheduleDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* 6 Periods Schedule Table */}
          {showScheduleDetails && (
            <div className="mt-5 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-indigo-400" />
                <span>Bảng phân bổ 6 kỳ thanh toán &amp; Tiến trình giải phóng hạn mức</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/15 text-indigo-200/70 text-[11px]">
                      <th className="py-2 px-3 font-semibold">Kỳ</th>
                      <th className="py-2 px-3 font-semibold">Ngày chốt sao kê</th>
                      <th className="py-2 px-3 font-semibold">Hạn thanh toán</th>
                      <th className="py-2 px-3 font-semibold text-right">Gốc trả góp</th>
                      <th className="py-2 px-3 font-semibold text-right">Phí dịch vụ</th>
                      <th className="py-2 px-3 font-semibold text-right">Tổng phải trả</th>
                      <th className="py-2 px-3 font-semibold text-center">Tác động hạn mức</th>
                      <th className="py-2 px-3 font-semibold text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-sans">
                    <tr className="bg-emerald-500/10 font-medium">
                      <td className="py-2.5 px-3 font-bold text-white">Kỳ 1</td>
                      <td className="py-2.5 px-3">08/11/2026</td>
                      <td className="py-2.5 px-3 font-bold text-amber-300">23/11/2026</td>
                      <td className="py-2.5 px-3 text-right font-mono">196.167 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300">56.496 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-300">252.663 ₫</td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-emerald-300">Hồi lại +196.167 ₫ khi thanh toán</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                          Đã lên sao kê (Chờ trích nợ 23/11)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white/90">Kỳ 2</td>
                      <td className="py-2.5 px-3 text-white/70">08/12/2026</td>
                      <td className="py-2.5 px-3 text-white/90">23/12/2026</td>
                      <td className="py-2.5 px-3 text-right font-mono">196.167 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono text-white/40">0 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">196.167 ₫</td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-indigo-300">Hồi lại +196.167 ₫</td>
                      <td className="py-2.5 px-3 text-right text-white/50 text-[11px]">Chờ sao kê</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white/90">Kỳ 3</td>
                      <td className="py-2.5 px-3 text-white/70">08/01/2027</td>
                      <td className="py-2.5 px-3 text-white/90">23/01/2027</td>
                      <td className="py-2.5 px-3 text-right font-mono">196.167 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono text-white/40">0 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">196.167 ₫</td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-indigo-300">Hồi lại +196.167 ₫</td>
                      <td className="py-2.5 px-3 text-right text-white/50 text-[11px]">Chờ sao kê</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white/90">Kỳ 4</td>
                      <td className="py-2.5 px-3 text-white/70">08/02/2027</td>
                      <td className="py-2.5 px-3 text-white/90">23/02/2027</td>
                      <td className="py-2.5 px-3 text-right font-mono">196.166 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono text-white/40">0 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">196.166 ₫</td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-indigo-300">Hồi lại +196.166 ₫</td>
                      <td className="py-2.5 px-3 text-right text-white/50 text-[11px]">Chờ sao kê</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white/90">Kỳ 5</td>
                      <td className="py-2.5 px-3 text-white/70">08/03/2027</td>
                      <td className="py-2.5 px-3 text-white/90">23/03/2027</td>
                      <td className="py-2.5 px-3 text-right font-mono">196.167 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono text-white/40">0 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">196.167 ₫</td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-indigo-300">Hồi lại +196.167 ₫</td>
                      <td className="py-2.5 px-3 text-right text-white/50 text-[11px]">Chờ sao kê</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white/90">Kỳ 6</td>
                      <td className="py-2.5 px-3 text-white/70">08/04/2027</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">23/04/2027</td>
                      <td className="py-2.5 px-3 text-right font-mono">196.166 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono text-white/40">0 ₫</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">196.166 ₫</td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-emerald-400 font-bold">Giải phóng 100% hạn mức</td>
                      <td className="py-2.5 px-3 text-right text-emerald-300 text-[11px] font-bold">Kỳ cuối (Kết thúc)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Explanatory Rule Box */}
              <div className="mt-4 p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-start gap-3 text-xs leading-relaxed">
                <Info className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                <div className="text-indigo-100">
                  <strong className="text-white block mb-0.5">Cơ chế quản lý hạn mức &amp; sao kê ngân hàng MB:</strong>
                  Khi quẹt thẻ tại Uniqlo 1.177.000 ₫, toàn bộ 1.177.000 ₫ bị giữ trong hạn mức. Khi chuyển trả góp, ngân hàng tạo bút toán ghi Có <strong>+1.177.000 ₫</strong> (để gạch nợ chi tiêu 1 lần), thu phí <strong>56.496 ₫</strong> và đưa <strong>196.167 ₫</strong> gốc kỳ 1 vào sao kê chốt ngày 08/11/2026. Phần dư nợ gốc còn lại <strong>980.833 ₫</strong> tiếp tục phong tỏa hạn mức thẻ. Cứ mỗi tháng bạn thanh toán 1 kỳ (196.167 ₫), ngân hàng sẽ <strong>hoàn trả lại đúng 196.167 ₫ vào hạn mức khả dụng</strong>!
                </div>
              </div>
            </div>
          )}
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
                            : cycle.cycleId === 'closed'
                            ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-100'
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
                                    ? 'bg-rose-100 text-rose-800'
                                    : cycle.cycleId === 'closed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : cycle.cycleId === 'first'
                                    ? 'bg-slate-100 text-slate-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {cycle.label}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 font-medium mt-1 block">
                                Chu kỳ giao dịch: {formatDateVN(cycle.startDate)} – {formatDateVN(cycle.endDate)}
                              </span>
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
                                  <span>Đến hạn ngày 23</span>
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
                                  : cycle.daysUntilDue < 0
                                  ? `Đã quá hạn ${Math.abs(cycle.daysUntilDue)} ngày!`
                                  : `Còn ${cycle.daysUntilDue} ngày nữa (Trích nợ)`
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

                          {/* Bank Ledger Breakdown for Cycle 2 (Kỳ sao kê vừa chốt có trả góp) */}
                          {cycle.cycleId === 'closed' && (cycle.instalmentPrincipal > 0 || cycle.instalmentFee > 0) && (
                            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 mb-3 text-xs space-y-1.5">
                              <div className="font-bold text-indigo-950 flex items-center justify-between pb-1 border-b border-indigo-200/60">
                                <span>Hạch toán Sao kê theo sổ ngân hàng:</span>
                                <span className="font-mono text-indigo-700">Chuẩn MB Bank</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-600">
                                <span>• Tổng quẹt chi tiêu gốc trong kỳ:</span>
                                <span className="font-mono font-medium">+{formatVND(cycle.totalSpent - cycle.instalmentPrincipal - cycle.instalmentFee)}</span>
                              </div>
                              {cycle.instalmentOffset > 0 && (
                                <div className="flex justify-between items-center text-emerald-700">
                                  <span>• Gạch nợ chuyển đổi trả góp Uniqlo:</span>
                                  <span className="font-mono font-medium">-{formatVND(cycle.instalmentOffset)}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-indigo-900 font-medium">
                                <span>• Gốc trả góp Uniqlo (Kỳ 1/6):</span>
                                <span className="font-mono font-bold">+{formatVND(cycle.instalmentPrincipal)}</span>
                              </div>
                              <div className="flex justify-between items-center text-amber-800 font-medium">
                                <span>• Phí chuyển đổi trả góp (Kỳ đầu):</span>
                                <span className="font-mono font-bold">+{formatVND(cycle.instalmentFee)}</span>
                              </div>
                            </div>
                          )}

                          {/* Net Statement Due Amount */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-slate-500 block">
                                Dư nợ sao kê thực tế cần thanh toán:
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
                                {cycle.txs.length} dòng hạch toán
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
                                <span>Chi tiết các dòng giao dịch &amp; hạch toán ({cycle.txs.length})</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 max-h-56 overflow-y-auto space-y-1.5 p-2 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                                  {cycle.txs.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between py-1 border-b border-slate-100/80 last:border-0">
                                      <div className="truncate pr-2">
                                        <span className="text-slate-700 font-medium block truncate">{tx.note || 'Chi tiêu thẻ'}</span>
                                        <span className="text-[10px] text-slate-400">{formatDateVN(tx.date)} {tx.mcc ? `• MCC ${tx.mcc}` : ''}</span>
                                      </div>
                                      <span className={`font-semibold shrink-0 font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
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
