import { SpendingCategory } from '../types';

export const DEFAULT_CATEGORIES: SpendingCategory[] = [
  {
    id: 'dining',
    name: 'Ẩm thực & Nhà hàng',
    iconName: 'UtensilsCrossed',
    color: '#ef4444',
    description: 'Ăn uống, cafe, nhà hàng, quán ăn, giao đồ ăn GrabFood/ShopeeFood',
  },
  {
    id: 'supermarket',
    name: 'Siêu thị & Tạp hóa',
    iconName: 'ShoppingCart',
    color: '#10b981',
    description: 'WinMart, Co.opmart, Big C/Tops, Lotte Mart, Bách Hóa Xanh, Circle K',
  },
  {
    id: 'online_shopping',
    name: 'Mua sắm trực tuyến',
    iconName: 'Laptop',
    color: '#3b82f6',
    description: 'Shopee, Lazada, Tiki, TikTok Shop, trang thương mại điện tử',
  },
  {
    id: 'travel',
    name: 'Du lịch & Khách sạn',
    iconName: 'Plane',
    color: '#8b5cf6',
    description: 'Vé máy bay, khách sạn, Agoda, Booking, Traveloka, tour du lịch',
  },
  {
    id: 'transport',
    name: 'Xăng dầu & Di chuyển',
    iconName: 'Fuel',
    color: '#f59e0b',
    description: 'Cây xăng Petrolimex/PV Oil, Grab car/bike, taxi, vé xe',
  },
  {
    id: 'education_health',
    name: 'Y tế & Giáo dục',
    iconName: 'HeartPulse',
    color: '#ec4899',
    description: 'Bệnh viện, phòng khám, nhà thuốc, học phí trường học, khóa học online',
  },
  {
    id: 'bills',
    name: 'Hóa đơn & Tiện ích',
    iconName: 'Receipt',
    color: '#06b6d4',
    description: 'Điện, nước, internet, truyền hình cáp, nạp tiền điện thoại',
  },
  {
    id: 'other',
    name: 'Chi tiêu khác',
    iconName: 'Tag',
    color: '#64748b',
    description: 'Các giao dịch thanh toán POS hoặc trực tuyến thông thường khác',
  },
];
