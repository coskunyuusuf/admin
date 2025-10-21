import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { badgesAPI } from '../services/api';
import toast from 'react-hot-toast';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import {
  StarIcon,
  TrophyIcon,
  PlusIcon,
  CheckBadgeIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  awarded_count?: number;
}

interface User {
  username: string;
  full_name: string;
}

interface BadgeCategory {
  name: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BadgeManagement: React.FC = () => {
  const { isAdmin, isInstructor } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: badgeCatalog, isLoading: catalogLoading } = useQuery(
    'badge-catalog',
    () => badgesAPI.getCatalog(),
    {
      enabled: isAdmin() || isInstructor(),
    }
  );

  const { data: allUsers, isLoading: usersLoading } = useQuery(
    'all-users',
    () => badgesAPI.getAllUsers(),
    {
      enabled: isAdmin() || isInstructor(),
    }
  );

  const [isAwarding, setIsAwarding] = useState(false);

  const handleAwardBadge = async (): Promise<void> => {
    if (selectedUser && selectedBadge) {
      setIsAwarding(true);
      try {
        await badgesAPI.awardBadge(selectedUser.username, selectedBadge);
        toast.success('Badge başarıyla verildi');
        setSelectedUser(null);
        setSelectedBadge('');
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Badge verilirken bir hata oluştu. Lütfen tekrar deneyin.';
        toast.error(errorMessage);
      } finally {
        setIsAwarding(false);
      }
    }
  };


  const badgeCategories: Record<string, BadgeCategory> = {
    exploration: { name: 'Keşif', color: 'blue', icon: StarIcon },
    achievement: { name: 'Başarı', color: 'green', icon: TrophyIcon },
    performance: { name: 'Performans', color: 'purple', icon: CheckBadgeIcon },
    special: { name: 'Özel', color: 'red', icon: FireIcon },
  };

  const getBadgeColor = (category: string): string => {
    return badgeCategories[category]?.color || 'gray';
  };

  const getBadgeIcon = (category: string): React.ComponentType<{ className?: string }> => {
    return badgeCategories[category]?.icon || StarIcon;
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">{/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Badge Yönetimi</h1>
            <p className="mt-2 text-sm text-white/60 dark:text-white/60 light:text-gray-600">Badge'leri yönetin ve kullanıcılara verin</p>
          </div>
          <button
            onClick={() => setSelectedUser({} as User)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Badge Ver
          </button>
        </div>

        {/* Badge Catalog */}
        <div className="card">
          <div className="px-6 py-4 border-b border-primary-300/20 dark:border-primary-300/20 light:border-primary-300/30">
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">Mevcut Badge'ler</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badgeCatalog?.data && Array.isArray(badgeCatalog.data) ? badgeCatalog.data.map((badge: Badge) => {
                const IconComponent = getBadgeIcon(badge.category);
                const badgeColorMap: Record<string, { bg: string; iconBg: string; icon: string; border: string }> = {
                  blue: { bg: 'bg-primary-300/10', iconBg: 'bg-primary-300/20', icon: 'text-primary-300', border: 'border-primary-300/40' },
                  green: { bg: 'bg-green-500/10', iconBg: 'bg-green-500/20', icon: 'text-green-400', border: 'border-green-500/40' },
                  purple: { bg: 'bg-accent-light/10', iconBg: 'bg-accent-light/20', icon: 'text-accent-light', border: 'border-accent-light/40' },
                  red: { bg: 'bg-red-500/10', iconBg: 'bg-red-500/20', icon: 'text-red-400', border: 'border-red-500/40' },
                };
                const colors = badgeColorMap[getBadgeColor(badge.category)] || badgeColorMap.blue;
                
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg} hover:scale-105 transition-all duration-300`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                        <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white dark:text-white light:text-gray-900">{badge.name}</h4>
                        <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-600">{badge.description}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${colors.bg} ${colors.icon}`}>
                          {badgeCategories[badge.category]?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }) : null}
            </div>
          </div>
        </div>

        {/* Badge Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 h-[110px] flex items-center hover:shadow-lg hover:shadow-primary-300/20 transition-all">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-primary-300/20 border border-primary-300/40">
                <StarIcon className="w-6 h-6 text-primary-300 dark:text-primary-300 light:text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-white/60 dark:text-white/60 light:text-gray-600 uppercase">Toplam Badge</p>
                <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-1">{badgeCatalog?.data?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 h-[110px] flex items-center hover:shadow-lg hover:shadow-green-500/20 transition-all">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/40">
                <TrophyIcon className="w-6 h-6 text-green-400 dark:text-green-400 light:text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-white/60 dark:text-white/60 light:text-gray-600 uppercase">Verilen Badge</p>
                <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-1">
                  {Array.isArray(badgeCatalog?.data) 
                    ? badgeCatalog.data.reduce((sum: number, badge: Badge) => sum + (badge.awarded_count || 0), 0)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 h-[110px] flex items-center hover:shadow-lg hover:shadow-accent-light/20 transition-all">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-accent-light/20 border border-accent-light/40">
                <CheckBadgeIcon className="w-6 h-6 text-accent-light dark:text-accent-light light:text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-white/60 dark:text-white/60 light:text-gray-600 uppercase">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-1">{allUsers?.data?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Award Badge Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border border-primary-300/30 w-96 shadow-2xl rounded-2xl bg-gradient-to-br from-dark-card to-dark-input">
              <div className="mt-3">
                <h3 className="text-xl font-bold gradient-text mb-6">
                  Badge Ver
                </h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-3">
                    Kullanıcı
                  </label>
                  <select
                    value={selectedUser?.username || ''}
                    onChange={(e) => setSelectedUser({ username: e.target.value } as User)}
                    className="input-field w-full"
                  >
                    <option value="" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Kullanıcı seçin</option>
                    {allUsers?.data && Array.isArray(allUsers.data) ? allUsers.data.map((user: User) => (
                      <option key={user.username} value={user.username} className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">
                        {user.full_name || user.username}
                      </option>
                    )) : null}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-3">
                    Badge
                  </label>
                  <select
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Badge seçin</option>
                    {badgeCatalog?.data && Array.isArray(badgeCatalog.data) ? badgeCatalog.data.map((badge: Badge) => (
                      <option key={badge.id} value={badge.id} className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">
                        {badge.name} - {badge.description}
                      </option>
                    )) : null}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setSelectedBadge('');
                    }}
                    className="btn-secondary"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAwardBadge}
                    disabled={!selectedUser.username || !selectedBadge || isAwarding}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isAwarding ? 'Veriliyor...' : 'Badge Ver'}
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

export default BadgeManagement;
