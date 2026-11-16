import React, { useState } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, Clock, CreditCard as CardIcon } from 'lucide-react';
import { CreditCard, Transaction } from '../types';
import { analyzeCardCycle } from '../utils/cashbackCalculator';
import { formatVND, formatDateVN } from '../utils/formatters';

interface StatementTabProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onAddTransaction: (cardId: string) => void;
}

export const StatementTab: React.FC<StatementTabProps> = ({
  cards,
  transactions,
  onAddTransaction,
}) => {
  // Store local paid status map { [cardId_cycleKey]: boolean }
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('hoantien_paid_status_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const togglePaid = (key: string) => {
    const next = { ...paidStatus, [key]: !paidStatus[key] };
    setPaidStatus(next);
    localStorage.setItem('hoantien_paid_status_v1', JSON.stringify(next));
  };

  const activeCards = cards.filter(c => c.isActive);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Theo dõi kỳ sao kê & Hạn thanh toán
        </h2>
        <p className="text-xs text-slate-500">
          Tránh bị ngân hàng phạt chậm trả và tính lãi bằng cách theo dõi chính xác ngày chốt sao kê và ngày đến hạn thanh toán của từng thẻ.
        </p>
      </div>

      {activeCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 text-slate-500 text-sm">
          Chưa có thẻ tín dụng nào được kích hoạt. Hãy thêm thẻ tại mục Tổng quan hoặc Quản lý thẻ.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCards.map((card) => {
            const analysis = analyzeCardCycle(card, transactions);
            const cycleKey = `${card.id}_${analysis.cycleStartDate}_${analysis.cycleEndDate}`;
            const isPaid = !!paidStatus[cycleKey];

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-7 rounded-md shadow-xs flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ background: card.themeColor }}
                      >
                        {card.bankName}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-800">
                          {card.bankName} - {card.cardName}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          Hạn mức: {formatVND(card.creditLimit)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã thanh toán</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Chưa thanh toán</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Dates & Amounts */}
                  <div className="grid grid-cols-2 gap-3 py-4">
                    <div className="p-3 rounded-xl bg-slate-50">
                      <span className="text-xs text-slate-500 block mb-1">Kỳ sao kê hiện tại</span>
                      <span className="text-xs font-semibold text-slate-800 block">
                        {formatDateVN(analysis.cycleStartDate)} - {formatDateVN(analysis.cycleEndDate)}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Chốt ngày {card.statementDay}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50">
                      <span className="text-xs text-slate-500 block mb-1">Hạn chót thanh toán</span>
                      <span className="text-xs font-semibold text-slate-800 block">
                        {formatDateVN(analysis.dueDate)}
                      </span>
                      <span className={`text-[11px] font-medium mt-1 block ${
                        analysis.daysUntilDue <= 3 ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        {analysis.daysUntilDue >= 0 ? `Còn ${analysis.daysUntilDue} ngày` : 'Đã quá hạn!'}
                      </span>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Tổng dư nợ kỳ này:</span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatVND(analysis.totalSpent)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Thanh toán tối thiểu (~5%):</span>
                      <span className="text-sm font-semibold text-slate-700">
                        {formatVND(analysis.totalSpent * 0.05)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onAddTransaction(card.id)}
                    className="text-xs text-[#056c4c] font-semibold hover:underline cursor-pointer"
                  >
                    + Nhập giao dịch
                  </button>

                  <button
                    onClick={() => togglePaid(cycleKey)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isPaid
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#056c4c] hover:bg-[#04593e] text-white shadow-xs'
                    }`}
                  >
                    {isPaid ? 'Đánh dấu Chưa thanh toán' : 'Đã thanh toán xong'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
