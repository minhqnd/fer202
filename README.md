# FastFood Express - Dự Án Web Cửa Hàng Đặt Đồ Ăn Nhanh (FER202)

Dự án môn học **FER202 (Front-End Web Development with React)** xây dựng ứng dụng web đặt đồ ăn nhanh theo phong cách giao diện tối giản (clean UI), chuẩn hóa hoàn toàn bằng **Bootstrap 5 & React-Bootstrap**, kết nối dữ liệu qua **Axios** và **JSON-Server**.

---

## Công Nghệ Sử Dụng (Chỉ dùng các thư viện có sẵn trong dự án)
- **React 18** (Functional Components, Hooks, Context API)
- **React-Bootstrap 2.10.2 & Bootstrap 5.3.3** (UI Components, Grid System, Modal, Table, Form, Navbar, Card, Badge)
- **React Router DOM v6** (Client-side Routing, Protected Routes, URL Query Parameters)
- **Axios** (RESTful API Client)
- **JSON-Server** (Mock REST API Backend với file `database.json`)

---

## Phân Chia Công Việc Cho Nhóm 3 Người (Team Work Distribution)

### Thành Viên 1: Trải Nghiệm Khách Hàng, Thực Đơn & Đánh Giá (Customer Catalog & Reviews)
- **Trang chủ (`src/pages/Home.jsx`):**
  - Banner giới thiệu hệ thống đặt đồ ăn nhanh.
  - Danh mục món ăn (Category Cards) trực quan.
  - Mục món ăn nổi bật (`isFeatured`), các chương trình voucher ưu đãi.
- **Trang Thực đơn (`src/pages/Menu.jsx`):**
  - Bộ lọc (`FoodFilter.jsx`): Lọc theo danh mục, tìm kiếm theo tên món, sắp xếp giá (tăng/giảm), đánh giá cao, lượng calo.
  - Phân trang (Pagination) bằng React-Bootstrap.
- **Trang Chi tiết món ăn (`src/pages/FoodDetail.jsx`):**
  - Hiển thị thông số: calo, thời gian làm, các loại nguyên liệu, % giảm giá.
  - Xem danh sách đánh giá của thực khách.
  - Form gửi đánh giá và chấm điểm trực tiếp (`POST /reviews`).
  - Gợi ý các món ăn tương tự trong cùng danh mục.

---

### Thành Viên 2: Giỏ Hàng, Thanh Toán, Voucher & Quản Lý Đơn Cá Nhân (Cart & Order Processing)
- **Quản lý Giỏ hàng (`src/context/CartContext.js` & `src/pages/Cart.jsx`):**
  - Context `CartContext` toàn cục, lưu trữ giỏ hàng tự động vào `localStorage`.
  - Thêm món, tăng/giảm số lượng món ăn linh hoạt, xóa từng món hoặc xóa toàn bộ giỏ.
  - Bảng giỏ hàng chuẩn Responsive Bootstrap Table.
- **Áp dụng Mã giảm giá (Vouchers):**
  - Kiểm tra điều kiện đơn hàng tối thiểu (`minOrderValue`).
  - Hỗ trợ 3 loại voucher trong database: Giảm tiền trực tiếp (`FIXED`), Giảm theo % (`PERCENT`), Miễn phí vận chuyển (`SHIPPING`).
- **Trang Thanh toán (`src/pages/Checkout.jsx`):**
  - Form nhập thông tin người nhận (Họ tên, SĐT, Địa chỉ, Ghi chú) kèm Validation kỹ lưỡng.
  - Chọn các phương thức thanh toán: Tiền mặt khi nhận hàng (COD), Ví MoMo, Chuyển khoản VietQR.
  - Sinh mã đơn tự động (`ORD-YYYYMMDD-XXX`) và tạo đơn hàng qua `POST /orders`.
- **Trang Lịch sử đơn hàng (`src/pages/OrderHistory.jsx`):**
  - Theo dõi danh sách các đơn hàng đã đặt của tài khoản.
  - Modal xem chi tiết món đã mua, phí ship, mã giảm giá và tổng tiền.
  - Chức năng Hủy đơn hàng (nếu đơn đang ở trạng thái `PENDING`).
  - Chức năng "Đặt lại đơn này" (Re-order) tiện lợi.

