import React from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ShoppingBag, 
  Video, 
  ShieldAlert, 
  CreditCard as CardIcon,
  Calendar,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { formatVND } from '../utils/formatters';

interface MBJCBPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MBJCBPolicyModal: React.FC<MBJCBPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0b192c] via-[#1e3e62] to-[#0b192c] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-300 font-bold border border-white/20">
              JCB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Thể lệ chi tiết Thẻ MB JCB Platinum</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-bold">
                  Bản chính thức MB Bank
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Áp dụng cho thẻ MB JCB Platinum & MB JCB Be The Sky
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 text-xs sm:text-sm">
          {/* Official Document Banner */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <strong className="text-blue-950 font-semibold block text-xs">
                  Văn bản thể lệ gốc MB Bank (f07846c9-c4a9-41b3-9dc3-8dba3504f685.pdf)
                </strong>
                <span className="text-[11px] text-blue-800">
                  Dữ liệu được cập nhật và đối soát chuẩn xác 100% từ cổng truyền thông chính thức của Ngân hàng Quân Đội (MB).
                </span>
              </div>
            </div>

            <a
              href="https://webcdn.mbbank.com.vn/public/media/f07846c9-c4a9-41b3-9dc3-8dba3504f685.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-xs"
            >
              <span>Xem PDF</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Section 1: Welcome Offer */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4>1. Ưu đãi chào mừng (Welcome Bonus) - Thưởng 500.000 ₫</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-950 text-xs leading-relaxed pl-1">
              <li>
                <strong>Đối tượng:</strong> Khách hàng lần đầu kích hoạt thẻ chính là thẻ tín dụng (HM &gt; 0) phát hành bởi MB. Áp dụng thẻ JCB Platinum kích hoạt từ ngày <strong>09/10/2024</strong> trở đi.
              </li>
              <li>
                <strong>Giá trị ưu đãi:</strong> Hoàn <strong>500.000 VNĐ</strong> trực tiếp vào thẻ.
              </li>
              <li>
                <strong>Điều kiện:</strong> Phát sinh tối thiểu <strong>5 giao dịch</strong> hợp lệ VÀ Tổng doanh số chi tiêu đạt tối thiểu <strong>5.000.000 VNĐ</strong> trong vòng <strong>60 ngày</strong> kể từ ngày kích hoạt thẻ.
              </li>
              <li>
                <strong>Giao dịch hợp lệ chào mừng:</strong> Thanh toán hàng hóa dịch vụ qua POS hoặc trực tuyến thành công.
              </li>
            </ul>
          </div>

          {/* Section 2: Statement Cycle Cashback */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#056c4c]" />
              <span>2. Ưu đãi hoàn tiền theo kỳ sao kê (Tối đa 500.000 ₫/kỳ sao kê)</span>
            </h4>

            {/* CRITICAL PREREQUISITE ALERT */}
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ĐIỀU KIỆN TIÊN QUYẾT BẮT BUỘC (QUAN TRỌNG NHẤT)</span>
              </div>
              <p className="text-xs text-rose-950 leading-relaxed">
                Để được xét hoàn tiền cho <strong>Shopee</strong> và <strong>TikTok Shop</strong>, Doanh số giao dịch <strong>"Lĩnh vực khác" phải đạt tối thiểu ≥ 2.000.000 VNĐ</strong> trong kỳ sao kê.
              </p>
              <p className="text-[11px] text-rose-700 italic">
                * Nếu Doanh số Lĩnh vực khác &lt; 2.000.000 VNĐ trong kỳ, bạn sẽ KHÔNG nhận được hoàn tiền cho Shopee và TikTok Shop dù có chi bao nhiêu trên sàn.
              </p>
            </div>

            {/* Two platform rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Shopee */}
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 space-y-2">
                <div className="flex items-center gap-2 text-orange-900 font-bold text-xs">
                  <ShoppingBag className="w-4 h-4 text-[#ee4d2d]" />
                  <span>Hoàn 10% Shopee</span>
                </div>
                <div className="text-xs text-orange-950 space-y-1">
                  <p>• <strong>Điều kiện doanh số:</strong> Chi tiêu Shopee đạt <strong>≥ 2.000.000 VNĐ</strong> trong kỳ sao kê.</p>
                  <p>• <strong>Tiêu chuẩn giao dịch:</strong> Mua hàng hóa có <code>merchant_name</code> chứa chữ <strong>"SHOPEE"</strong> và mã chấp nhận <strong>MID = 000109900005175</strong>.</p>
                  <p>• <strong>Loại trừ:</strong> MCC 5462, 5811, 5812, 5813, 5814, 4900; ShopeeFood, ShopeeMart, điện, nước, hóa đơn tiện ích, nạp điện thoại, vé máy bay &amp; đi lại, vé xem phim, quảng cáo.</p>
                </div>
              </div>

              {/* TikTok Shop */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Video className="w-4 h-4 text-black" />
                  <span>Hoàn 10% TikTok Shop</span>
                </div>
                <div className="text-xs text-slate-800 space-y-1">
                  <p>• <strong>Điều kiện doanh số:</strong> Chi tiêu TikTok Shop đạt <strong>≥ 2.000.000 VNĐ</strong> trong kỳ sao kê.</p>
                  <p>• <strong>Tiêu chuẩn giao dịch:</strong> Mua hàng hóa có <code>merchant_name</code> chứa chữ <strong>"TIKTOK SHOP"</strong> và mã ngành <strong>MCC = 5399</strong>.</p>
                  <p>• <strong>Loại trừ:</strong> Giao dịch quảng cáo và các giao dịch không phải mua hàng hóa tại TikTok Shop.</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-slate-700 text-xs flex justify-between items-center">
              <span>Tổng hạn mức hoàn tiền tối đa:</span>
              <strong className="text-[#056c4c] text-sm">500.000 VNĐ / kỳ sao kê (6.000.000 VNĐ / năm)</strong>
            </div>
          </div>

          {/* Section 3: Excluded MCCs in Other Categories */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-600" />
              <span>3. Các giao dịch bị LOẠI TRỪ khỏi "Lĩnh vực khác"</span>
            </h4>
            <p className="text-xs text-slate-600">
              Giao dịch Lĩnh vực khác là các giao dịch thanh toán mua sắm, ẩm thực, siêu thị thông thường ngoài sàn Shopee/TikTok Shop, và <strong>KHÔNG</strong> thuộc các nhóm rủi ro sau:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <strong>Vận tải:</strong> MCC 4111, 4131, 4789
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <strong>Tiền mặt &amp; Chuyển tiền:</strong> MCC 4829, 6011, 6051
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <strong>Chứng khoán:</strong> MCC 6211
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <strong>Casino &amp; Đánh bạc:</strong> MCC 7801, 7995
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic mt-1">
              * Rút tiền mặt, thanh toán thuế, nộp phạt, phí dịch vụ ngân hàng, lãi, giao dịch khống/đại lý thu hộ điện thoại/vé máy bay đều không được tính.
            </p>
          </div>

          {/* Section 4: Eligible Special Transactions */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>4. Quy định chi trả &amp; Giao dịch đặc biệt ĐƯỢC CHẤP NHẬN</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-emerald-950 text-xs leading-relaxed pl-1">
              <li>
                <strong>Apple Pay:</strong> Giao dịch thực hiện qua ví Apple Pay <strong>ĐƯỢC TÍNH HỢP LỆ</strong> để xét điều kiện hoàn tiền.
              </li>
              <li>
                <strong>Trả góp:</strong> Giao dịch gốc trả góp <strong>ĐƯỢC TÍNH HỢP LỆ</strong> để xét hoàn tiền.
              </li>
              <li>
                <strong>Thẻ phụ:</strong> Doanh số chi tiêu được cộng dồn của thẻ chính &amp; thẻ phụ.
              </li>
              <li>
                <strong>Thời gian nhận tiền hoàn:</strong> Hoàn vào tài khoản thẻ trong <strong>tối đa 60 ngày làm việc</strong> kể từ ngày cuối cùng của tháng dương lịch khách hàng đạt điều kiện.
              </li>
              <li>
                <strong>Trạng thái thẻ khi hoàn:</strong> Thẻ phải ở trạng thái sẵn sàng hoạt động (status: <code>Card OK</code> &amp; <code>Pickup04</code>).
              </li>
            </ul>
          </div>

          {/* Section 5: User Specific Statement Setup */}
          <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-600" />
              <span>5. Thông tin sao kê &amp; Trích nợ tự động của bạn (Theo App MB Bank)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-700 pt-1">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Ngày lên sao kê</span>
                <strong>Mùng 8 hàng tháng</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Kỳ hạn thanh toán</span>
                <strong>Ngày 23 hàng tháng</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Tài khoản trích nợ</span>
                <strong className="font-mono text-[11px]">004131414</strong>
                <span className="text-[10px] text-slate-500 block truncate">PHAM THANH SON</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Tỷ lệ thanh toán</span>
                <strong className="text-[#056c4c]">Toàn bộ nợ (100%)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Đã hiểu thể lệ
          </button>
        </div>
      </div>
    </div>
  );
};