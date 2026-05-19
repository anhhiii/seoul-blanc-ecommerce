# Seoul Blanc - Minimalist Korean Women's Fashion E-Commerce 🏷️✨

**Seoul Blanc** là một nền tảng thương mại điện tử chuyên nghiệp dành riêng cho thời trang nữ theo phong cách tối giản Hàn Quốc (Minimalist Korean Style). Với định hướng mang lại trải nghiệm mua sắm thanh lịch, nhẹ nhàng và tinh tế, Seoul Blanc kết hợp ngôn ngữ thiết kế Modern Minimalist vào từng chi tiết giao diện người dùng.

Dự án được xây dựng trên mô hình Fullstack hoàn chỉnh (MERN Stack: MongoDB - Express - React - Node.js) tối ưu hóa SEO, tích hợp cơ chế bảo mật xác thực OTP, bộ lọc thuộc tính nâng cao và trang quản trị sản phẩm thông minh.

---

## 🌟 Tính Năng Nổi Bật

### 1. Phân Hệ Khách Hàng (Client Storefront)
*   **Giao Diện Chuẩn Seoul Aesthetic**: Thiết kế thanh lịch sử dụng Tailwind CSS kết hợp bảng màu trung tính nhẹ nhàng, typography hiện đại (`Plus Jakarta Sans` & `Inter`).
*   **Trang Chủ Bán Hàng Động**:
    *   Tự động tải danh sách Danh mục (Collections Slider) có hỗ trợ nút vuốt/nút bấm điều hướng mượt mà.
    *   Hiển thị thông tin Khuyến mãi, Sản phẩm mới nhất, Sản phẩm bán chạy nhất trực tiếp từ database.
    *   Hiển thị thông tin đăng nhập thành viên và nút Logout.
*   **Bộ Lọc Nâng Cao Đa Điều Kiện (`ProductsPage.tsx`)**:
    *   Lọc theo Khoảng giá (Min - Max), Màu sắc biến thể (ColorEnum), Kích thước biến thể (SizeEnum).
    *   Liên kết hai chiều với tham số URL (URL Search Params) giúp lưu trữ trạng thái tìm kiếm (Single Source of Truth) tiện lợi khi chia sẻ liên kết.
*   **Trang Chi Tiết Sản Phẩm Trực Quan (`ProductDetailPage.tsx`)**:
    *   Bộ sưu tập ảnh đa góc độ hỗ trợ Swiper/nút lướt ảnh Trái - Phải nổi trực tiếp.
    *   Tự động tính toán lượng **tồn kho động thời gian thực** (real-time stock) cho từng cặp biến thể Màu sắc & Kích thước được chọn.
    *   Hiển thị chỉ số lượng hàng **Đã bán** (Sold count) giúp tạo độ uy tín cho sản phẩm.
    *   **Bộ đếm số lượng mua thông minh**: Tự động giới hạn số lượng tăng/giảm theo mức tồn kho của biến thể hiện tại.
    *   **Sản phẩm tương tự**: Đề xuất thông minh 4 sản phẩm liên quan cùng danh mục phía cuối trang.
*   **Mega Menu Điều Hướng**: Tích hợp danh mục động chia theo nhóm cha lớn (Áo, Quần, Áo khoác, Váy/đầm) tự sinh từ dữ liệu thật.

### 2. Phân Hệ Quản Trị (Admin Dashboard)
*   **Quản Lý Sản Phẩm Toàn Diện**:
    *   Phân loại danh mục 2 cấp: Chọn Nhóm lớn (Parent Category Type) -> Tự động hiển thị các Danh mục con (Sub-categories).
    *   Quản lý biến thể đa kích thước, màu sắc kèm số lượng tồn kho và mã SKU tự sinh hoặc tùy chỉnh.
*   **Bảo Mật Nghiệp Vụ Backend**:
    *   Ràng buộc nghiệp vụ OOP nghiêm ngặt: Tự động khóa không cho xóa sản phẩm nếu đã nằm trong lịch sử đơn hàng để bảo toàn dữ liệu.
    *   Zod validation kiểm tra giá khuyến mãi luôn phải nhỏ hơn hoặc bằng giá gốc.

---

## 💻 Công Nghệ Sử Dụng

