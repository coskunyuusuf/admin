import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  TrophyIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  StarIcon,
  VideoCameraIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, isAdmin, isInstructor, isStudent } = useAuth();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['admin', 'instructor'] },
    { name: 'Kullanıcılar', href: '/users', icon: UserGroupIcon, roles: ['admin', 'instructor'] },
    { name: 'Ders Yönetimi', href: '/lessons', icon: VideoCameraIcon, roles: ['admin', 'instructor'] },
    { name: 'SoruLab', href: '/sorulab', icon: BeakerIcon, roles: ['admin', 'instructor'] },
    { name: 'Sistem İstatistikleri', href: '/system-stats', icon: ChartBarIcon, roles: ['admin', 'instructor'] },
    { name: 'Rol Yönetimi', href: '/role-management', icon: UserGroupIcon, roles: ['admin', 'instructor'] },
    { name: 'Puan Yönetimi', href: '/points-management', icon: TrophyIcon, roles: ['admin', 'instructor'] },
    { name: 'Badge Yönetimi', href: '/badge-management', icon: StarIcon, roles: ['admin', 'instructor'] },
    { name: 'Ayarlar', href: '/settings', icon: CogIcon, roles: ['admin', 'instructor'] },
  ];

  const filteredNavigation = navigation.filter(item => {
    return item.roles.some(role => {
      if (role === 'admin' && isAdmin()) return true;
      if (role === 'instructor' && isInstructor()) return true;
      if (role === 'student' && isStudent()) return true;
      return false;
    });
  });

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 
        bg-gradient-to-br from-dark-card to-dark-input dark:from-dark-card dark:to-dark-input light:from-white light:to-gray-50
        border-r border-primary-300/20 dark:border-primary-300/20 light:border-primary-300/30
        shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-primary-300/20 dark:border-primary-300/20 light:border-primary-300/30">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-300/20 to-accent-light/20 rounded-xl border border-primary-300/30 flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-primary-300 dark:text-primary-300 light:text-primary-600" />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold gradient-text">Mentor Admin</h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-white/60 dark:text-white/60 light:text-gray-600 hover:text-primary-300 hover:bg-primary-300/10 transition-all"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-primary-300/20 to-accent-light/20 dark:from-primary-300/20 dark:to-accent-light/20 light:from-primary-50 light:to-primary-100 text-primary-300 dark:text-primary-300 light:text-primary-700 border border-primary-300/40 dark:border-primary-300/40 light:border-primary-300 shadow-lg shadow-primary-500/20'
                      : 'text-white/70 dark:text-white/70 light:text-gray-700 hover:text-primary-300 dark:hover:text-primary-300 light:hover:text-primary-600 hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-primary-50'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110
                      ${isActive(item.href)
                        ? 'text-primary-300 dark:text-primary-300 light:text-primary-600'
                        : 'text-white/50 dark:text-white/50 light:text-gray-500 group-hover:text-primary-300 dark:group-hover:text-primary-300 light:group-hover:text-primary-600'
                      }
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-primary-300/20 dark:border-primary-300/20 light:border-primary-300/30">
            <div className="flex items-center p-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-primary-50 hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-primary-100 transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-300/30 to-accent-light/30 rounded-full flex items-center justify-center border border-primary-300/30">
                  <span className="text-sm font-bold text-primary-300 dark:text-primary-300 light:text-primary-600">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-white dark:text-white light:text-gray-900">{user?.username}</p>
                <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-600">
                  {user?.roles?.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;





