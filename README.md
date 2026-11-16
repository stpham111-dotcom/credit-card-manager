# Ứng Dụng Quản Lý Thẻ Tín Dụng & Tối Ưu Hoàn Tiền (Cashback)

Ứng dụng web Single Page Application (SPA) xây dựng bằng **React + Vite + TypeScript + Tailwind CSS**, giao diện hiện đại chuẩn 1:1 theo phong cách [hoantien.xyz/thetindung](https://hoantien.xyz/thetindung). Sẵn sàng để triển khai trực tiếp lên **Netlify** chỉ trong 1 phút!

---

## 🌟 Tính Năng Nổi Bật

1. **Dashboard Tổng Quan (Overview)**:
   - 4 thẻ chỉ số quan trọng: **Số thẻ đang dùng**, **Tổng hạn mức**, **Chi tiêu kỳ này**, **Cashback dự kiến** (hộp xanh nổi bật).
   - Thanh bộ lọc nhanh (HIỂN THỊ): Đã chi & mục tiêu cá nhân, Cashback dự kiến, Cashback theo danh mục, Điều kiện của thẻ, Thời gian chi tiêu, Gợi ý hành động.
   - Sắp xếp linh hoạt: theo hạn mức, chi tiêu nhiều nhất, gần ngày chốt sao kê nhất.

2. **Quản Lý Chu Kỳ & Hạn Mức Từng Thẻ**:
   - Thẻ hiển thị trực quan (gradient màu, logo Visa/Mastercard/JCB, 4 số cuối).
   - Thanh tiến độ sử dụng hạn mức (cảnh báo an toàn tín dụng theo chuẩn CIC < 50%).
   - Đếm ngược số ngày tới kỳ sao kê và ngày đến hạn thanh toán.
   - Cảnh báo & Gợi ý hành động thông minh (ví dụ: đã chạm trần hoàn tiền ẩm thực, cần chi thêm bao nhiêu để kích hoạt cashback...).

3. **Nhập Giao Dịch Nhanh (+ Nhập giao dịch)**:
   - Tự động gợi ý và tính tiền hoàn dự kiến ngay khi nhập số tiền và chọn danh mục.
   - Hiệu ứng pháo hoa ăn mừng khi nhận tiền hoàn!

4. **Quản Lý Sao Kê (Statements)**:
   - Theo dõi từng kỳ sao kê của các thẻ, số tiền thanh toán tối thiểu (5%).
   - Đánh dấu trạng thái: "Chưa thanh toán" hoặc "Đã thanh toán xong".

5. **Cố Vấn Quẹt Thẻ Thông Minh (Recommender)**:
   - Nhập số tiền và danh mục bạn sắp chi tiêu (ví dụ: Ăn nhà hàng 1.500.000đ).
   - Hệ thống tự so sánh mọi thẻ trong ví của bạn, kiểm tra thẻ nào chưa chạm trần, xếp hạng từ cao xuống thấp và chỉ ra thẻ tối ưu nhất!

6. **Tra Cứu Giao Dịch & Báo Cáo**:
   - Lọc và tìm kiếm theo ghi chú, danh mục, từng thẻ tín dụng.
   - Báo cáo cơ cấu chi tiêu & hoàn tiền theo danh mục.
   - Xuất báo cáo ra định dạng file Excel / CSV UTF-8.

7. **Bảo Mật & Lưu Trữ Dữ Liệu**:
   - Dữ liệu lưu an toàn 100% trong LocalStorage trên trình duyệt của bạn, không gửi thông tin tài chính lên máy chủ bên thứ ba.
   - Hỗ trợ Xuất / Nhập bản sao lưu định dạng file JSON.

---

## 🚀 Hướng Dẫn Deploy Lên Netlify

Dự án đã được cấu hình sẵn file `netlify.toml` và `public/_redirects` để đảm bảo routing SPA hoạt động mượt mà.

### Cách 1: Kéo thả thư mục `dist` vào Netlify Drop (Đơn giản nhất, không cần cài đặt gì)
1. Chạy lệnh build trong thư mục dự án:
   ```bash
   cd credit-card-manager
   npm run build
   ```
2. Thư mục `dist` sẽ được tạo ra tại `credit-card-manager/dist`.
3. Mở trình duyệt vào trang [app.netlify.com/drop](https://app.netlify.com/drop).
4. Kéo toàn bộ thư mục `dist` và thả vào khung tải lên của Netlify.
5. Sau vài giây, trang web của bạn sẽ được kích hoạt với một tên miền miễn phí dạng `https://ten-ung-dung.netlify.app`!

---

### Cách 2: Kết nối GitHub Repo với Netlify (Khuyên dùng - Tự động cập nhật mỗi khi sửa code)
1. Đẩy mã nguồn dự án lên GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: credit card cashback manager app"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```
2. Đăng nhập vào [Netlify.com](https://app.netlify.com/).
3. Bấm **"Add new site"** -> **"Import an existing project"** -> Chọn **GitHub**.
4. Chọn repository vừa tạo.
5. Netlify sẽ tự nhận diện cấu hình từ `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Bấm **"Deploy site"**. Từ bây giờ, mỗi lần bạn push code lên GitHub, Netlify sẽ tự động build và deploy phiên bản mới nhất!

---

### Cách 3: Dùng Netlify CLI (Nếu bạn thích dùng Terminal)
```bash
# Cài đặt Netlify CLI nếu chưa có
npm install -g netlify-cli

# Đăng nhập Netlify
netlify login

# Deploy trực tiếp
npm run build
netlify deploy --prod --dir=dist
```
