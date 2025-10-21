import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const handleLogout = (): void => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-gradient-to-r from-dark-card to-dark-input dark:from-dark-card dark:to-dark-input light:from-white light:to-gray-50 shadow-xl border-b border-primary-300/20 dark:border-primary-300/20 light:border-primary-300/30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-white/60 dark:text-white/60 light:text-gray-600 hover:text-primary-300 hover:bg-primary-300/10 transition-all"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-white/60 dark:text-white/60 light:text-gray-600 hover:text-primary-300 hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-primary-50 rounded-lg transition-all">
            <BellIcon className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg text-white/80 dark:text-white/80 light:text-gray-700 hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-primary-50 transition-all"
            >
              <UserCircleIcon className="w-7 h-7" />
              <span className="hidden md:block text-sm font-medium">{user?.username || 'Kullanıcı'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-dark-card dark:bg-dark-card light:bg-white border border-primary-300/30 dark:border-primary-300/30 light:border-gray-200 rounded-xl shadow-2xl shadow-primary-300/20 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-primary-300/20 dark:border-primary-300/20 light:border-gray-200">
                  <p className="text-sm font-medium text-white dark:text-white light:text-gray-900">{user?.username}</p>
                  <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-600 mt-1">
                    {user?.roles?.join(', ') || 'Kullanıcı'}
                  </p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      window.location.href = '/settings';
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white dark:text-white light:text-gray-900 hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-primary-50 transition-all flex items-center space-x-2"
                  >
                    <CogIcon className="w-4 h-4" />
                    <span>Ayarlar</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
