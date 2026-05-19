# KOREAN MINIMALIST FASHION ECOMMERCE – MASTER EXECUTION PLAN (UPDATED)

# 1. Tổng quan dự án

## 1.1 Tên đề tài

Korean Minimalist Fashion Ecommerce Website

---

## 1.2 Mô tả dự án

Xây dựng website thương mại điện tử thời trang phong cách Hàn Quốc tối giản dành cho giới trẻ.

Hệ thống tập trung vào:

* Trải nghiệm mua sắm hiện đại
* Giao diện tối giản, premium
* Ecommerce business logic thực tế
* Authentication & Authorization
* AI recommendation như một tính năng hỗ trợ
* Responsive UI/UX
* Kiến trúc fullstack rõ ràng

---

## 1.3 Đối tượng người dùng

### User

Người dùng mua hàng:

* Xem sản phẩm
* Tìm kiếm và lọc sản phẩm
* Thêm sản phẩm vào giỏ hàng
* Checkout
* Xem lịch sử đơn hàng
* Đánh giá sản phẩm

### Admin

Quản trị hệ thống:

* CRUD sản phẩm
* CRUD category
* Quản lý đơn hàng
* Quản lý người dùng
* Dashboard thống kê

---

# 2. Phạm vi dự án

## 2.1 Niche thời trang

Minimalist Korean Fashion

---

## 2.2 Danh mục sản phẩm

Website chỉ tập trung chuyên sâu vào áo quần thời trang Hàn Quốc tối giản.

Không triển khai:

* phụ kiện
* trang sức
* túi xách
* giày dép
* mỹ phẩm

Để giữ scope hợp lý và tối ưu business logic.

---

## Tops

* T-shirt
* Oversized Tee
* Shirt
* Sweater
* Hoodie
* Polo

---

## Bottoms

* Jeans
* Trousers
* Jogger
* Shorts
* Skirt

---

## Outerwear

* Jacket
* Blazer
* Coat
* Cardigan

---

## Dresses

* Mini Dress
* Long Dress
* Knit Dress

---

# 3. Công nghệ sử dụng

# 3.1 Frontend

| Công nghệ        | Vai trò          |
| ---------------- | ---------------- |
| ReactJS + Vite   | Frontend         |
| TypeScript       | Type Safety      |
| TailwindCSS      | Styling          |
| React Router DOM | Routing          |
| Axios            | API Calling      |
| Zustand          | State Management |
| React Hook Form  | Form Handling    |
| Zod/Yup          | Validation       |
| SwiperJS         | Slider           |
| Framer Motion    | Animation        |

---

# 3.2 Backend

| Công nghệ          | Vai trò           |
| ------------------ | ----------------- |
| NodeJS             | Runtime           |
| ExpressJS          | Backend Framework |
| TypeScript         | Type Safety       |
| Prisma ORM         | Database ORM      |
| MongoDB            | Database          |
| JWT                | Authentication    |
| bcrypt             | Password Hash     |
| Multer             | Upload Image      |
| Cloudinary         | Image Storage     |
| Nodemailer         | Email Service     |
| express-rate-limit | Rate Limiting     |
| Joi/Zod            | Validation        |

---

# 4. Kiến trúc hệ thống

React Frontend
↓
ExpressJS REST API
↓
Prisma ORM
↓
MongoDB Database
↓
Cloudinary Storage
↓
OpenAI API (AI Features)

---

# 5. Thiết kế Database (MongoDB + Prisma)

# 5.1 Database Design Principles

Database được thiết kế theo hướng:

* tối ưu ecommerce business logic
* dễ mở rộng
* phù hợp MongoDB document structure
* tránh nested quá sâu
* tách riêng variants để quản lý size/màu

---

# 5.2 Các ENUM sử dụng

# UserRole

```ts
enum UserRole {
  USER
  ADMIN
}
```

---

# Gender

```ts
enum Gender {
  MALE
  FEMALE
  OTHER
}
```

---

# ProductStatus

```ts
enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
}
```

---

# CategoryType

```ts
enum CategoryType {
  TOPS
  BOTTOMS
  OUTERWEAR
  DRESSES
}
```

---

# SizeEnum

```ts
enum SizeEnum {
  S
  M
  L
  XL
}
```

---

# ColorEnum

```ts
enum ColorEnum {
  BLACK
  WHITE
  GRAY
  BEIGE
  BROWN
  NAVY
  GREEN
}
```

---

# OrderStatus

```ts
enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPING
  DELIVERED
  CANCELLED
}
```

---

# PaymentStatus

