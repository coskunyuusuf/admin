import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { Profile, PreferencesForm } from '../types';
import toast from 'react-hot-toast';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import {
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';


interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProfileSettingsProps {
  profile?: Profile;
  onSubmit: (data: Profile) => void;
  isLoading: boolean;
}

interface PreferencesSettingsProps {
  preferences?: PreferencesForm;
  onSubmit: (data: PreferencesForm) => void;
  isLoading: boolean;
}

interface SecuritySettingsProps {
  onSubmit: (data: { current_password: string; new_password: string; confirm_password: string }) => void;
  isLoading: boolean;
}

const Settings: React.FC = () => {
  const { user, isAdmin, isInstructor } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const queryClient = useQueryClient();

  const { data: profile } = useQuery('user-profile', () => profileAPI.getMyProfile());
  const { data: preferences } = useQuery('user-preferences', () => profileAPI.getPreferences());

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (data: any) => {
    setIsUpdating(true);
    try {
      await profileAPI.updateMyProfile(data);
      queryClient.invalidateQueries('user-profile');
      toast.success('Profil başarıyla güncellendi');
    } catch (error) {
      toast.error('Profil güncellenirken hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePreferences = async (data: any) => {
    setIsUpdating(true);
    try {
      await profileAPI.updatePreferences(data);
      queryClient.invalidateQueries('user-preferences');
      toast.success('Tercihler başarıyla güncellendi');
    } catch (error) {
      toast.error('Tercihler güncellenirken hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (data: any) => {
    setIsUpdating(true);
    try {
      await profileAPI.changePassword(data);
      toast.success('Şifre başarıyla değiştirildi');
    } catch (error) {
      toast.error('Şifre değiştirilirken hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs: Tab[] = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'preferences', name: 'Tercihler', icon: CogIcon },
    { id: 'notifications', name: 'Bildirimler', icon: BellIcon },
    { id: 'security', name: 'Güvenlik', icon: ShieldCheckIcon },
  ];

  if (isAdmin() || isInstructor()) {
    tabs.push(
      { id: 'system', name: 'Sistem', icon: ServerIcon },
      { id: 'database', name: 'Veritabanı', icon: CircleStackIcon }
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 flex items-center">
            <CogIcon className="w-8 h-8 mr-3 text-primary-300 dark:text-primary-300 light:text-primary-600" />
            Ayarlar
          </h1>
          <p className="mt-1 text-sm text-white/60 dark:text-white/60 light:text-gray-600">
            Hesap ayarlarınızı ve sistem tercihlerinizi yönetin
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1 card p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-300/20 to-accent-light/20 dark:from-primary-300/20 dark:to-accent-light/20 light:from-primary-100 light:to-pink-100 text-primary-300 dark:text-primary-300 light:text-primary-700 border border-primary-300/40 dark:border-primary-300/40 light:border-primary-400'
                        : 'text-white/70 dark:text-white/70 light:text-gray-700 hover:text-primary-300 dark:hover:text-primary-300 light:hover:text-primary-600 hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="card p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <ProfileSettings 
                  profile={profile?.data} 
                  onSubmit={handleUpdateProfile}
                  isLoading={isUpdating}
                />
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <PreferencesSettings 
                  preferences={preferences?.data} 
                  onSubmit={handleUpdatePreferences}
                  isLoading={isUpdating}
                />
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <NotificationSettings />
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <SecuritySettings 
                  onSubmit={handleChangePassword}
                  isLoading={isUpdating}
                />
              )}

              {/* System Settings (Admin only) */}
              {activeTab === 'system' && isAdmin() && (
                <SystemSettings />
              )}

              {/* Database Settings (Admin only) */}
              {activeTab === 'database' && isAdmin() && (
                <DatabaseSettings />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Profile>({
    defaultValues: profile
  });

  return (
    <div>
      <h3 className="text-lg font-medium text-white dark:text-white light:text-gray-900 mb-6">Profil Bilgileri</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700">Ad Soyad</label>
            <input
              {...register('full_name', { required: 'Ad soyad gereklidir' })}
              type="text"
              className="input-field mt-1"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.full_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700">Email</label>
            <input
              {...register('email', {
                required: 'Email gereklidir',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Geçerli bir email adresi girin'
                }
              })}
              type="email"
              className="input-field mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700">Telefon</label>
            <input
              {...register('phone')}
              type="tel"
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700">Bölüm</label>
            <input
              {...register('department')}
              type="text"
              className="input-field mt-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700">Biyografi</label>
          <textarea
            {...register('bio')}
            rows={4}
            className="input-field mt-1"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({ preferences, onSubmit, isLoading }) => {
  const { theme, setTheme } = useTheme();
  const { register, handleSubmit } = useForm<PreferencesForm>({
    defaultValues: preferences
  });

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-white dark:text-white light:text-gray-900 mb-6">Tercihler</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tema Seçimi */}
        <div>
          <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700 mb-4">Tema Seçimi</label>
          <div className="grid grid-cols-2 gap-4">
            {/* Dark Theme */}
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-3 ${
                theme === 'dark'
                  ? 'border-primary-600 bg-primary-600/20 dark:border-primary-300 dark:bg-primary-300/10 light:border-primary-600 light:bg-primary-100'
                  : 'border-primary-300/20 dark:border-primary-300/20 light:border-gray-300 bg-white/5 dark:bg-white/5 light:bg-gray-50 hover:border-primary-300/40 dark:hover:border-primary-300/40 light:hover:border-primary-400'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-dark-card to-dark-input dark:from-dark-card dark:to-dark-input light:from-gray-700 light:to-gray-900 flex items-center justify-center border border-primary-300/30 dark:border-primary-300/30 light:border-gray-600">
                <svg className="w-6 h-6 text-primary-300 dark:text-primary-300 light:text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-white dark:text-white light:text-gray-900">Koyu Tema</p>
                <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-600">Gözleri rahatlatan</p>
              </div>
            </button>

            {/* Light Theme */}
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-3 ${
                theme === 'light'
                  ? 'border-primary-600 bg-primary-600/20 dark:border-primary-300 dark:bg-primary-300/10 light:border-primary-600 light:bg-primary-100'
                  : 'border-primary-300/20 dark:border-primary-300/20 light:border-gray-300 bg-white/5 dark:bg-white/5 light:bg-gray-50 hover:border-primary-300/40 dark:hover:border-primary-300/40 light:hover:border-primary-400'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-light-card dark:to-light-bg light:from-yellow-100 light:to-yellow-200 flex items-center justify-center border border-yellow-300 dark:border-primary-300/30 light:border-yellow-400">
                <svg className="w-6 h-6 text-yellow-600 dark:text-primary-600 light:text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414a1 1 0 00-1.414 1.414zM2.05 6.464l1.414-1.414a1 1 0 00-1.414-1.414L.636 5.05a1 1 0 001.414 1.414zm16.485-.05l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414a1 1 0 111.414-1.414zM10 18a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-white dark:text-white light:text-gray-900">Açık Tema</p>
                <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-600">Klasik ve net</p>
              </div>
            </button>
          </div>
        </div>

          {/* Dil Seçimi */}
          <div>
            <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700 mb-3">Dil</label>
            <select {...register('language')} className="input-field">
              <option value="tr" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Türkçe</option>
              <option value="en" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">English</option>
            </select>
          </div>

          {/* Saat Dilimi */}
          <div>
            <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700 mb-3">Saat Dilimi</label>
            <select {...register('timezone')} className="input-field">
              <option value="Europe/Istanbul" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Türkiye (GMT+3)</option>
              <option value="UTC" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">UTC (GMT+0)</option>
              <option value="America/New_York" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">New York (GMT-5)</option>
            </select>
          </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    messages: true,
    announcements: true,
    assignments: true,
    grades: true,
  });

  const handleToggle = (key: string): void => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-white dark:text-white light:text-gray-900 mb-6">Bildirim Ayarları</h3>
      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50 rounded-lg border border-transparent dark:border-transparent light:border-gray-200">
            <div>
              <h4 className="text-sm font-semibold text-white dark:text-white light:text-gray-900 capitalize">
                {key === 'email' ? 'Email Bildirimleri' :
                 key === 'push' ? 'Push Bildirimleri' :
                 key === 'messages' ? 'Mesaj Bildirimleri' :
                 key === 'announcements' ? 'Duyuru Bildirimleri' :
                 key === 'assignments' ? 'Ödev Bildirimleri' :
                 'Not Bildirimleri'}
              </h4>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                {key === 'email' ? 'Email ile bildirim al' :
                 key === 'push' ? 'Tarayıcı push bildirimleri' :
                 key === 'messages' ? 'Yeni mesaj geldiğinde bildir' :
                 key === 'announcements' ? 'Duyurular için bildirim' :
                 key === 'assignments' ? 'Ödev teslim tarihleri' :
                 'Not açıklandığında bildir'}
              </p>
            </div>
            <button
              onClick={() => handleToggle(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value 
                  ? 'bg-primary-300 dark:bg-primary-300 light:bg-primary-600' 
                  : 'bg-white/20 dark:bg-white/20 light:bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<{
    current_password: string;
    new_password: string;
    confirm_password: string;
  }>();
  const newPassword = watch('new_password');

  return (
    <div>
      <h3 className="text-lg font-medium text-white dark:text-white light:text-gray-900 mb-6">Güvenlik</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700">Mevcut Şifre</label>
          <input
            {...register('current_password', { required: 'Mevcut şifre gereklidir' })}
            type="password"
            className="input-field mt-1"
          />
          {errors.current_password && (
            <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.current_password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700">Yeni Şifre</label>
          <input
            {...register('new_password', {
              required: 'Yeni şifre gereklidir',
              minLength: { value: 4, message: 'Şifre en az 4 karakter olmalıdır' }
            })}
            type="password"
            className="input-field mt-1"
          />
          {errors.new_password && (
            <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.new_password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700">Şifre Tekrar</label>
          <input
            {...register('confirm_password', {
              required: 'Şifre tekrarı gereklidir',
              validate: value => value === newPassword || 'Şifreler eşleşmiyor'
            })}
            type="password"
            className="input-field mt-1"
          />
          {errors.confirm_password && (
            <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.confirm_password.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </button>
        </div>
      </form>
    </div>
  );
};

const SystemSettings: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState({
    maintenance_mode: false,
    registration_enabled: true,
    email_notifications: true,
    max_file_size: 50,
    session_timeout: 24,
  });

  return (
    <div>
      <h3 className="text-lg font-medium text-white dark:text-white light:text-gray-900 mb-6">Sistem Ayarları</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50 rounded-lg border border-transparent dark:border-transparent light:border-gray-200">
              <div>
                <h4 className="text-sm font-semibold text-white dark:text-white light:text-gray-900">Bakım Modu</h4>
                <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">Sistem bakımı için kullanıcı erişimini kısıtla</p>
              </div>
              <button
                onClick={() => setSystemSettings(prev => ({ ...prev, maintenance_mode: !prev.maintenance_mode }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.maintenance_mode 
                    ? 'bg-red-600 dark:bg-red-600 light:bg-red-600' 
                    : 'bg-white/20 dark:bg-white/20 light:bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50 rounded-lg border border-transparent dark:border-transparent light:border-gray-200">
              <div>
                <h4 className="text-sm font-semibold text-white dark:text-white light:text-gray-900">Kayıt Açık</h4>
                <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">Yeni kullanıcı kaydına izin ver</p>
              </div>
              <button
                onClick={() => setSystemSettings(prev => ({ ...prev, registration_enabled: !prev.registration_enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.registration_enabled 
                    ? 'bg-green-600 dark:bg-green-600 light:bg-green-600' 
                    : 'bg-white/20 dark:bg-white/20 light:bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.registration_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                Maksimum Dosya Boyutu (MB)
              </label>
              <input
                type="number"
                value={systemSettings.max_file_size}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, max_file_size: parseInt(e.target.value) }))}
                className="input-field"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                Oturum Zaman Aşımı (saat)
              </label>
              <input
                type="number"
                value={systemSettings.session_timeout}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, session_timeout: parseInt(e.target.value) }))}
                className="input-field"
                min="1"
                max="168"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn-primary">Ayarları Kaydet</button>
        </div>
      </div>
    </div>
  );
};

const DatabaseSettings: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium text-white dark:text-white light:text-gray-900 mb-6">Veritabanı Yönetimi</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <h4 className="text-sm font-semibold text-white dark:text-white light:text-gray-900 mb-2">Veritabanı Boyutu</h4>
            <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900">2.4 GB</p>
            <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-600">Toplam kullanılan alan</p>
          </div>
          <div className="card p-4">
            <h4 className="text-sm font-semibold text-white dark:text-white light:text-gray-900 mb-2">Tablo Sayısı</h4>
            <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900">24</p>
            <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-600">Aktif tablolar</p>
          </div>
          <div className="card p-4">
            <h4 className="text-sm font-semibold text-white dark:text-white light:text-gray-900 mb-2">Son Yedek</h4>
            <p className="text-sm font-bold text-white dark:text-white light:text-gray-900">2 saat önce</p>
            <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-600">Otomatik yedekleme</p>
          </div>
        </div>

        <div className="space-y-4">
          <button className="btn-secondary">Manuel Yedek Oluştur</button>
          <button className="btn-secondary">Veritabanını Optimize Et</button>
          <button className="btn-danger">Veritabanını Temizle</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
