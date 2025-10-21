import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { pointsAPI } from '../services/api';
import toast from 'react-hot-toast';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import {
  TrophyIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface UserPoints {
  username: string;
  full_name: string;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
}

const PointsManagement: React.FC = () => {
  const { isAdmin, isInstructor } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserPoints | null>(null);
  const [pointsAmount, setPointsAmount] = useState<string>('');
  const [pointsReason, setPointsReason] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: allUsersPoints, isLoading } = useQuery(
    'all-users-points',
    () => pointsAPI.getAllUsersPoints(),
    {
      enabled: isAdmin() || isInstructor(),
    }
  );

  const [isAddingPoints, setIsAddingPoints] = useState(false);
  const [isResettingPoints, setIsResettingPoints] = useState(false);

  const handleAddPoints = async (): Promise<void> => {
    if (selectedUser && pointsAmount && pointsReason) {
      setIsAddingPoints(true);
      try {
        await pointsAPI.addManualPoints({
          username: selectedUser.username,
          points: parseInt(pointsAmount),
          reason: pointsReason,
        });
        toast.success('Puan başarıyla eklendi');
        queryClient.invalidateQueries('all-users-points');
        setSelectedUser(null);
        setPointsAmount('');
        setPointsReason('');
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Puan eklenirken bir hata oluştu. Lütfen tekrar deneyin.';
        toast.error(errorMessage);
      } finally {
        setIsAddingPoints(false);
      }
    }
  };

  const handleResetPoints = async (username: string): Promise<void> => {
    setIsResettingPoints(true);
    try {
      await pointsAPI.resetPoints({ username });
      toast.success('Puanlar başarıyla sıfırlandı');
      queryClient.invalidateQueries('all-users-points');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Puanlar sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.';
      toast.error(errorMessage);
    } finally {
      setIsResettingPoints(false);
    }
  };


  const handleResetPointsClick = (user: UserPoints): void => {
    if (window.confirm(`${user.username} kullanıcısının tüm puanlarını sıfırlamak istediğinizden emin misiniz?`)) {
      handleResetPoints(user.username);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Puan Yönetimi</h1>
            <p className="mt-2 text-sm text-white/60 dark:text-white/60 light:text-gray-600">Kullanıcı puanlarını yönetin ve manuel puan ekleyin</p>
          </div>
          <button
            onClick={() => setSelectedUser({} as UserPoints)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Manuel Puan Ekle
          </button>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="px-6 py-4 border-b border-primary-300/20 dark:border-primary-300/20 light:border-primary-300/30">
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">Kullanıcı Puanları</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-300/10 bg-transparent">
              <thead className="bg-dark-input/50 dark:bg-dark-input/50 light:bg-gray-50">
                <tr>
                  <th className="table-header">
                    Sıra
                  </th>
                  <th className="table-header">
                    Kullanıcı
                  </th>
                  <th className="table-header">
                    Toplam Puan
                  </th>
                  <th className="table-header">
                    Bu Hafta
                  </th>
                  <th className="table-header">
                    Bu Ay
                  </th>
                  <th className="table-header">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-300/10 bg-transparent">
                {allUsersPoints?.data && Array.isArray(allUsersPoints.data) ? allUsersPoints.data.map((user: UserPoints, index: number) => (
                  <tr key={user.username} className="hover:bg-primary-300/5 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index < 3 ? (
                          <TrophyIcon className={`w-6 h-6 ${
                            index === 0 ? 'text-yellow-400 dark:text-yellow-400 light:text-yellow-600' : 
                            index === 1 ? 'text-gray-300 dark:text-gray-300 light:text-gray-500' : 
                            'text-orange-400 dark:text-orange-400 light:text-orange-600'
                          }`} />
                        ) : (
                          <span className="text-sm font-medium text-white/60 dark:text-white/60 light:text-gray-500">#{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-300/30 to-accent-light/30 flex items-center justify-center border border-primary-300/30">
                            <span className="text-sm font-bold text-primary-300 dark:text-primary-300 light:text-primary-600">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
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
                      <div className="text-sm font-bold text-white dark:text-white light:text-gray-900">{user.total_points || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white/90 dark:text-white/90 light:text-gray-800">{user.weekly_points || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white/90 dark:text-white/90 light:text-gray-800">{user.monthly_points || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-accent-light transition-colors"
                      >
                        Puan Ekle
                      </button>
                      <button
                        onClick={() => handleResetPointsClick(user)}
                        className="text-red-400 dark:text-red-400 light:text-red-600 hover:text-red-300 dark:hover:text-red-300 light:hover:text-red-500 transition-colors"
                      >
                        Sıfırla
                      </button>
                    </td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Points Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border border-primary-300/30 w-96 shadow-2xl rounded-2xl bg-gradient-to-br from-dark-card to-dark-input">
              <div className="mt-3">
                <h3 className="text-xl font-bold gradient-text mb-6">
                  Manuel Puan Ekle
                </h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white/70 mb-3">
                    Kullanıcı
                  </label>
                  <input
                    type="text"
                    value={selectedUser.username || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                    placeholder="Kullanıcı adı"
                    className="input-field w-full"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white/70 mb-3">
                    Puan Miktarı
                  </label>
                  <input
                    type="number"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(e.target.value)}
                    placeholder="Puan miktarı"
                    className="input-field w-full"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white/70 mb-3">
                    Sebep
                  </label>
                  <textarea
                    value={pointsReason}
                    onChange={(e) => setPointsReason(e.target.value)}
                    placeholder="Puan ekleme sebebi"
                    rows={3}
                    className="input-field w-full"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setPointsAmount('');
                      setPointsReason('');
                    }}
                    className="btn-secondary"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddPoints}
                    disabled={!selectedUser.username || !pointsAmount || !pointsReason || isAddingPoints}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isAddingPoints ? 'Ekleniyor...' : 'Puan Ekle'}
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

export default PointsManagement;
