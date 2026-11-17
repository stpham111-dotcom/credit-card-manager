import React, { useState, useMemo } from 'react';
import { 
  CreditCard as CreditCardIcon, 
  TrendingUp, 
  Gift, 
  Eye, 
  EyeOff,
  Check, 
  ChevronDown, 
  Plus, 
  Sparkles, 
  ReceiptText, 
  Trash2, 
  Edit3, 
  ArrowRight 
} from 'lucide-react';
import { CreditCard, Transaction, DisplayOptions } from '../types';
import { analyzeCardCycle, CardCycleAnalysis } from '../utils/cashbackCalculator';
import { formatVND, formatDateVN } from '../utils/formatters';
import { CreditCardItem } from './CreditCardItem';
import { MBJCBPolicyModal } from './MBJCBPolicyModal';
import { loadInstallments } from '../utils/storage';

interface OverviewTabProps {
  cards: CreditCard[];
  transactions: Transaction[];
  displayOptions: DisplayOptions;
  onUpdateDisplayOptions: (options: DisplayOptions) => void;
  onOpenAddCard: () => void;
  onOpenAddTransaction: (cardId?: string) => void;
  onEditCard: (card: CreditCard) => void;
  onSeedSampleData: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onViewAllTransactions?: () => void;
}

type SortOption = 'custom' | 'limit-desc' | 'spent-desc' | 'statement-asc' | 'cashback-desc';

