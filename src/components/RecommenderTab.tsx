import React, { useState } from 'react';
import { Star, ArrowRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { CreditCard, SpendingCategory, Transaction } from '../types';
import { analyzeCardCycle } from '../utils/cashbackCalculator';
import { formatVND } from '../utils/formatters';

interface RecommenderTabProps {
  cards: CreditCard[];
  categories: SpendingCategory[];
  transactions: Transaction[];
  onSelectCardToPay: (cardId: string, amount: number, categoryId: string) => void;
}

export const RecommenderTab: React.FC<RecommenderTabProps> = ({
  cards,
  categories,
  transactions,
  onSelectCardToPay,
}) => {
  const [amountStr, setAmountStr] = useState('1.500.000');
  const [selectedCatId, setSelectedCatId] = useState('dining');

  const rawAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;
  const activeCards = cards.filter(c => c.isActive);

  // Analyze each card for this prospective transaction
  const recommendations = activeCards.map((card) => {
    const analysis = analyzeCardCycle(card, transactions);
    const policy = card.cashbackPolicy;
    const rule = policy.categoryRules.find(r => r.categoryId === selectedCatId);
    const rate = rule ? rule.percentage : (policy.defaultPercentage || 0.5);

    // Check existing spending in this category in current cycle
    const currentCatSummary = analysis.categories.find(c => c.categoryId === selectedCatId);
    const existingEarned = currentCatSummary ? currentCatSummary.actualCashback : 0;
    const catCap = rule?.maxCashback || 0;

    // Remaining capacity in this category
    let remainingCatCap = catCap > 0 ? Math.max(0, catCap - existingEarned) : Infinity;

    // Overall remaining capacity
    const overallCap = policy.overallMaxCashback || 0;
    const remainingOverallCap = overallCap > 0 ? Math.max(0, overallCap - analysis.totalCappedCashback) : Infinity;

    // Potential cashback
    const rawCashback = (rawAmount * rate) / 100;
    const cappedCashback = Math.min(rawCashback, remainingCatCap, remainingOverallCap);

    const isCatCapped = catCap > 0 && existingEarned >= catCap;
    const isOverallCapped = overallCap > 0 && analysis.totalCappedCashback >= overallCap;

    return {
      card,
      rate,
      rawCashback,
      actualExpectedCashback: cappedCashback,
      isCatCapped,
      isOverallCapped,
      categoryName: rule?.categoryName || 'Chi tiêu mặc định',
      existingSpentThisCycle: analysis.totalSpent,
      minSpendRequired: policy.minCycleSpendToQualify,
      isQualified: analysis.isQualifiedForCashback,
    };
  }).sort((a, b) => b.actualExpectedCashback - a.actualExpectedCashback);

  const bestChoice = recommendations[0];

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cố vấn quẹt thẻ thông minh (Smart Card Picker)
            </h2>
            <p className="text-xs text-slate-500">
              Nhập số tiền và loại chi tiêu bạn sắp thanh toán. Hệ thống sẽ tính toán ngay thẻ nào hoàn nhiều tiền nhất và chưa chạm trần!
            </p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Số tiền dự kiến chi tiêu
            </label>
            <div className="relative">
              <input
                type="text"
                value={amountStr}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  setAmountStr(clean ? parseInt(clean, 10).toLocaleString('vi-VN') : '');
                }}
                className="w-full text-base font-bold px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₫
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Danh mục thanh toán
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result Ranking */}
      {activeCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/90 text-slate-500 text-sm">
          Chưa có thẻ nào được thêm vào hệ thống.
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">
            Kết quả so sánh & Thứ hạng quẹt thẻ tối ưu:
          </h3>

          {recommendations.map((rec, index) => {
            const isWinner = index === 0 && rec.actualExpectedCashback > 0;
            return (
              <div
                key={rec.card.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isWinner
                    ? 'bg-[#f0fbf5] border-[#a3dfbd] shadow-xs'
                    : 'bg-white border-slate-200/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-8 rounded-lg shadow-xs flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ background: rec.card.themeColor }}
                    >
                      {rec.card.bankName}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {rec.card.bankName} - {rec.card.cardName}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#056c4c] text-white">
                            <Zap className="w-3 h-3 fill-white" />
                            KHUYÊN DÙNG NHẤT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>
                          Tỷ lệ: <strong className="text-emerald-700">{rec.rate}%</strong>
                        </span>
                        {rec.isCatCapped && (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Đã chạm trần danh mục này
                          </span>
                        )}
                        {rec.isOverallCapped && (
                          <span className="text-rose-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Đã chạm trần kỳ của thẻ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-500 block">Dự kiến nhận hoàn:</span>
                      <span
                        className={`text-lg font-black ${
                          isWinner ? 'text-[#056c4c]' : 'text-slate-800'
                        }`}
                      >
                        +{formatVND(rec.actualExpectedCashback)}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectCardToPay(rec.card.id, rawAmount, selectedCatId)}
                      className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isWinner
                          ? 'bg-[#056c4c] hover:bg-[#04593e] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Quẹt thẻ này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
