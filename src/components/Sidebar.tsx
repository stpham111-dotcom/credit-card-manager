import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Star, 
  Search, 
  CreditCard, 
  Coins, 
  BadgePercent, 
  Tags, 
  Sliders, 
  Plus,
  Database,
  X
} from 'lucide-react';
import { ViewTab } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewTransaction: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTransaction,
  isMobileOpen,
  onCloseMobile,
}) => {
  const mainNavItems = [
    { id: 'overview' as ViewTab, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'statements' as ViewTab, label: 'Sao kê', icon: FileText },
    { id: 'reports' as ViewTab, label: 'Báo cáo', icon: BarChart3 },
    { id: 'recommender' as ViewTab, label: 'Lựa chọn thẻ', icon: Star },
    { id: 'lookup' as ViewTab, label: 'Tra cứu', icon: Search },
  ];

  const settingsNavItems = [
    { id: 'manage-cards' as ViewTab, label: 'Quản lý thẻ', icon: CreditCard },
    { id: 'currency' as ViewTab, label: 'Đơn vị tiền', icon: Coins },
    { id: 'cashback-policy' as ViewTab, label: 'Chính sách hoàn tiền', icon: BadgePercent },
    { id: 'categories' as ViewTab, label: 'Danh mục', icon: Tags },
    { id: 'toggle-cashbook' as ViewTab, label: 'Bật / Tắt Sổ thu chi', icon: Sliders },
  ];

  const handleNavClick = (tab: ViewTab) => {
    onSelectTab(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200/90 z-50 flex flex-col p-4 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between lg:hidden mb-2 pb-2 border-b border-slate-100">
          <span className="font-semibold text-slate-800 text-sm">Menu Điều Hướng</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button: + Nhập giao dịch */}
        <div className="mb-5">
          <button
            onClick={() => {
              onOpenNewTransaction();
              if (isMobileOpen) onCloseMobile();
            }}
            className="w-full bg-[#056c4c] hover:bg-[#04593e] active:scale-[0.98] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-all text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nhập giao dịch</span>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1 mb-6">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#edf8f2] text-[#056c4c]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#056c4c]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* CÀI ĐẶT section header */}
        <div className="px-3.5 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cài đặt
          </p>
        </div>

        {/* Settings Navigation */}
        <div className="space-y-0.5 overflow-y-auto flex-1 pr-1">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-[13px] font-normal transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#edf8f2] text-[#056c4c] font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#056c4c]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* App Footer Branding & Netlify badge */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Hoàn Tiền Thẻ Pro</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
              Netlify Ready
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
