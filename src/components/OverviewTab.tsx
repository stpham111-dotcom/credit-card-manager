import React, { useState, useMemo } from 'react';
import { 
  CreditCard as CreditCardIcon, 
  TrendingUp, 
  Gift, 
  Eye, 
  Check, 
  ChevronDown, 
  Plus, 
  Sparkles 
} from 'lucide-react';
import { CreditCard, Transaction, DisplayOptions } from '../types';
import { analyzeCardCycle, CardCycleAnalysis } from '../utils/cashbackCalculator';
import { formatVND } from '../utils/formatters';
import { CreditCardItem } from './CreditCardItem';

interface OverviewTabProps {
  cards: CreditCard[];
  transactions: Transaction[];
  displayOptions: DisplayOptions;
  onUpdateDisplayOptions: (options: DisplayOptions) => void;
  onOpenAddCard: () => void;
  onOpenAddTransaction: (cardId?: string) => void;
  onEditCard: (card: CreditCard) => void;
  onSeedSampleData: () => void;
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
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('custom');

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
      {/* 4 Metric Cards Grid - Exact replica of the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Số thẻ đang dùng */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Số thẻ đang dùng</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CreditCardIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalCardsCount}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {totalCardsCount === 0 ? 'Chưa có dữ liệu' : `${totalCardsCount} thẻ đang hoạt động`}
          </div>
        </div>

        {/* Metric 2: Tổng hạn mức */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Tổng hạn mức</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {formatVND(totalLimit)}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {totalLimit === 0 
              ? 'Chưa khai hạn mức' 
              : `Đã dùng ${((totalSpentCycle / totalLimit) * 100).toFixed(1)}% hạn mức`}
          </div>
        </div>

        {/* Metric 3: Chi tiêu kỳ này */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Chi tiêu kỳ này</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {formatVND(totalSpentCycle)}
            </div>
          </div>
          <div className="text-xs text-slate-500 truncate">
            Theo kỳ sao kê hiện tại của từng thẻ
          </div>
        </div>

        {/* Metric 4: Cashback dự kiến (Highlighted in Green) */}
        <div className="bg-[#f0fbf5] rounded-2xl p-5 border border-[#c3e9d2] shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#056c4c]">Cashback dự kiến</span>
            <div className="w-8 h-8 rounded-lg bg-[#ddf4e7] text-[#056c4c] flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#056c4c] tracking-tight truncate">
              {formatVND(totalEstimatedCashback)}
            </div>
          </div>
          <div className="text-xs text-[#056c4c]/80 truncate">
            Theo kỳ sao kê hiện tại của từng thẻ
          </div>
        </div>
      </div>

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
    </div>
  );
};