```ts
enum PaymentStatus {
  UNPAID
  PAID
  FAILED
}
```

---

# PaymentMethod

```ts
enum PaymentMethod {
  COD
  STRIPE
  VNPAY
}
```

---

# 5.3 Users Collection

```js
{
  _id,
  fullName,
  email,
  password,
  avatar,
  phoneNumber,
  gender,
  role,
  isVerified,
  createdAt,
  updatedAt
}
```

---

# Users Validation Rules

| Field      | Rule          |
| ---------- | ------------- |
| fullName   | required      |
| email      | unique        |
| password   | hashed        |
| role       | USER/ADMIN    |
| isVerified | default false |

---

# 5.4 Categories Collection

```js
{
  _id,
  name,
  slug,
  type,
  description,
  createdAt
}
```

---

# Example Categories

```bash
TOPS
BOTTOMS
OUTERWEAR
DRESSES
```

---

# 5.5 Products Collection

```js
{
  _id,
  name,
  slug,
  description,
  categoryId,
  thumbnail,
  images: [],
  price,
  discountPrice,
  material,
  fit,
  style,
  tags: [],
  sold,
  ratingAverage,
  totalReviews,
  status,
  createdAt,
  updatedAt
}
```

---

# Product Fields Explanation

| Field         | Ý nghĩa                    |
| ------------- | -------------------------- |
| fit           | slim / regular / oversized |
| style         | korean / minimalist        |
| sold          | số lượng đã bán            |
| ratingAverage | rating trung bình          |
| totalReviews  | tổng review                |

---

# 5.6 ProductVariants Collection

Tách riêng variant để:

* quản lý size
* quản lý màu
* quản lý stock

---

```js
{
  _id,
  productId,
  size,
  color,
  stock,
  sku,
  createdAt,
  updatedAt
}
```

---

# Ví dụ Product Variant

```js
{
  productId: "hoodie-black",
  size: "M",
  color: "BLACK",
  stock: 20
}
```

---

# 5.7 Carts Collection

Mỗi user chỉ có 1 cart.

---

```js
{
  _id,
  userId,
  items: [
    {
      productVariantId,
      quantity,
      price
    }
  ],
  totalPrice,
  updatedAt
}
```

---

# Cart Rules

* Chỉ user login mới có cart
* Nếu product hết stock → không add cart
* Quantity không vượt stock

---

# 5.8 Orders Collection

```js
{
  _id,
  userId,
  orderCode,
  items: [
    {
      productVariantId,
      productName,
      thumbnail,
      quantity,
      size,
      color,
      price
    }
  ],
  totalPrice,
  shippingFee,
  paymentMethod,
  paymentStatus,
  orderStatus,
  shippingAddress,
  phoneNumber,
  note,
  createdAt,
  updatedAt
}
```

---

# Order Rules

## Checkout flow

```bash
PENDING
→ CONFIRMED
→ SHIPPING
→ DELIVERED
```

---

# Nếu user hủy

```bash
CANCELLED
```

---

# 5.9 Reviews Collection

Chỉ user đã mua mới được review.

---

```js
{
  _id,
  userId,
  productId,
  rating,
  comment,
  createdAt
}
```

---

# Review Rules

| Rule          | Description                |
| ------------- | -------------------------- |
| rating        | 1–5                        |
| 1 user        | chỉ review 1 lần / product |
| must purchase | phải từng mua              |

---

# 5.10 OTPs Collection

```js
{
  _id,
  email,
  otp,
  createdAt
}
```

---

# OTP Rules

* OTP expire sau 5 phút
* TTL index MongoDB
* dùng cho:

  * verify account
  * forgot password

---

# 5.11 Prisma Schema Structure

```bash
prisma/
└── schema.prisma
```

---

# Prisma Models

Sẽ gồm:

```bash
User
Category
Product
ProductVariant
Cart
Order
Review
OTP
```

---

# Database Relationships

```bash
User
 ├── Cart
 ├── Orders
 └── Reviews

Category
 └── Products

Product
 ├── ProductVariants
 └── Reviews
```

---

# MongoDB Indexing Strategy

## Products

Index:

```bash
name
categoryId
price
status
```

---

## Users

Index:

```bash
email
```

---

## Orders

Index:

```bash
userId
orderStatus
createdAt
```

---

# 6. Phân quyền hệ thống

# 6.1 User Role

Có thể:

* Xem sản phẩm
* Tìm kiếm sản phẩm
* Lọc sản phẩm
* Đăng ký / đăng nhập
* Thêm vào giỏ hàng
* Checkout
* Xem profile
* Xem lịch sử đơn hàng
* Đánh giá sản phẩm

