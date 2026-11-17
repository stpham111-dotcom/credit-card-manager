import React, { useState } from 'react';
import { 
  BadgePercent, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard as CardIcon, 
  FileText, 
  Info, 
  Layers, 
  ReceiptText, 
  ShieldCheck, 
  Tag, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CreditCard, InstallmentPlan } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';

interface InstallmentsTabProps {
  cards: CreditCard[];
  installments: InstallmentPlan[];
}

export const InstallmentsTab: React.FC<InstallmentsTabProps> = ({
  cards,
  installments,
}) => {
  const cardMap = new Map(cards.map(c => [c.id, c]));
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    installments.length > 0 ? installments[0].id : ''
  );
  const [showLedgerDetails, setShowLedgerDetails] = useState<boolean>(true);

  const activePlan = installments.find(p => p.id === selectedPlanId) || installments[0];

  if (!activePlan) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-2xs">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Chưa có khoản trả góp nào</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Các giao dịch đăng ký trả góp 0% (như Uniqlo, Shopee, điện máy...) sẽ được quản lý và theo dõi tiến độ chi tiết tại đây.
        </p>
      </div>
    );
  }

  const card = cardMap.get(activePlan.cardId);
  const paidPct = activePlan.totalAmount > 0 
    ? ((activePlan.totalAmount - activePlan.remainingDebt) / activePlan.totalAmount) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Tab Selector if multiple plans */}
      {installments.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {installments.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedPlanId === p.id
                  ? 'bg-[#056c4c] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p.merchantName} ({formatVND(p.totalAmount)})
            </button>
          ))}
        </div>
      )}

      {/* Hero Installment Card (Chuẩn giao diện MB Bank Mobile) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-100/50 via-emerald-50/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                  Trả góp 0% Lãi suất
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang trả góp
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activePlan.merchantName}
              </h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>{card?.bankName || 'MB Bank'} {card?.cardName || 'JCB Platinum'}</span>
                <span>•</span>
                <span>Đuôi thẻ: **** {card?.cardNumberLast4 || '0764'}</span>
                <span>•</span>
                <span>Mã giao dịch: #{activePlan.planCode}</span>
              </p>
            </div>

            {/* 0% Stamp Graphic */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center font-black shadow-md shadow-blue-500/20">
                <span className="text-base leading-none">0%</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-200 mt-0.5">Lãi suất</span>
              </div>
            </div>
          </div>

          {/* Remaining Debt Highlight */}
          <div className="py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-xs text-slate-500 block mb-1">Dư nợ còn lại (Đang giữ hạn mức)</span>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {formatVND(activePlan.remainingDebt)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Sẽ giải phóng dần {formatVND(activePlan.monthlyPrincipal)} mỗi kỳ
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Số tiền gốc mỗi kỳ</span>
              <div className="text-2xl font-black text-indigo-700">
                {formatVND(activePlan.monthlyPrincipal)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Kỳ hạn: <strong>{activePlan.tenorMonths} tháng</strong> (Đã trả {activePlan.paidPeriods}/{activePlan.tenorMonths} kỳ)
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Tổng giá trị giao dịch chuyển đổi</span>
              <div className="text-2xl font-black text-slate-800">
                {formatVND(activePlan.totalAmount)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Phí chuyển đổi 1 lần: <strong>{formatVND(activePlan.conversionFee)}</strong>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">
                Đã thanh toán: <strong className="text-emerald-700">{formatVND(activePlan.totalAmount - activePlan.remainingDebt)}</strong> ({paidPct.toFixed(1)}%)
              </span>
              <span className="text-slate-400">
                Tổng cộng: {formatVND(activePlan.totalAmount)}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 transition-all duration-700"
                style={{ width: `${Math.max(5, paidPct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contract Details (Thông tin chi tiết hợp đồng chuẩn MB Bank) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#056c4c]" />
          <span>Thông tin chi tiết hợp đồng trả góp</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Kỳ hạn trả góp</span>
            <span className="font-bold text-slate-900 text-sm">{activePlan.tenorMonths} tháng</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Lãi suất trả góp</span>
            <span className="font-bold text-emerald-700 text-sm">0% / năm</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Phí chuyển đổi thu trước</span>
            <span className="font-bold text-slate-900 text-sm">{formatVND(activePlan.conversionFee)} (kỳ sao kê đầu)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Mã khoản trả góp ngân hàng</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{activePlan.planCode}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Ngày đăng ký chuyển đổi</span>
            <span className="font-bold text-slate-900 text-sm">{formatDateVN(activePlan.registrationDate)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Thời gian hiệu lực</span>
            <span className="font-bold text-slate-900 text-sm">
              {formatDateVN(activePlan.startDate)} – {formatDateVN(activePlan.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* 6-Month Payment Schedule (Lịch trình 6 kỳ trả nợ) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#056c4c]" />
              <span>Lịch trình thanh toán từng kỳ ({activePlan.schedule.length} kỳ)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chi tiết gốc, phí và dư nợ còn lại sau từng kỳ sao kê hàng tháng
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Ngày chốt sao kê: Ngày 8 hàng tháng • Hạn thanh toán: Ngày 23
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600">
                <th className="py-3 px-3 font-semibold rounded-l-xl">Kỳ</th>
                <th className="py-3 px-3 font-semibold">Ngày chốt sao kê</th>
                <th className="py-3 px-3 font-semibold">Hạn thanh toán</th>
                <th className="py-3 px-3 font-semibold text-right">Tiền gốc</th>
                <th className="py-3 px-3 font-semibold text-right">Phí chuyển đổi</th>
                <th className="py-3 px-3 font-semibold text-right">Tổng phải trả</th>
                <th className="py-3 px-3 font-semibold text-right">Dư nợ còn lại</th>
                <th className="py-3 px-3 font-semibold text-center rounded-r-xl">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activePlan.schedule.map((item) => (
                <tr 
                  key={item.period} 
                  className={`transition-colors ${
                    item.status === 'billed' ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                    Kỳ {item.period} / {activePlan.tenorMonths}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {formatDateVN(item.statementDate)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {formatDateVN(item.dueDate)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-800 whitespace-nowrap">
                    {formatVND(item.principal)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-500 whitespace-nowrap">
                    {item.fee > 0 ? formatVND(item.fee) : '0 ₫'}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                    {formatVND(item.totalDue)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-500 whitespace-nowrap">
                    {formatVND(item.remainingAfterPeriod)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {item.status === 'billed' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3" />
                        Đã lên sao kê T11
                      </span>
                    ) : item.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã trả
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Sắp đến
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accounting & Credit Limit Mechanics (Cơ chế hạch toán hạn mức ngân hàng) */}
      <div className="bg-[#f0fbf5] rounded-2xl p-6 border border-[#c3e9d2] shadow-2xs space-y-3">
        <h4 className="text-sm font-bold text-[#056c4c] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#056c4c]" />
          <span>Quy tắc Hạch toán Hạn mức Ngân hàng đối với Trả góp 0%</span>
        </h4>
        <div className="text-xs text-[#056c4c]/90 leading-relaxed space-y-1.5">
          <p>
            • <strong>Khóa hạn mức:</strong> Khi bạn chuyển đổi trả góp 1.177.000 ₫, toàn bộ dư nợ còn lại (hiện là <strong>980.833 ₫</strong>) vẫn được ngân hàng phong tỏa trên hạn mức thẻ (45.000.000 ₫) để đảm bảo khả năng thanh toán.
          </p>
          <p>
            • <strong>Giải phóng hạn mức hàng tháng:</strong> Mỗi khi sao kê kỳ mới phát sinh và bạn thanh toán số tiền gốc <strong>196.167 ₫</strong>, hạn mức khả dụng của bạn sẽ được cộng trả lại tương ứng 196.167 ₫.
          </p>
          <p>
            • <strong>Công thức chuẩn:</strong> <code className="bg-white/80 px-2 py-0.5 rounded font-mono font-bold">Hạn mức khả dụng = Tổng hạn mức (45M) - Chi tiêu kỳ này (766k) - Dư nợ trả góp còn lại (980k) = 43.252.605 ₫</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
