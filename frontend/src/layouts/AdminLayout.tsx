import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar.js';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h2 className="text-sm font-medium text-gray-800">Bảng điều khiển quản trị</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Seoul Blanc Admin</p>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