---

# 6.2 Admin Role

Có thể:

* CRUD sản phẩm
* CRUD category
* Upload ảnh sản phẩm
* Quản lý đơn hàng
* Quản lý user
* Xem dashboard thống kê

---

# 7. Authentication & Authorization

# JWT Authentication

Sử dụng:

* Access Token

Lưu token:

* localStorage

---

# Middleware phân quyền

## verifyToken

Kiểm tra JWT hợp lệ.

---

## isAdmin

Kiểm tra:

```js
user.role === 'admin'
```

---

# Rule bảo mật

* Chỉ user đã login mới được:

  * thêm giỏ hàng
  * checkout
  * review sản phẩm
  * xem lịch sử đơn hàng

Nếu chưa login:
→ redirect /login

---

# 8. Backend Structure (ExpressJS)

# 8.1 Cấu trúc thư mục Backend

```bash
src/
├── config/
├── controllers/
│   └── v1/
├── routes/
├── services/
├── middlewares/
├── validations/
├── exceptions/
├── shared/
├── mappers/
├── prompts/
├── types/
├── utils/
├── prisma/
├── app.ts
└── index.ts
```

---

# 8.2 API Base URL

Tất cả API sử dụng format:

```bash
/api/v1/...
```

Ví dụ:

```bash
/api/v1/auth/login
/api/v1/products
/api/v1/cart
```

---

# 8.3 Middleware cốt lõi

## Validation Middleware

Validate:

* email hợp lệ
* password đủ mạnh
* price
* quantity
* pagination params

Sử dụng:

* Joi hoặc Zod

---

## Rate Limiting

Áp dụng cho:

* login
* register
* forgot-password
* AI APIs

Ví dụ:

* 5 request / 15 phút

---

## Authentication Middleware

Kiểm tra:

* JWT token
* role user/admin

---

## Error Handler

Chuẩn hóa response:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

# 9. Các API chính

# 9.1 Auth APIs

```http
POST /api/v1/auth/register
POST /api/v1/auth/verify-otp
POST /api/v1/auth/login
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
```

---

# 9.2 User APIs

```http
GET /api/v1/users/profile
PUT /api/v1/users/profile
GET /api/v1/users/orders
```

---

# 9.3 Product APIs

```http
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
```

---

# Product Query Features

Supports:

* search
* category
* price range
* size
* color
* sorting
* pagination

Example:

```bash
/api/v1/products?
search=hoodie
&category=tops
&minPrice=20
&maxPrice=100
&size=M
&color=black
&sort=-createdAt
```

---

# 9.4 Cart APIs

```http
GET    /api/v1/cart
POST   /api/v1/cart/add
PUT    /api/v1/cart/update
DELETE /api/v1/cart/remove/:id
```

Lưu ý:

* phải đăng nhập mới được thao tác cart

---

# 9.5 Order APIs

```http
POST /api/v1/orders/checkout
GET  /api/v1/orders/my-orders
GET  /api/v1/orders/:id
```

Lưu ý:

* phải login mới checkout được

---

# 9.6 Review APIs

```http
POST /api/v1/reviews
GET  /api/v1/reviews/:productId
```

---

# 9.7 Admin APIs

```http
GET /api/v1/admin/dashboard
GET /api/v1/admin/users
PUT /api/v1/admin/orders/:id
```

---

# 9.8 AI APIs

```http
POST /api/v1/ai/recommend
POST /api/v1/ai/similar-product
POST /api/v1/ai/size-suggestion
POST /api/v1/ai/search
```

---

# 10. Frontend Architecture (ReactJS)

# 10.1 Cấu trúc thư mục Frontend

```bash
src/
├── assets/
├── components/
│   ├── layout/
│   ├── common/
│   ├── forms/
│   ├── product/
│   └── ui/
│
├── features/
│   ├── auth/
│   ├── cart/
│   ├── product/
│   ├── order/
│   └── admin/
│
├── layouts/
├── pages/
├── routes/
├── shared/
├── services/
├── store/
├── hooks/
├── utils/
├── App.tsx
└── main.tsx
```

---

# 10.2 Layout System

## MainLayout

Dùng cho:

* homepage
* products
* product detail

Bao gồm:

* Header
* Footer
* Search Bar
* Navigation

---

## AuthLayout

Dùng cho:

* login
* register
* forgot password

---

## AdminLayout

Bao gồm:

* Sidebar
* Dashboard menu
* Analytics

---

# 10.3 State Management

## authStore

Lưu:

* user info
* token
* isAuthenticated

---

## cartStore

Lưu:

