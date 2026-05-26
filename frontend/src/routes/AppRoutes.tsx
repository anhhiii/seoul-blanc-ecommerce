import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout.js';
import { AuthLayout } from '../layouts/AuthLayout.js';
import { AdminLayout } from '../layouts/AdminLayout.js';

// Pages
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/auth/LoginPage.js';
import { RegisterPage } from '../pages/auth/RegisterPage.js';
import { VerifyOTPPage } from '../pages/auth/VerifyOTPPage.js';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.js';
import { CategoryManagementPage } from '../pages/admin/CategoryManagementPage.js';
import { ProductManagementPage } from '../pages/admin/ProductManagementPage.js';
import { ProductsPage } from '../pages/ProductsPage.js';
import { ProductDetailPage } from '../pages/ProductDetailPage.js';
import { CategoriesPage } from '../pages/CategoriesPage.js';
import { CartPage } from '../pages/CartPage.js';

// Guards
import { ProtectedRoute } from '../shared/components/ProtectedRoute.js';

// Account Pages
import { AccountLayout } from '../pages/account/AccountLayout.js';
import { ProfilePage } from '../pages/account/ProfilePage.js';
import { OrdersPage } from '../pages/account/OrdersPage.js';
import { WishlistPage } from '../pages/account/WishlistPage.js';
import { AddressesPage } from '../pages/account/AddressesPage.js';
import { VouchersPage } from '../pages/account/VouchersPage.js';
import { NotificationsPage } from '../pages/account/NotificationsPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { OrderManagementPage } from '../pages/admin/OrderManagementPage.js';
import { DashboardPage } from '../pages/admin/DashboardPage.js';
import { UserManagementPage } from '../pages/admin/UserManagementPage.js';
import { VoucherManagementPage } from '../pages/admin/VoucherManagementPage.js';
import { AboutPage } from '../pages/AboutPage.js';
import { CollectionsPage } from '../pages/CollectionsPage.js';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ===== Public Routes with MainLayout (Header + Footer) ===== */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:idOrSlug" element={<ProductDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* ===== Protected Account Routes ===== */}
        <Route
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/wishlist" element={<WishlistPage />} />
          <Route path="/account/addresses" element={<AddressesPage />} />
          <Route path="/account/vouchers" element={<VouchersPage />} />
          <Route path="/account/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* ===== Auth Routes with AuthLayout (Split banner) ===== */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* ===== Admin Routes with AdminLayout (Protected) ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/products" element={<ProductManagementPage />} />
        <Route path="/admin/categories" element={<CategoryManagementPage />} />
        <Route path="/admin/orders" element={<OrderManagementPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/vouchers" element={<VoucherManagementPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