export const OverviewTab: React.FC<OverviewTabProps> = ({
  cards,
  transactions,
  displayOptions,
  onUpdateDisplayOptions,
  onOpenAddCard,
  onOpenAddTransaction,
  onEditCard,
  onSeedSampleData,
  onEditTransaction,
  onDeleteTransaction,
  onViewAllTransactions,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('custom');

  const cardMap = useMemo(() => new Map(cards.map(c => [c.id, c])), [cards]);
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [transactions]);

  // Compute analysis for each active card
  const cardAnalyses: CardCycleAnalysis[] = useMemo(() => {
    return cards
      .filter(c => c.isActive)
      .map(card => analyzeCardCycle(card, transactions));
  }, [cards, transactions]);

  // Aggregate metrics
  const totalCardsCount = cardAnalyses.length;
  const totalLimit = cardAnalyses.reduce((sum, item) => sum + item.creditLimit, 0);
  const totalSpentCycle = cardAnalyses.reduce((sum, item) => sum + item.totalSpent, 0);
  const totalEstimatedCashback = cardAnalyses.reduce((sum, item) => sum + item.totalCappedCashback, 0);

  const installmentPlans = useMemo(() => loadInstallments(), []);
  const activeInstallmentDebt = useMemo(() => {
    return installmentPlans
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.remainingDebt, 0);
  }, [installmentPlans]);

  // Hạn mức khả dụng chuẩn ngân hàng: Tổng hạn mức - Chi tiêu kỳ này - Dư nợ gốc trả góp đang khóa hạn mức
  const totalAvailableLimit = Math.max(0, totalLimit - totalSpentCycle - activeInstallmentDebt);

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isHideBalances, setIsHideBalances] = useState(() => {
    try {
      return localStorage.getItem('hoantien_hide_balances') === 'true';
    } catch {
      return false;
    }
  });

  const toggleHideBalances = () => {
    const next = !isHideBalances;
    setIsHideBalances(next);
    try {
      localStorage.setItem('hoantien_hide_balances', String(next));
    } catch {}
  };

  const maskMoney = (amount: number) => {
    if (isHideBalances) return '•••••• ₫';
    return formatVND(amount);
  };

  // Sorting
  const sortedAnalyses = useMemo(() => {
    const list = [...cardAnalyses];
    switch (sortBy) {
      case 'limit-desc':
        return list.sort((a, b) => b.creditLimit - a.creditLimit);
      case 'spent-desc':
        return list.sort((a, b) => b.totalSpent - a.totalSpent);
      case 'cashback-desc':
        return list.sort((a, b) => b.totalCappedCashback - a.totalCappedCashback);
      case 'statement-asc':
        return list.sort((a, b) => a.daysUntilStatement - b.daysUntilStatement);
      case 'custom':
      default:
        return list.sort((a, b) => (a.card.order || 0) - (b.card.order || 0));
    }
  }, [cardAnalyses, sortBy]);

  // Toggle helper
  const toggleOption = (key: keyof DisplayOptions) => {
    onUpdateDisplayOptions({
      ...displayOptions,
      [key]: !displayOptions[key],
    });
  };

  return (
    <div className="space-y-6">
      {/* 4 Interactive Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Số thẻ đang dùng */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Số thẻ đang dùng</span>
            <button
              onClick={onOpenAddCard}
              className="w-8 h-8 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
              title="Bấm để thêm thẻ tín dụng mới"
            >
              <CreditCardIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalCardsCount}
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>{totalCardsCount === 0 ? 'Chưa có thẻ nào' : `${totalCardsCount} thẻ đang dùng`}</span>
            <button
              onClick={onOpenAddCard}
              className="text-[#056c4c] hover:underline font-semibold text-[11px] cursor-pointer"
            >
              + Thêm thẻ
            </button>
          </div>
        </div>

        {/* Metric 2: Hạn mức khả dụng & Tổng hạn mức (Active Eye Button) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Hạn mức khả dụng</span>
            <button
              onClick={toggleHideBalances}
              className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow-2xs ${
                isHideBalances 
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
              }`}
              title={isHideBalances ? 'Bấm để hiển thị số tiền' : 'Bấm để ẩn số tiền (Bảo mật số dư)'}
            >
              {isHideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {maskMoney(totalAvailableLimit)}
            </div>
          </div>
          <div className="text-xs text-slate-500 truncate">
            {totalLimit === 0 ? (
              'Chưa khai hạn mức'
            ) : (
              <span className="flex items-center gap-1.5 flex-wrap">
                <span>Khả dụng: <strong className="text-emerald-700 font-bold">{maskMoney(totalAvailableLimit)}</strong> / {maskMoney(totalLimit)}</span>
                {activeInstallmentDebt > 0 && (
                  <span className="text-indigo-600 font-medium text-[11px]">
                    (Trả góp giữ: {maskMoney(activeInstallmentDebt)})
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Chi tiêu kỳ này (Active TrendingUp Button -> View Transactions) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Chi tiêu kỳ này</span>
            <button
              onClick={onViewAllTransactions}
              className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
              title="Bấm để xem lịch sử & quản lý giao dịch"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {maskMoney(totalSpentCycle)}
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span className="truncate">
              Đã dùng {totalLimit > 0 ? ((totalSpentCycle / totalLimit) * 100).toFixed(1) : 0}% hạn mức
            </span>
            {onViewAllTransactions && (
              <button
                onClick={onViewAllTransactions}
                className="text-amber-700 hover:underline font-semibold text-[11px] cursor-pointer shrink-0"
              >
                Xem chi tiết →
              </button>
            )}
          </div>
        </div>

        {/* Metric 4: Cashback dự kiến (Active Gift Button -> View Policy Modal) */}
        <div className="bg-[#f0fbf5] rounded-2xl p-5 border border-[#c3e9d2] shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#056c4c]">Cashback dự kiến</span>
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="w-8 h-8 rounded-lg bg-[#ddf4e7] hover:bg-[#cbeedb] text-[#056c4c] flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
              title="Bấm để xem chi tiết thể lệ hoàn tiền MB JCB Platinum"
            >
              <Gift className="w-4 h-4" />
            </button>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#056c4c] tracking-tight truncate">
              {maskMoney(totalEstimatedCashback)}
            </div>
          </div>
          <div className="text-xs text-[#056c4c]/80 flex items-center justify-between">
            <span className="truncate">Theo thể lệ hoàn tiền</span>
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="text-[#056c4c] hover:underline font-bold text-[11px] cursor-pointer shrink-0"
            >
              Xem thể lệ →
            </button>
          </div>
        </div>
      </div>

      {/* Active Installment Widget Banner */}
      {activeInstallmentDebt > 0 && installmentPlans.length > 0 && (
        <div className="bg-gradient-to-r from-[#0b192c] via-[#1e3e62] to-[#0b192c] rounded-2xl p-4 sm:p-5 text-white border border-slate-700/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex flex-col items-center justify-center text-white shrink-0">
              <span className="text-xs font-black">0%</span>
              <span className="text-[8px] uppercase tracking-wider text-indigo-300 font-bold">Góp</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  Đang trả góp 0%: {installmentPlans[0].merchantName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Kỳ {installmentPlans[0].paidPeriods}/{installmentPlans[0].tenorMonths}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Dư nợ còn lại: <strong className="text-white">{maskMoney(installmentPlans[0].remainingDebt)}</strong> • Gốc mỗi kỳ: <strong>{maskMoney(installmentPlans[0].monthlyPrincipal)}</strong> • Hạn mức thẻ đang khóa: {maskMoney(installmentPlans[0].remainingDebt)}
              </p>
            </div>
          </div>

          <a
            href="#/installments"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors shrink-0 no-underline cursor-pointer"
          >
            <span>Chi tiết 6 kỳ trả nợ</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
          </a>
        </div>
      )}

      {/* Progress & Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            Tiến độ chi tiêu theo thẻ {totalCardsCount}
          </h2>

          {/* Sắp xếp selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Sắp xếp</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
              >
                <option value="custom">Thứ tự tôi đã sắp xếp</option>
                <option value="limit-desc">Hạn mức cao nhất</option>
                <option value="spent-desc">Chi tiêu kỳ này nhiều nhất</option>
                <option value="cashback-desc">Cashback nhiều nhất</option>
                <option value="statement-asc">Gần ngày sao kê nhất</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* HIỂN THỊ Toggle Chips - matching the screenshot */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">
            Hiển thị
          </span>

          <button
            onClick={() => toggleOption('showPersonalTarget')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              displayOptions.showPersonalTarget
                ? 'bg-[#edf8f2] border-[#a3dfbd] text-[#056c4c] font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {displayOptions.showPersonalTarget && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>Đã chi & mục tiêu cá nhân</span>
          </button>

          <button
            onClick={() => toggleOption('showEstimatedCashback')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              displayOptions.showEstimatedCashback
                ? 'bg-[#edf8f2] border-[#a3dfbd] text-[#056c4c] font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {displayOptions.showEstimatedCashback && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>Cashback dự kiến</span>
          </button>

          <button
            onClick={() => toggleOption('showCategoryCashback')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              displayOptions.showCategoryCashback
                ? 'bg-[#edf8f2] border-[#a3dfbd] text-[#056c4c] font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {displayOptions.showCategoryCashback && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>Cashback theo danh mục</span>
          </button>

          <button
            onClick={() => toggleOption('showCardTerms')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              displayOptions.showCardTerms
                ? 'bg-[#edf8f2] border-[#a3dfbd] text-[#056c4c] font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {displayOptions.showCardTerms && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>Điều kiện của thẻ</span>
          </button>

          <button
            onClick={() => toggleOption('showSpendingTime')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              displayOptions.showSpendingTime
                ? 'bg-[#edf8f2] border-[#a3dfbd] text-[#056c4c] font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {displayOptions.showSpendingTime && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>Thời gian chi tiêu</span>
          </button>

          <button
            onClick={() => toggleOption('showActionTips')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              displayOptions.showActionTips
                ? 'bg-[#edf8f2] border-[#a3dfbd] text-[#056c4c] font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {displayOptions.showActionTips && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>Gợi ý hành động</span>
          </button>
        </div>
      </div>

      {/* Card List or Empty State */}
      {sortedAnalyses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 text-center flex flex-col items-center justify-center shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <CreditCardIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Bạn chưa thêm thẻ tín dụng nào.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mb-6">
            Bắt đầu thêm thẻ tín dụng để theo dõi kỳ sao kê, quản lý tỷ lệ dùng hạn mức và tự động tính tiền hoàn cashback mỗi kỳ.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onOpenAddCard}
              className="px-6 py-2.5 bg-[#056c4c] hover:bg-[#04593e] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Thêm thẻ ở Quản lý thẻ
            </button>

            <button
              onClick={onSeedSampleData}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Nạp dữ liệu mẫu thử nghiệm</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAnalyses.map((analysis) => (
            <CreditCardItem
              key={analysis.card.id}
              analysis={analysis}
              displayOptions={displayOptions}
              onAddTransaction={(cardId) => onOpenAddTransaction(cardId)}
              onEditCard={onEditCard}
            />
          ))}
        </div>
      )}

      {/* Recent Transactions Strip on Overview */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#056c4c] flex items-center justify-center">
                <ReceiptText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Giao dịch gần đây</h4>
                <p className="text-xs text-slate-400">Xem nhanh các lần quẹt thẻ mới nhất, chỉnh sửa hoặc xóa nếu thêm nhầm</p>
              </div>
            </div>

            {onViewAllTransactions && (
              <button
                onClick={onViewAllTransactions}
                className="text-xs font-semibold text-[#056c4c] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Xem tất cả ({transactions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const card = cardMap.get(tx.cardId);

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#056c4c]" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-sm">
                          {tx.note || 'Chi tiêu thẻ'}
                        </span>
                        {tx.mcc && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-800 text-amber-300">
                            MCC {tx.mcc}
                          </span>
                        )}
                        {tx.type === 'income' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800">
                            TIỀN VÀO
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        {formatDateVN(tx.date)} &bull; {card?.bankName} ({card?.cardName})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {tx.type === 'income' ? (
                        <span className="font-bold text-emerald-600 block text-sm">
                          +{formatVND(tx.amount)}
                        </span>
                      ) : (
                        <span className="font-bold text-slate-900 block text-sm">
                          -{formatVND(tx.amount)}
                        </span>
                      )}
                      {tx.type !== 'income' && tx.cashbackEarned > 0 && (
                        <span className="text-[#056c4c] font-semibold text-[11px]">
                          +{formatVND(tx.cashbackEarned)} ({tx.cashbackRate}%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {onEditTransaction && (
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Sửa giao dịch này"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDeleteTransaction && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa giao dịch "${tx.note || 'Chi tiêu'}" (${formatVND(tx.amount)})?`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa giao dịch này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MB Bank JCB Platinum Policy Modal */}
      <MBJCBPolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />
    </div>
  );
};