* cart items
* quantity
* subtotal

---

# 10.4 Protected Routes

## GuestRoute

Nếu đã login:
→ redirect homepage

---

## UserRoute

Cho phép:

* checkout
* cart
* profile
* order history

Nếu chưa login:
→ redirect /login

---

## AdminRoute

Cho phép:

* dashboard
* product management
* order management

Nếu không phải admin:
→ redirect /

---

# 11. Các tính năng chính

# 11.1 Authentication

## Features

* Register
* Login
* Logout
* Forgot Password
* OTP Verification

---

# 11.2 Homepage

## Sections

* Hero Banner
* New Arrivals
* Best Sellers
* Trending Products

---

# 11.3 Product Listing

## Features

* pagination
* filter
* sorting
* search
* responsive grid

---

# 11.4 Product Detail

## Features

* image slider
* variant selection
* stock checking
* reviews
* related products

---

# 11.5 Shopping Cart

## Features

* add to cart
* remove item
* update quantity
* subtotal calculation

---

# 11.6 Checkout

## Features

* shipping form
* payment method
* order summary

---

# 11.7 User Profile

## Features

* update profile
* order history
* avatar upload

---

# 11.8 Admin Dashboard

## Features

* statistics
* manage products
* manage categories
* manage orders
* manage users

---

# 12. AI Features

# 12.1 AI Smart Search

Ví dụ:

Input:

```bash
hoodie đen phong cách Hàn Quốc
```

AI hiểu semantic meaning thay vì keyword thường.

---

# 12.2 AI Similar Product

Gợi ý sản phẩm tương tự dựa trên:

* tags
* category
* style
* embeddings

---

# 12.3 AI Size Suggestion

Input:

* chiều cao
* cân nặng

Output:

* size phù hợp

---

# 13. UI/UX Guidelines

# Design Style

Phong cách:

* Minimal
* Clean
* Korean fashion aesthetic
* Neutral colors

---

# Responsive

Hỗ trợ:

* Desktop
* Tablet
* Mobile

---

# Animation

Dùng:

* Framer Motion

---

# 14. Security

# Security Features

* JWT Authentication
* Password Hashing
* Input Validation
* Rate Limiting
* Protected Routes
* Role-based Authorization

---

# 15. Testing

# Backend

* API Testing bằng Postman
* Validation testing
* Auth testing

---

# Frontend

* Responsive testing
* Route protection testing
* Form validation testing

---

# 16. Git Workflow

# Branching Strategy

```bash
main
develop
feature/*
fix/*
```

---

# Commit Convention

```bash
feat(auth): implement login api
fix(cart): resolve add to cart issue
refactor(product): optimize filter query
```

---

# 17. Roadmap triển khai

# Phase 1 – Foundation

## Backend

* ExpressJS setup
* Prisma setup
* MongoDB setup
* Auth module

## Frontend

* React + Vite setup
* TailwindCSS setup
* Routing setup
* Layout system

---

# Phase 2 – Ecommerce Core

* Product system
* Category system
* Product detail
* Search & filter

---

# Phase 3 – Cart & Checkout

* Shopping cart
* Checkout flow
* Order management

---

# Phase 4 – Admin Dashboard

* Product CRUD
* Category CRUD
* User management
* Order management

---

# Phase 5 – AI Features

* Smart Search
* Similar Product
* Size Suggestion

---

# Phase 6 – Optimization

* Responsive optimization
* Lazy loading
* Image optimization
* Security optimization

---

# 18. Những điểm nổi bật khi demo/phỏng vấn

## Technical Highlights

* MERN-style fullstack architecture
* MongoDB + Prisma
* Authentication & Authorization
* Role-based access control
* Ecommerce business logic
* AI integration
* Modern React architecture
* Clean backend structure
* Responsive UI/UX
* Search & filtering system

---

# 19. Scope không triển khai

Không triển khai:

* Docker
* CI/CD
* ERP warehouse
* Multi-vendor marketplace
* Complex logistics system
* Livestream commerce
* Native mobile app
* Microservices
* Wishlist feature

---

# 20. Kết luận

Đây là một dự án ecommerce fullstack hiện đại phù hợp để:

* Làm portfolio cá nhân
* Showcase kỹ năng MERN Stack
* Showcase business logic ecommerce
* Thực hành authentication & authorization
* Thực hành AI integration
* Chuẩn bị đi internship/junior developer

Dự án cân bằng tốt giữa:

* UI/UX
* Backend logic
* Database design
* Security
* AI features
* Project architecture

mà vẫn phù hợp để một cá nhân triển khai hoàn chỉnh.
