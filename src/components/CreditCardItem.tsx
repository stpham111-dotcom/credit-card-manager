import React, { useState } from 'react';
import { 
  CreditCard as CardIcon, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Gift, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Edit3,
  Percent
} from 'lucide-react';
import { CreditCard, DisplayOptions } from '../types';
import { CardCycleAnalysis } from '../utils/cashbackCalculator';
import { formatVND, formatDateVN } from '../utils/formatters';

interface CreditCardItemProps {
  analysis: CardCycleAnalysis;
  displayOptions: DisplayOptions;
  onAddTransaction: (cardId: string) => void;
  onEditCard: (card: CreditCard) => void;
}

export const CreditCardItem: React.FC<CreditCardItemProps> = ({
  analysis,
  displayOptions,
  onAddTransaction,
  onEditCard,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { card } = analysis;

  // Calculate percentage of limit used
  const limitPercent = Math.min(100, Math.round(analysis.utilizationRate));
  
  // Calculate percentage of cashback earned against overall cap
  const cashbackCap = card.cashbackPolicy.overallMaxCashback || 0;
  const cashbackPercent = cashbackCap > 0 
    ? Math.min(100, Math.round((analysis.totalCappedCashback / cashbackCap) * 100))
    : 100;

  // Personal budget progress if set
  const personalTarget = card.personalTargetSpend || 0;
  const targetPercent = personalTarget > 0 
    ? Math.min(100, Math.round((analysis.totalSpent / personalTarget) * 100))
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all overflow-hidden mb-5">
      {/* Top Banner / Card Identity */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Visual Mini Card */}
          <div 
            className="w-14 h-9 rounded-lg p-1.5 flex flex-col justify-between text-white shadow-xs shrink-0 select-none"
            style={{ background: card.themeColor || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
          >
            <div className="flex justify-between items-center text-[8px] font-bold tracking-wider">
              <span>{card.bankName}</span>
              <span className="uppercase text-[7px] opacity-80">{card.cardType}</span>
            </div>
            <div className="text-[9px] tracking-widest font-mono opacity-90 text-right">
              •••• {card.cardNumberLast4 || '0000'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base">
                {card.bankName} - {card.cardName}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-md font-medium uppercase bg-slate-100 text-slate-600">
                {card.cardType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hạn mức: <strong className="text-slate-700">{formatVND(card.creditLimit)}</strong>
              {card.cardNumberLast4 && ` • Đuôi thẻ: ${card.cardNumberLast4}`}
            </p>
            {card.paymentMethod === 'auto_debit' && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#056c4c] font-medium bg-[#edf8f2] px-2 py-0.5 rounded-md w-fit">
                <span>🔄 Trích nợ tự động: {card.paymentRate === 'minimum' ? 'Tối thiểu' : 'Toàn bộ nợ (100%)'}</span>
                {card.autoDebitAccount && (
                  <span className="text-slate-500 font-mono text-[10px]">({card.autoDebitAccount})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => onAddTransaction(card.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#edf8f2] hover:bg-[#d8f1e3] text-[#056c4c] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm giao dịch</span>
          </button>
          
          <button
            onClick={() => onEditCard(card)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Chỉnh sửa thẻ"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5">
        {/* Core Quick Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Metric 1: Spending this cycle */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Đã chi kỳ này</span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-900">
              {formatVND(analysis.totalSpent)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span className={`font-medium ${limitPercent > 70 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {limitPercent}%
              </span>
              <span>hạn mức đã dùng</span>
            </div>
          </div>

          {/* Metric 2: Estimated Cashback */}
          {displayOptions.showEstimatedCashback && (
            <div className="p-3.5 rounded-xl bg-[#edf8f2] border border-[#c3e9d2]">
              <div className="flex items-center justify-between text-xs text-[#056c4c] font-medium mb-1">
                <span>Cashback dự kiến</span>
                <Gift className="w-3.5 h-3.5 text-[#056c4c]" />
              </div>
              <div className="text-lg font-bold text-[#056c4c]">
                {formatVND(analysis.totalCappedCashback)}
              </div>
              <div className="text-[11px] text-emerald-700/80 mt-1">
                {cashbackCap > 0 ? (
                  <span>Đạt {cashbackPercent}% trần ({formatVND(cashbackCap)})</span>
                ) : (
                  <span>Không giới hạn trần</span>
                )}
              </div>
            </div>
          )}

          {/* Metric 3: Statement Date countdown */}
          {displayOptions.showSpendingTime && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Chốt sao kê</span>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                Ngày {card.statementDay} hàng tháng
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {analysis.daysUntilStatement >= 0 ? (
                  <span className="text-amber-600 font-medium">
                    Còn {analysis.daysUntilStatement} ngày (đến {formatDateVN(analysis.cycleEndDate)})
                  </span>
                ) : (
                  <span>Kỳ đã chốt</span>
                )}
              </div>
            </div>
          )}

          {/* Metric 4: Due date countdown */}
          {displayOptions.showSpendingTime && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Hạn thanh toán</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                {formatDateVN(analysis.dueDate)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {analysis.daysUntilDue >= 0 ? (
                  <span className={analysis.daysUntilDue <= 5 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                    Còn {analysis.daysUntilDue} ngày nữa
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold">Đã quá hạn!</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bars Row */}
        <div className="space-y-3 mb-4">
          {/* Credit Limit Progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Tỷ lệ sử dụng hạn mức</span>
              <span className="font-semibold text-slate-700">
                {formatVND(analysis.totalSpent)} / {formatVND(card.creditLimit)} ({analysis.utilizationRate.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  analysis.utilizationRate > 70
                    ? 'bg-rose-500'
                    : analysis.utilizationRate > 40
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${limitPercent}%` }}
              />
            </div>
          </div>

          {/* Personal Target Spend Progress (if configured) */}
          {displayOptions.showPersonalTarget && personalTarget > 0 && (
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Mục tiêu chi tiêu cá nhân kỳ này</span>
                <span className="font-semibold text-slate-700">
                  {formatVND(analysis.totalSpent)} / {formatVND(personalTarget)} ({targetPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${targetPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cashback Cap Progress */}
          {displayOptions.showEstimatedCashback && cashbackCap > 0 && (
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Tiến độ hoàn tiền tối đa (Cap)</span>
                <span className="font-semibold text-emerald-800">
                  {formatVND(analysis.totalCappedCashback)} / {formatVND(cashbackCap)} ({cashbackPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#056c4c] transition-all duration-500 rounded-full"
                  style={{ width: `${cashbackPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Tips & Alerts */}
        {displayOptions.showActionTips && analysis.actionTips.length > 0 && (
          <div className="space-y-2 mb-4">
            {analysis.actionTips.map((tip, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}

        {/* Card Conditions & Min Spend Status */}
        {displayOptions.showCardTerms && card.cashbackPolicy.minCycleSpendToQualify > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              {analysis.isQualifiedForCashback ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="text-slate-700">
                Điều kiện hoàn tiền: Chi tối thiểu <strong>{formatVND(card.cashbackPolicy.minCycleSpendToQualify)}</strong> trong kỳ
              </span>
            </div>
            <span className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
              analysis.isQualifiedForCashback ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {analysis.isQualifiedForCashback ? 'Đã đủ điều kiện' : `Còn thiếu ${formatVND(analysis.spendNeededToQualify)}`}
            </span>
          </div>
        )}

        {/* Category Breakdown (Collapsible) */}
        {displayOptions.showCategoryCashback && isExpanded && (
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              <span>Chi tiết hoàn tiền theo danh mục</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {analysis.categories.map((cat) => {
                const isOverCap = cat.isCapped;
                return (
                  <div 
                    key={cat.categoryId}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">
                        {cat.categoryName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {cat.rate}%
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">Đã tiêu:</span>
                      <span className="font-semibold text-slate-800">{formatVND(cat.totalSpent)}</span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs mt-1">
                      <span className="text-slate-500">Hoàn tiền:</span>
                      <span className={`font-bold ${isOverCap ? 'text-amber-600' : 'text-[#056c4c]'}`}>
                        {formatVND(cat.actualCashback)}
                      </span>
                    </div>

                    {cat.maxCashback && cat.maxCashback > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-50 flex justify-between text-[10px] text-slate-400">
                        <span>Trần danh mục:</span>
                        <span>{formatVND(cat.maxCashback)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
