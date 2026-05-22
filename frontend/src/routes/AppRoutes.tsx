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
        <Route path="/admin" element={<div className="text-sm text-gray-600">Admin Dashboard - Coming soon</div>} />
        <Route path="/admin/products" element={<ProductManagementPage />} />
        <Route path="/admin/categories" element={<CategoryManagementPage />} />
        <Route path="/admin/orders" element={<div className="text-sm text-gray-600">Quản lý đơn hàng - Coming soon</div>} />
        <Route path="/admin/users" element={<div className="text-sm text-gray-600">Quản lý người dùng - Coming soon</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
