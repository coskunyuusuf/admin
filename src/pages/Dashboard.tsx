import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { dashboardAPI, announcementAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentActivity from '../components/Dashboard/RecentActivity';
import toast from 'react-hot-toast';
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  ClockIcon,
  ChartBarIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  PlusIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface WeeklyProgressData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }>;
}

interface UserDistributionData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }>;
}

interface ActivityData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user, isAdmin, isInstructor } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementCourse, setAnnouncementCourse] = useState('');
  const [announcementEndDate, setAnnouncementEndDate] = useState('');

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'dashboard-overview',
    () => dashboardAPI.getOverview(),
    {
      refetchInterval: 30000,
    }
  );

  const { data: recentActivities } = useQuery(
    'recent-activities',
    () => dashboardAPI.getRecentActivities(10),
  );

  const { data: recentAnnouncements, refetch: refetchAnnouncements } = useQuery(
    'recent-announcements',
    () => announcementAPI.getAll(),
  );

  const announcementsList = Array.isArray(recentAnnouncements?.data)
    ? recentAnnouncements.data
    : (recentAnnouncements?.data?.data || []);

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle || !announcementContent) {
      toast.error('Başlık ve içerik gerekli!');
      return;
    }

    try {
      await announcementAPI.create({
        title: announcementTitle,
        content: announcementContent,
        course_id: announcementCourse || null,
        end_date: announcementEndDate || null,
      });
      toast.success('Duyuru başarıyla oluşturuldu!');
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setAnnouncementCourse('');
      setAnnouncementEndDate('');
      setShowAnnouncementModal(false);
      refetchAnnouncements();
    } catch (error) {
      toast.error('Duyuru oluşturulurken hata oluştu!');
    }
  };

  const weeklyProgressData: WeeklyProgressData = {
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    datasets: [
      {
        label: 'Çalışma Süresi (saat)',
        data: [2, 3, 1.5, 4, 2.5, 1, 0.5],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const userDistributionData: UserDistributionData = {
    labels: ['Öğrenciler', 'Eğitmenler', 'Adminler'],
    datasets: [
      {
        data: [150, 25, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const activityData: ActivityData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    datasets: [
      {
        label: 'Not Oluşturma',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Quiz Çözme',
        data: [2, 3, 20, 5, 1, 4],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Sohbet',
        data: [3, 10, 13, 15, 22, 30],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
    ],
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = dashboardData?.data?.stats || {};
  const points = dashboardData?.data?.points || {};

  return (
    <div className="space-y-6">{/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Hoş geldiniz, {user?.username}!
          </h1>
          <p className="mt-2 text-sm text-white/60 dark:text-white/60 light:text-gray-600">
            {isAdmin() ? 'Sistem Yöneticisi' : isInstructor() ? 'Eğitmen' : 'Öğrenci'} Dashboard'u
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-40"
          >
            <option value="week" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Bu Hafta</option>
            <option value="month" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Bu Ay</option>
            <option value="year" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Bu Yıl</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Toplam Çalışma Süresi"
          value={stats.study_time?.total || '0 saat'}
          change={stats.study_time?.week_change}
          changeType="positive"
          icon={ClockIcon}
          color="primary"
        />
        <StatsCard
          title="Çözülen Quizler"
          value={stats.quizzes?.total || 0}
          change={stats.quizzes?.week_change}
          changeType="positive"
          icon={ChartBarIcon}
          color="accent"
        />
        <StatsCard
          title="Kazanılan Rozetler"
          value={stats.badges?.total || 0}
          change={stats.badges?.week_change}
          changeType="positive"
          icon={TrophyIcon}
          color="primary"
        />
        <StatsCard
          title="Toplam Puan"
          value={points.total || 0}
          change={`${points.current_week || 0} bu hafta`}
          changeType="positive"
          icon={ChartBarIcon}
          color="accent"
        />
      </div>

      {/* Duyuru Yönetimi Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Announcement Card */}
        {(isAdmin() || isInstructor()) && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                Duyurular
              </h3>
              <MegaphoneIcon className="w-6 h-6 text-primary-300 dark:text-primary-300 light:text-primary-600" />
            </div>
            <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600 mb-4">
              Öğrencilere duyuru gönderin
            </p>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="w-full btn-primary flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Yeni Duyuru Oluştur
            </button>
          </div>
        )}

        {/* Recent Announcements */}
        <div className={(isAdmin() || isInstructor()) ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4">
              Son Duyurular
            </h3>
            <div className="space-y-3 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {announcementsList.map((announcement: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50 rounded-xl border border-primary-300/20 dark:border-primary-300/20 light:border-gray-200 hover:border-primary-300/40 dark:hover:border-primary-300/40 light:hover:border-primary-400 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white dark:text-white light:text-gray-900 mb-1">
                        {announcement.title}
                      </h4>
                      <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-white/40 dark:text-white/40 light:text-gray-500 mt-2">
                        {new Date(announcement.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <MegaphoneIcon className="w-5 h-5 text-primary-300 dark:text-primary-300 light:text-primary-600 ml-3" />
                  </div>
                </div>
              ))}
              {announcementsList.length === 0 && (
                <p className="text-sm text-white/40 dark:text-white/40 light:text-gray-500 text-center py-8">
                  Henüz duyuru bulunmuyor
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <RecentActivity activities={recentActivities?.data || []} />

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAnnouncementModal(false)} />
            <div className="relative card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
                Yeni Duyuru Oluştur
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="input-field w-full"
                    placeholder="Duyuru başlığı..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                    İçerik *
                  </label>
                  <textarea
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    className="input-field w-full"
                    rows={4}
                    placeholder="Duyuru içeriği..."
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Ders/Kurs Kodu
                    </label>
                    <input
                      type="text"
                      value={announcementCourse}
                      onChange={(e) => setAnnouncementCourse(e.target.value)}
                      className="input-field w-full"
                      placeholder="Örn: PY101, MATH201"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={announcementEndDate}
                      onChange={(e) => setAnnouncementEndDate(e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateAnnouncement}
                    className="flex-1 btn-primary"
                  >
                    Oluştur
                  </button>
                  <button
                    onClick={() => setShowAnnouncementModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