---

### Thành Viên 3: Xác Thực, Phân Quyền & Quản Trị Hệ Thống (Auth & Admin Management)
- **Xác thực & Chuyển đổi tài khoản (`src/context/AuthContext.js` & `src/pages/Login.jsx`):**
  - Quản lý trạng thái đăng nhập, phân quyền `role: 'admin'` và `role: 'customer'`.
  - Hỗ trợ đổi nhanh giữa các tài khoản mẫu để chấm bài và kiểm thử ngay trên Header/Login.
  - Bảo vệ định tuyến (`src/components/common/ProtectedRoute.jsx`) chặn người dùng thường truy cập trang Admin.
- **Trang Cá nhân (`src/pages/Profile.jsx`):**
  - Xem thông tin tài khoản và cập nhật số điện thoại, địa chỉ nhận hàng mặc định (`PATCH /users/:id`).
- **Báo cáo Tổng quan Admin (`src/pages/admin/AdminDashboard.jsx`):**
  - Báo cáo thống kê: Tổng doanh thu, tổng số đơn đặt, số món trong thực đơn, số lượng tài khoản.
  - Phân tích trạng thái đơn hàng (Chờ xác nhận, Đang nấu, Đang giao, Đã giao, Đã hủy).
  - Bảng các đơn hàng mới nhất cần xử lý.
- **Quản lý Món ăn CRUD (`src/pages/admin/AdminFoods.jsx`):**
  - Hiển thị bảng danh sách món ăn, tìm kiếm và lọc theo danh mục.
  - **Create**: Modal thêm món ăn mới (`POST /foods`).
  - **Update**: Modal chỉnh sửa giá, mô tả, ảnh, calo (`PUT /foods/:id`).
  - **Toggle**: Nút đổi trạng thái còn món / hết hàng trực tiếp trên bảng (`PATCH /foods/:id`).
  - **Delete**: Modal xác nhận xóa món (`DELETE /foods/:id`).
- **Quản lý Đơn hàng (`src/pages/admin/AdminOrders.jsx`):**
  - Danh sách toàn bộ đơn hàng hệ thống.
  - Bộ lọc theo trạng thái đơn hàng (PENDING, PREPARING, DELIVERING, DELIVERED, CANCELLED).
  - Cập nhật trạng thái đơn trực tiếp để chuyển bếp hoặc thông báo giao hàng.
  - Modal xem chi tiết từng đơn hàng.

---

## Hướng Dẫn Khởi Chạy Dự Án

### 1. Khởi chạy Mock Database (JSON-Server):
```bash
npm run server
```
> Server sẽ chạy tại cổng: `http://localhost:9999` với file `database.json`.

### 2. Khởi chạy ứng dụng React (Frontend):
```bash
npm start
```
> Ứng dụng sẽ tự động mở tại: `http://localhost:3000`.

---

## Tài Khoản Thử Nghiệm (Trong `database.json`)

| Tên tài khoản | Email | Vai trò | Mục đích kiểm thử |
| :--- | :--- | :--- | :--- |
| `admin` | admin@fastfood.vn | **Admin** (Quản trị viên) | Toàn quyền vào `/admin`, Dashboard, CRUD Món ăn, Cập nhật trạng thái đơn hàng |
| `nguyenvana` | vana@gmail.com | **Customer** (Khách hàng) | Đặt món, nhập voucher, quản lý đơn cá nhân |
| `tranthibich` | bichth@gmail.com | **Customer** (Khách hàng) | Tài khoản khách hàng thứ 2 |

---

## Danh Sách Mã Giảm Giá Có Sẵn
- `FAST20K`: Giảm 20.000đ cho đơn từ 150.000đ
- `FREESHIP`: Miễn phí vận chuyển tối đa 30.000đ cho đơn từ 100.000đ
- `BURGER10`: Giảm 10% tổng hóa đơn (tối đa 50.000đ) cho đơn từ 80.000đ
