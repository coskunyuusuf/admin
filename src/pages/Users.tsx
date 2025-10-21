import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import UserTable from '../components/Users/UserTable';
import UserModal from '../components/Users/UserModal';
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  roles: string[];
  created_at: string;
}

const Users: React.FC = () => {
  const { isAdmin } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleViewUser = (user: User): void => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User): void => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: User): void => {
    if (window.confirm(`${user.full_name} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      console.log('Delete user:', user);
    }
  };

  const handleAddUser = (): void => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center">
              <UserGroupIcon className="w-8 h-8 mr-3 text-primary-300 dark:text-primary-300 light:text-primary-600" />
              Kullanıcı Yönetimi
            </h1>
            <p className="mt-2 text-sm text-white/60 dark:text-white/60 light:text-gray-600">
              Sistem kullanıcılarını yönetin ve rollerini düzenleyin
            </p>
          </div>
          <button
            onClick={handleAddUser}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Kullanıcı
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6 h-[100px] flex items-center hover:shadow-lg hover:shadow-primary-300/20 transition-all">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-300/20 border border-primary-300/40 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-primary-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-white/60 dark:text-white/60 light:text-gray-600 uppercase">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="card p-6 h-[100px] flex items-center hover:shadow-lg hover:shadow-accent-light/20 transition-all">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/40 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-white/60 dark:text-white/60 light:text-gray-600 uppercase">Aktif Öğrenciler</p>
                <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900">1,156</p>
              </div>
            </div>
          </div>

          <div className="card p-6 h-[100px] flex items-center hover:shadow-lg hover:shadow-accent-light/20 transition-all">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent-light/20 border border-accent-light/40 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-accent-light dark:text-accent-light light:text-pink-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-white/60 dark:text-white/60 light:text-gray-600 uppercase">Eğitmenler</p>
                <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900">78</p>
              </div>
            </div>
          </div>

          <div className="card p-6 h-[100px] flex items-center hover:shadow-lg hover:shadow-primary-300/20 transition-all">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-300/20 border border-primary-300/40 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-primary-300 dark:text-primary-300 light:text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-white/60 dark:text-white/60 light:text-gray-600 uppercase">Adminler</p>
                <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900">13</p>
              </div>
            </div>
          </div>
        </div>

        <UserTable
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onAddUser={handleAddUser}
        />

        <UserModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          user={selectedUser}
          mode={modalMode}
        />
      </div>
    </ProtectedRoute>
  );
};

export default Users;