### 🖥️ Frontend
*   **React (TypeScript)**: Xây dựng giao diện hướng thành phần (Component-based).
*   **Vite**: Công cụ đóng gói cực nhanh cho môi trường phát triển.
*   **Tailwind CSS**: Thiết kế giao diện responsive tối giản, mượt mà.
*   **React Query (TanStack Query)**: Quản lý cache và đồng bộ dữ liệu API tối ưu.
*   **Lucide React**: Bộ icon phong cách tối giản.

### ⚙️ Backend
*   **Node.js & Express (TypeScript)**: Xây dựng RESTful API chuẩn hóa.
*   **Prisma ORM**: Quản lý truy vấn database thông qua Prisma Client an toàn kiểu dữ liệu (Type-safe).
*   **MongoDB**: Cơ sở dữ liệu NoSQL linh hoạt, lưu trữ thông tin sản phẩm và tài khoản khách hàng.
*   **JWT & bcrypt**: Cơ chế mã hóa mật khẩu và phát hành mã xác thực an toàn.
*   **Express Rate Limit & Zod**: Ngăn chặn tấn công Spam API và kiểm duyệt đầu vào dữ liệu đầu cuối.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống
*   Đã cài đặt **Node.js** (Phiên bản khuyến nghị: >= 18.x).
*   Đã cài đặt **MongoDB** (Local instance hoặc MongoDB Atlas Cloud URI).

---

### Bước 1: Clone và Truy Cập Thư Mục Dự Án
```bash
git clone https://github.com/anhhiii/MST.git
cd seoul-blanc-ecommerce
```

---

### Bước 2: Thiết Lập Môi Trường (Môi trường Backend)
1. Truy cập thư mục backend:
   ```bash
   cd backend
   ```
2. Tạo file cấu hình môi trường `.env` dựa theo mẫu:
   ```env
   PORT=5000
   DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/seoul-blanc?retryWrites=true&w=majority"
   JWT_SECRET="YOUR_SUPER_SECRET_KEY"
   JWT_EXPIRES_IN="7d"
   NODE_ENV="development"
   ```
3. Cài đặt các thư viện phụ thuộc và đồng bộ schema database:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```
4. Khởi chạy máy chủ Backend:
   ```bash
   # Run in development mode (nodemon)
   npm run dev
   ```
   *Backend mặc định khởi chạy tại địa chỉ: `http://localhost:5000`*

---

### Bước 3: Thiết Lập Môi Trường (Môi trường Frontend)
1. Mở một terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd ../frontend
   ```
2. Cài đặt các thư viện phía client:
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ Frontend:
   ```bash
   npm run dev
   ```
   *Frontend mặc định khởi chạy tại địa chỉ: `http://localhost:5173`*

---

## 🗂️ Cấu Trúc Thư Mục Chính

```text
seoul-blanc-ecommerce/
├── backend/
│   ├── prisma/             # Schema thiết kế cơ sở dữ liệu (schema.prisma)
│   └── src/
│       ├── controllers/    # Xử lý các request/response cho Admin & Client
│       ├── exceptions/     # Định nghĩa các lớp lỗi HTTP chuẩn
│       ├── middlewares/    # Phân quyền Auth, upload ảnh, validation
│       ├── routes/         # Định nghĩa các router RESTful API
│       ├── services/       # Xử lý nghiệp vụ chính (Business Logic OOP)
│       └── validations/    # Zod Schema kiểm duyệt dữ liệu đầu vào
└── frontend/
    └── src/
        ├── components/     # Các UI Components tái sử dụng (Header, Sidebar)
        ├── features/       # Quản lý State, Hooks, Types theo module (Product, Category, Auth)
        ├── pages/          # Giao diện chính (HomePage, ProductDetailPage, ProductsPage, Admin)
        └── routes/         # Cấu hình phân tuyến đường dẫn (AppRoutes)
```

---

## 📜 Quy Trình Kiểm Thử & Kiểm Duyệt Code
Trước khi push code lên Git, đảm bảo mã nguồn tuân thủ chất lượng linting:
```bash
# Phía Backend
cd backend && npm run build

# Phía Frontend
cd ../frontend && npm run lint && npm run build
```
*(Nếu hiển thị báo cáo thành công 100%, bạn có thể tiến hành commit và push mã nguồn lên nhánh chính).*