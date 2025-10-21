import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { authAPI } from '../../services/api';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  EyeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const UserTable = ({ onEditUser, onDeleteUser, onViewUser, onAddUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: users, isLoading } = useQuery(
    ['users'],
    () => authAPI.getAllUsers()
  );

  const userList = Array.isArray(users?.data) ? users.data : (users?.data?.data || []);

  const filteredUsers = userList.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roles?.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRoleBadgeColor = (roles) => {
    if (roles.includes('admin')) return 'bg-red-500/20 dark:bg-red-500/20 light:bg-red-50 text-red-400 dark:text-red-400 light:text-red-700 border border-red-500/30';
    if (roles.includes('instructor')) return 'bg-primary-300/20 dark:bg-primary-300/20 light:bg-blue-50 text-primary-300 dark:text-primary-300 light:text-blue-700 border border-primary-300/30';
    if (roles.includes('student')) return 'bg-green-500/20 dark:bg-green-500/20 light:bg-green-50 text-green-400 dark:text-green-400 light:text-green-700 border border-green-500/30';
    return 'bg-white/20 dark:bg-white/20 light:bg-gray-50 text-white/70 dark:text-white/70 light:text-gray-700 border border-white/30';
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 dark:bg-green-500/20 light:bg-green-50 text-green-400 dark:text-green-400 light:text-green-700 border border-green-500/30';
      case 'inactive': return 'bg-white/20 dark:bg-white/20 light:bg-gray-50 text-white/70 dark:text-white/70 light:text-gray-700 border border-white/30';
      case 'suspended': return 'bg-red-500/20 dark:bg-red-500/20 light:bg-red-50 text-red-400 dark:text-red-400 light:text-red-700 border border-red-500/30';
      default: return 'bg-white/20 dark:bg-white/20 light:bg-gray-50 text-white/70 dark:text-white/70 light:text-gray-700 border border-white/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-300"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-white/40 dark:text-white/40 light:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Tüm Roller</option>
            <option value="admin">Admin</option>
            <option value="instructor">Eğitmen</option>
            <option value="student">Öğrenci</option>
          </select>
          
          <button
            onClick={onAddUser}
            className="btn-primary flex items-center"
          >
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Yeni Kullanıcı
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary-300/10 bg-transparent">
            <thead className="bg-dark-input/50 dark:bg-dark-input/50 light:bg-gray-50">
              <tr>
                <th className="table-header">Kullanıcı</th>
                <th className="table-header">Rol</th>
                <th className="table-header">Durum</th>
                <th className="table-header">Rozetler</th>
                <th className="table-header">Puanlar</th>
                <th className="table-header">Son Giriş</th>
                <th className="table-header">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-300/10 dark:divide-primary-300/10 light:divide-gray-200 bg-transparent">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-primary-300/5 dark:hover:bg-primary-300/5 light:hover:bg-primary-50 transition-all">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-300/30 to-accent-light/30 flex items-center justify-center border border-primary-300/30">
                          <span className="text-sm font-bold text-primary-300 dark:text-primary-300 light:text-primary-600">
                            {user.full_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                          @{user.username}
                        </div>
                        <div className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.roles)}`}>
                      {user.roles.join(', ')}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium text-white dark:text-white light:text-gray-900">{user.badges}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium text-white dark:text-white light:text-gray-900">{user.points}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-white/70 dark:text-white/70 light:text-gray-600">
                      {new Date(user.last_login).toLocaleDateString('tr-TR')}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewUser(user)}
                        className="text-white/60 dark:text-white/60 light:text-gray-500 hover:text-primary-300 dark:hover:text-primary-300 light:hover:text-primary-600 transition-colors"
                        title="Görüntüle"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditUser(user)}
                        className="text-white/60 dark:text-white/60 light:text-gray-500 hover:text-primary-300 dark:hover:text-primary-300 light:hover:text-primary-600 transition-colors"
                        title="Düzenle"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteUser(user)}
                        className="text-white/60 dark:text-white/60 light:text-gray-500 hover:text-red-400 dark:hover:text-red-400 light:hover:text-red-600 transition-colors"
                        title="Sil"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-dark-card/50 dark:bg-dark-card/50 light:bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-primary-300/20 dark:border-primary-300/20 light:border-primary-300/30 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Önceki
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/70 dark:text-white/70 light:text-gray-700">
                  <span className="font-semibold">{startIndex + 1}</span>
                  {' '}-
                  {' '}<span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span>
                  {' '}arası, toplam{' '}
                  <span className="font-semibold">{filteredUsers.length}</span> sonuç
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm space-x-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Önceki
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-primary-300/20 to-accent-light/20 dark:from-primary-300/20 dark:to-accent-light/20 light:from-primary-100 light:to-primary-50 border border-primary-300/40 text-primary-300 dark:text-primary-300 light:text-primary-700'
                            : 'bg-dark-card dark:bg-dark-card light:bg-white border border-primary-300/20 dark:border-primary-300/20 light:border-gray-300 text-white/70 dark:text-white/70 light:text-gray-700 hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-primary-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Sonraki
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;


