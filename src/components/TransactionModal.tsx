import React, { useState, useEffect } from 'react';
import { X, Gift, AlertCircle, Calendar, CreditCard as CardIcon, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CreditCard, SpendingCategory, Transaction } from '../types';
import { estimateTransactionCashback } from '../utils/cashbackCalculator';
import { formatVND } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  categories: SpendingCategory[];
  onSave: (transaction: Omit<Transaction, 'id'>, existingId?: string) => void;
  preselectedCardId?: string;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  cards,
  categories,
  onSave,
  preselectedCardId,
  editingTransaction,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('dining');
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [mcc, setMcc] = useState<string>('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setSelectedCardId(editingTransaction.cardId);
        setAmountStr(editingTransaction.amount ? editingTransaction.amount.toLocaleString('vi-VN') : '');
        setCategoryId(editingTransaction.categoryId);
        setDateStr(editingTransaction.date || new Date().toISOString().split('T')[0]);
        setNote(editingTransaction.note || '');
        setMcc(editingTransaction.mcc || '');
        setTxType(editingTransaction.type || 'expense');
      } else {
        if (preselectedCardId && cards.some(c => c.id === preselectedCardId)) {
          setSelectedCardId(preselectedCardId);
        } else if (cards.length > 0) {
          setSelectedCardId(cards[0].id);
        }
        setAmountStr('');
        setNote('');
        setMcc('');
        setTxType('expense');
        setDateStr(new Date().toISOString().split('T')[0]);
        if (categories.length > 0) {
          setCategoryId(categories[0].id);
        }
      }
    }
  }, [isOpen, preselectedCardId, cards, categories, editingTransaction]);

  if (!isOpen) return null;

  const rawAmount = parseFloat(amountStr.replace(/\D/g, '')) || 0;
  const currentCard = cards.find(c => c.id === selectedCardId);

  // Live estimate cashback
  const estimate = currentCard && rawAmount > 0 && txType === 'expense'
    ? estimateTransactionCashback(currentCard, rawAmount, categoryId)
    : { cashback: 0, rate: 0, ruleMatched: '' };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '');
    if (!clean) {
      setAmountStr('');
      return;
    }
    const num = parseInt(clean, 10);
    setAmountStr(num.toLocaleString('vi-VN'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard || rawAmount <= 0) return;

    onSave({
      cardId: currentCard.id,
      amount: rawAmount,
      date: dateStr,
      categoryId,
      note: note.trim() || undefined,
      mcc: mcc.trim() || undefined,
      type: txType,
      cashbackEarned: txType === 'income' ? 0 : estimate.cashback,
      cashbackRate: txType === 'income' ? 0 : estimate.rate,
    }, editingTransaction ? editingTransaction.id : undefined);

    if (estimate.cashback > 0 && !editingTransaction) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#056c4c', '#10b981', '#34d399', '#f59e0b'],
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#edf8f2] text-[#056c4c] flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Nhập giao dịch chi tiêu'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingTransaction ? 'Cập nhật lại thông tin hoặc số tiền đã nhập nhầm' : 'Tự động tính tiền hoàn theo chính sách thẻ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type: TIỀN RA (Chi tiêu) vs TIỀN VÀO (Thanh toán / Hoàn tiền) */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTxType('expense')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                txType === 'expense'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              TIỀN RA (Chi tiêu)
            </button>
            <button
              type="button"
              onClick={() => {
                setTxType('income');
                setCategoryId('payment');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                txType === 'income'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              TIỀN VÀO (Thanh toán nợ / Hoàn tiền)
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Số tiền giao dịch (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="VD: 500.000"
                className="w-full text-xl font-bold px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c] text-slate-900 placeholder:text-slate-300"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₫
              </span>
            </div>
          </div>

          {/* Select Card & MCC Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CardIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Thẻ tín dụng thanh toán</span>
              </label>
              {cards.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Bạn cần thêm ít nhất 1 thẻ tín dụng.</span>
                </div>
              ) : (
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c] cursor-pointer"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.bankName} - {c.cardName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã MCC
              </label>
              <input
                type="text"
                value={mcc}
                onChange={(e) => setMcc(e.target.value)}
                placeholder="VD: 5262, 5411"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
              />
            </div>
          </div>

          {/* Select Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>Danh mục chi tiêu</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c] cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Ngày quẹt thẻ</span>
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ghi chú (Tùy chọn)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Ăn Pizza 4P's, Tiki, Grab..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
              />
            </div>
          </div>

          {/* Realtime Cashback Preview Box */}
          {rawAmount > 0 && currentCard && (
            <div className="p-3.5 rounded-xl bg-[#edf8f2] border border-[#a3dfbd] flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 block">Ước tính hoàn tiền:</span>
                <span className="text-xs text-slate-500">
                  {estimate.ruleMatched}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-[#056c4c]">
                  +{formatVND(estimate.cashback)}
                </span>
                <span className="block text-[11px] text-[#056c4c]/80">
                  Tỷ lệ {estimate.rate}%
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={cards.length === 0 || rawAmount <= 0}
              className="px-6 py-2.5 rounded-xl bg-[#056c4c] hover:bg-[#04593e] disabled:opacity-50 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {editingTransaction ? 'Cập nhật giao dịch' : 'Lưu giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
