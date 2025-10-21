import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { statsAPI } from '../services/api';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  ServerIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

interface StatsCard {
  title: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const SystemStats: React.FC = () => {
  const { isAdmin, isInstructor } = useAuth();

  const { data: systemStats, isLoading } = useQuery(
    'system-stats',
    () => statsAPI.getSystemStats(),
    {
      enabled: isAdmin() || isInstructor(),
      refetchInterval: 30000, // 30 saniyede bir yenile
    }
  );

  const { data: apiStats } = useQuery(
    'api-stats',
    () => statsAPI.getAPIStats(),
    {
      enabled: isAdmin() || isInstructor(),
    }
  );

  const statsCards: StatsCard[] = [
    {
      title: 'Toplam Kullanıcılar',
      value: systemStats?.data?.total_users || 0,
      change: systemStats?.data?.users_this_week || 0,
      changeType: 'positive',
      icon: UsersIcon,
      color: 'blue',
    },
    {
      title: 'Aktif Oturumlar',
      value: systemStats?.data?.active_sessions || 0,
      change: systemStats?.data?.sessions_today || 0,
      changeType: 'positive',
      icon: ClockIcon,
      color: 'green',
    },
    {
      title: 'Toplam Sorular',
      value: systemStats?.data?.total_questions || 0,
      change: systemStats?.data?.questions_this_week || 0,
      changeType: 'positive',
      icon: DocumentTextIcon,
      color: 'purple',
    },
    {
      title: 'API İstekleri',
      value: apiStats?.data?.total_requests || 0,
      change: apiStats?.data?.requests_today || 0,
      changeType: 'positive',
      icon: ServerIcon,
      color: 'orange',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6">{/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Sistem İstatistikleri</h1>
            <p className="mt-2 text-sm text-white/60 dark:text-white/60 light:text-gray-600">Sistem performansı ve kullanım istatistikleri</p>
          </div>
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="w-6 h-6 text-primary-300 dark:text-primary-300 light:text-primary-600" />
            <span className="text-sm text-white/70 dark:text-white/70 light:text-gray-600">Canlı Veri</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const iconColorMap: Record<string, { icon: string; bg: string; border: string }> = {
              blue: { 
                icon: 'text-primary-300 dark:text-primary-300 light:text-primary-600', 
                bg: 'bg-primary-300/20', 
                border: 'border-primary-300/40' 
              },
              green: { 
                icon: 'text-green-400 dark:text-green-400 light:text-green-600', 
                bg: 'bg-green-500/20', 
                border: 'border-green-500/40' 
              },
              purple: { 
                icon: 'text-accent-light dark:text-accent-light light:text-pink-600', 
                bg: 'bg-accent-light/20', 
                border: 'border-accent-light/40' 
              },
              orange: { 
                icon: 'text-primary-300 dark:text-primary-300 light:text-primary-600', 
                bg: 'bg-primary-300/20', 
                border: 'border-primary-300/40' 
              },
            };
            const colors = iconColorMap[stat.color];
            
            return (
              <div key={index} className="card p-6 min-h-[140px] flex items-center hover:shadow-lg hover:shadow-primary-300/20 transition-all">
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                      <stat.icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/60 dark:text-white/60 light:text-gray-600 uppercase truncate">{stat.title}</p>
                    <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-1">{stat.value}</p>
                    {stat.change !== undefined && (
                      <p className={`text-xs font-semibold mt-1 ${
                        stat.changeType === 'positive' ? 'text-green-400 dark:text-green-400 light:text-green-600' : 'text-red-400 dark:text-red-400 light:text-red-600'
                      }`}>
                        {stat.change > 0 ? '+' : ''}{stat.change} bu hafta
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Performance */}
          <div className="card p-6 min-h-[280px] flex flex-col">
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-6 flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-primary-300/20 rounded-lg flex items-center justify-center mr-3">
                <ServerIcon className="w-5 h-5 text-primary-300 dark:text-primary-300 light:text-primary-600" />
              </div>
              API Performansı
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center p-3 bg-white/5 dark:bg-white/5 light:bg-primary-50 rounded-lg">
                <span className="text-sm text-white/70 dark:text-white/70 light:text-gray-700">Ortalama Yanıt Süresi</span>
                <span className="text-sm font-bold text-primary-300 dark:text-primary-300 light:text-primary-600">{apiStats?.data?.avg_response_time || '0'}ms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 dark:bg-white/5 light:bg-red-50 rounded-lg">
                <span className="text-sm text-white/70 dark:text-white/70 light:text-gray-700">Hata Oranı</span>
                <span className="text-sm font-bold text-red-400 dark:text-red-400 light:text-red-600">{apiStats?.data?.error_rate || '0'}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 dark:bg-white/5 light:bg-green-50 rounded-lg">
                <span className="text-sm text-white/70 dark:text-white/70 light:text-gray-700">Başarılı İstekler</span>
                <span className="text-sm font-bold text-green-400 dark:text-green-400 light:text-green-600">{apiStats?.data?.success_rate || '0'}%</span>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="card p-6 min-h-[280px] flex flex-col">
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-6 flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-accent-light/20 rounded-lg flex items-center justify-center mr-3">
                <UsersIcon className="w-5 h-5 text-accent-light dark:text-accent-light light:text-pink-600" />
              </div>
              Kullanıcı Aktivitesi
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center p-3 bg-white/5 dark:bg-white/5 light:bg-primary-50 rounded-lg">
                <span className="text-sm text-white/70 dark:text-white/70 light:text-gray-700">Bugün Aktif</span>
                <span className="text-sm font-bold text-white dark:text-white light:text-gray-900">{systemStats?.data?.users_active_today || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 dark:bg-white/5 light:bg-primary-50 rounded-lg">
                <span className="text-sm text-white/70 dark:text-white/70 light:text-gray-700">Bu Hafta Aktif</span>
                <span className="text-sm font-bold text-white dark:text-white light:text-gray-900">{systemStats?.data?.users_active_week || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 dark:bg-white/5 light:bg-primary-50 rounded-lg">
                <span className="text-sm text-white/70 dark:text-white/70 light:text-gray-700">Yeni Kayıtlar</span>
                <span className="text-sm font-bold text-white dark:text-white light:text-gray-900">{systemStats?.data?.new_registrations || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-6 flex items-center">
            <div className="w-8 h-8 bg-primary-300/20 rounded-lg flex items-center justify-center mr-3">
              <CpuChipIcon className="w-5 h-5 text-primary-300 dark:text-primary-300 light:text-primary-600" />
            </div>
            Sistem Durumu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white/5 dark:bg-white/5 light:bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-500/50"></div>
              <span className="text-sm text-white dark:text-white light:text-gray-900 font-medium">API Sunucusu</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 dark:bg-white/5 light:bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-500/50"></div>
              <span className="text-sm text-white dark:text-white light:text-gray-900 font-medium">Veritabanı</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 dark:bg-white/5 light:bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-500/50"></div>
              <span className="text-sm text-white dark:text-white light:text-gray-900 font-medium">AI Servisi</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SystemStats;
