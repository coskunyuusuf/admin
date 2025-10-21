import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import {
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface User {
  username: string;
  full_name: string;
  roles: string[];
  created_at: string;
}

interface Role {
  value: string;
  label: string;
  color: string;
}

const RoleManagement: React.FC = () => {
  const { isAdmin, isInstructor } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery(
    'all-users',
    () => authAPI.getAllUsers(),
    {
      enabled: isAdmin() || isInstructor(),
    }
  );

  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignRole = async (): Promise<void> => {
    if (selectedUser && newRole) {
      setIsAssigning(true);
      try {
        await authAPI.assignRole({ username: selectedUser.username, role: newRole });
        toast.success('Rol başarıyla atandı');
        queryClient.invalidateQueries('all-users');
        setSelectedUser(null);
        setNewRole('');
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Rol atanırken bir hata oluştu. Lütfen tekrar deneyin.';
        toast.error(errorMessage);
      } finally {
        setIsAssigning(false);
      }
    }
  };


  const roles: Role[] = [
    { value: 'student', label: 'Öğrenci', color: 'blue' },
    { value: 'instructor', label: 'Eğitmen', color: 'green' },
    { value: 'admin', label: 'Admin', color: 'red' },
  ];

  const getRoleColor = (role: string): string => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj?.color || 'gray';
  };

  const getRoleLabel = (role: string): string => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj?.label || role;
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Rol Yönetimi</h1>
            <p className="mt-2 text-sm text-white/60 dark:text-white/60 light:text-gray-600">Kullanıcı rolleri ve yetkilerini yönetin</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="px-6 py-4 border-b border-primary-300/20 dark:border-primary-300/20 light:border-primary-300/30">
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">Kullanıcılar ve Rolleri</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-300/10 bg-transparent">
              <thead className="bg-dark-input/50 dark:bg-dark-input/50 light:bg-gray-50">
                <tr>
                  <th className="table-header">
                    Kullanıcı
                  </th>
                  <th className="table-header">
                    Mevcut Roller
                  </th>
                  <th className="table-header">
                    Kayıt Tarihi
                  </th>
                  <th className="table-header">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-300/10 bg-transparent">
                {users?.data && Array.isArray(users.data) ? users.data.map((user: User) => (
                  <tr key={user.username} className="hover:bg-primary-300/5 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-300/30 to-accent-light/30 flex items-center justify-center border border-primary-300/30">
                            <UserGroupIcon className="h-6 w-6 text-primary-300 dark:text-primary-300 light:text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
                            {user.full_name || user.username}
                          </div>
                          <div className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {user.roles?.map((role) => {
                          const roleColorMap: Record<string, string> = {
                            blue: 'bg-primary-300/20 dark:bg-primary-300/20 light:bg-blue-50 text-primary-300 dark:text-primary-300 light:text-blue-700 border-primary-300/40',
                            green: 'bg-green-500/20 dark:bg-green-500/20 light:bg-green-50 text-green-400 dark:text-green-400 light:text-green-700 border-green-500/40',
                            red: 'bg-red-500/20 dark:bg-red-500/20 light:bg-red-50 text-red-400 dark:text-red-400 light:text-red-700 border-red-500/40',
                          };
                          return (
                            <span
                              key={role}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${roleColorMap[getRoleColor(role)]}`}
                            >
                              {getRoleLabel(role)}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 dark:text-white/70 light:text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-accent-light transition-colors"
                      >
                        Rol Ata
                      </button>
                    </td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Assignment Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border border-primary-300/30 w-96 shadow-2xl rounded-2xl bg-gradient-to-br from-dark-card to-dark-input">
              <div className="mt-3">
                <h3 className="text-xl font-bold text-white mb-6">
                  Rol Ata: <span className="gradient-text">{selectedUser.username}</span>
                </h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-3">
                    Yeni Rol
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Rol seçin</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value} className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setNewRole('');
                    }}
                    className="btn-secondary"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAssignRole}
                    disabled={!newRole || isAssigning}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isAssigning ? 'Atanıyor...' : 'Rol Ata'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default RoleManagement;
