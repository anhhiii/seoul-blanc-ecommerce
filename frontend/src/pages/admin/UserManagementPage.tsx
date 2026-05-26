import React, { useState } from 'react';
import { ShieldAlert, UserCheck, UserX, User, X } from 'lucide-react';
import { useAdmin } from '../../features/admin/hooks/useAdmin.js';

export const UserManagementPage: React.FC = () => {
  const { useGetUsers, updateUserStatus, updateUserRole } = useAdmin();
  const { data: users = [], isLoading } = useGetUsers();
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const actionText = nextStatus === 'BLOCKED' ? 'khóa' : 'mở khóa';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) {
      updateUserStatus.mutate({ id, status: nextStatus });
    }
  };

  const handleToggleRole = (id: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const roleText = nextRole === 'ADMIN' ? 'Quản trị viên (ADMIN)' : 'Khách hàng (USER)';
    if (window.confirm(`Bạn có muốn thay đổi quyền tài khoản này thành ${roleText}?`)) {
      updateUserRole.mutate({ id, role: nextRole });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-light text-brand-500">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-semibold text-brand-950 tracking-wider uppercase">Quản lý khách hàng</h1>
        <p className="text-xs text-brand-500 font-light mt-0.5">Quản lý danh sách thành viên, cập nhật quyền hạn hoặc chặn truy cập</p>
      </div>

      <div className="bg-white border border-brand-200/50 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-100 text-[10px] uppercase tracking-widest text-brand-500 font-bold bg-brand-50/20">
                <th className="py-3.5 px-6">Họ và Tên</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6 text-center">Vai trò</th>
                <th className="py-3.5 px-6 text-center">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 font-light text-brand-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-400">
                    Không tìm thấy tài khoản người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-brand-50/10">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => setSelectedUser(user)}
                          className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold border border-brand-200 cursor-pointer hover:opacity-85 transition-opacity"
                        >
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                        <span 
                          onClick={() => setSelectedUser(user)}
                          className="font-semibold text-brand-900 hover:text-brand-700 cursor-pointer hover:underline transition-colors"
                        >
                          {user.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2.5">
                      {/* Set Admin/User Button */}
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        disabled={updateUserRole.isPending}
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 hover:text-purple-800 transition-colors cursor-pointer disabled:opacity-40 border-none bg-transparent"
                        title="Đổi quyền hạn"
                      >
                        <ShieldAlert size={13} />
                        {user.role === 'ADMIN' ? 'Gỡ Admin' : 'Set Admin'}
                      </button>

                      {/* Block/Unblock Button */}
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        disabled={updateUserStatus.isPending}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 border-none bg-transparent ${
                          user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-800' : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? <UserX size={13} /> : <UserCheck size={13} />}
                        {user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-white border border-brand-200/50 rounded-3xl p-6 shadow-xl max-w-md w-full space-y-5 relative animate-in fade-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
                Chi tiết người dùng
              </h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-brand-400 hover:text-brand-900 border-none bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 pb-3 border-b border-brand-100">
              <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold border-2 border-brand-200 text-2xl uppercase">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.fullName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  selectedUser.fullName.charAt(0)
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-brand-950">{selectedUser.fullName}</h4>
                <p className="text-[10px] text-brand-500 font-mono mt-0.5">{selectedUser.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-brand-800">
              <div className="flex justify-between py-1 border-b border-brand-50">
                <span className="text-brand-450 font-medium">Email:</span>
                <span className="font-semibold">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-50">
                <span className="text-brand-450 font-medium">Số điện thoại:</span>
                <span className="font-semibold">{selectedUser.phoneNumber || 'Chưa cung cấp'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-50">
                <span className="text-brand-450 font-medium">Giới tính:</span>
                <span className="font-semibold">
                  {selectedUser.gender === 'MALE' ? 'Nam' : selectedUser.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-50">
                <span className="text-brand-450 font-medium">Vai trò:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  selectedUser.role === 'ADMIN'
                    ? 'bg-purple-50 text-purple-600 border border-purple-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-50">
                <span className="text-brand-450 font-medium">Trạng thái:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {selectedUser.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand-450 font-medium">Ngày tham gia:</span>
                <span className="font-semibold">
                  {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-brand-900 hover:bg-brand-950 text-white rounded-xl py-2.5 text-xs font-medium transition-colors cursor-pointer text-center border-none"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
