import React from 'react';
import { Download, Plus, Menu } from 'lucide-react';
import { ViewTab } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  onOpenAddCard: () => void;
  onExportReport: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenAddCard,
  onExportReport,
  onOpenMobileMenu,
}) => {
  const getTabTitles = () => {
    switch (currentTab) {
      case 'overview':
        return {
          title: 'Tổng quan thẻ tín dụng',
          subtitle: `Số liệu tính theo kỳ sao kê hiện tại của từng thẻ • Cập nhật ${new Date().toLocaleDateString('vi-VN')}`,
        };
      case 'statements':
        return {
          title: 'Quản lý sao kê & Hạn mức',
          subtitle: 'Theo dõi chu kỳ thanh toán, ngày đến hạn và dư nợ sao kê các thẻ',
        };
      case 'reports':
        return {
          title: 'Báo cáo chi tiêu & Dòng tiền',
          subtitle: 'Phân tích tổng hợp dòng tiền chi tiêu, hiệu suất hoàn tiền và điểm tín dụng',
        };
      case 'recommender':
        return {
          title: 'Lựa chọn thẻ thông minh',
          subtitle: 'Nhập khoản chi tiêu sắp tới để tìm thẻ cho tỷ lệ hoàn tiền cao nhất và còn hạn mức',
        };
      case 'transactions':
      case 'lookup':
        return {
          title: 'Lịch sử & Quản lý giao dịch',
          subtitle: 'Xem lại toàn bộ các lần quẹt thẻ, chỉnh sửa hoặc xóa nhanh các giao dịch đã nhập nhầm',
        };
      case 'manage-cards':
        return {
          title: 'Quản lý thẻ tín dụng',
          subtitle: 'Thêm mới, tùy chỉnh hạn mức, ngày chốt sao kê và màu thẻ',
        };
      case 'cashback-policy':
        return {
          title: 'Chính sách hoàn tiền',
          subtitle: 'Cấu hình tỷ lệ % hoàn, hạn mức trần (cap) theo danh mục ẩm thực, mua sắm online, siêu thị...',
        };
      case 'categories':
        return {
          title: 'Danh mục chi tiêu',
          subtitle: 'Quản lý các nhóm chi tiêu để phân loại giao dịch chính xác',
        };
      case 'currency':
        return {
          title: 'Cài đặt đơn vị tiền tệ',
          subtitle: 'Định dạng hiển thị tiền tệ và tỷ giá quy đổi',
        };
      case 'toggle-cashbook':
        return {
          title: 'Tùy chỉnh hiển thị & Sổ thu chi',
          subtitle: 'Bật/tắt các chỉ số thống kê, sao lưu và khôi phục dữ liệu',
        };
      default:
        return {
          title: 'Quản lý thẻ tín dụng',
          subtitle: 'Tối ưu dòng tiền và hoàn tiền thẻ tín dụng',
        };
    }
  };

  const { title, subtitle } = getTabTitles();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 pt-2 border-b border-slate-200/80 mb-6">
      <div className="flex items-start gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 mt-0.5"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <button
          onClick={onExportReport}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Xuất báo cáo</span>
        </button>

        <button
          onClick={onOpenAddCard}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-600" />
          <span>Thêm thẻ</span>
        </button>
      </div>
    </header>
  );
};
