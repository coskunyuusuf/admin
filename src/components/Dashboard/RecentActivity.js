import React from 'react';

const formatDistanceToNow = (date, options = {}) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'az önce';
  if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} gün önce`;
  
  return date.toLocaleDateString('tr-TR');
};

const RecentActivity = ({ activities }) => {
  const activitiesList = Array.isArray(activities) ? activities : [];
  const getActivityIcon = (type) => {
    const icons = {
      login: '🔐',
      note: '📝',
      quiz: '📊',
      chat: '💬',
      upload: '📁',
      badge: '🏆',
      focus: '⏰',
      message: '✉️',
    };
    return icons[type] || '📌';
  };

  const getActivityColor = (type) => {
    const colors = {
      login: 'bg-primary-300/20 dark:bg-primary-300/20 light:bg-blue-50 text-primary-300 dark:text-primary-300 light:text-blue-700 border border-primary-300/30',
      note: 'bg-green-500/20 dark:bg-green-500/20 light:bg-green-50 text-green-400 dark:text-green-400 light:text-green-700 border border-green-500/30',
      quiz: 'bg-accent-light/20 dark:bg-accent-light/20 light:bg-purple-50 text-accent-light dark:text-accent-light light:text-purple-700 border border-accent-light/30',
      chat: 'bg-yellow-500/20 dark:bg-yellow-500/20 light:bg-yellow-50 text-yellow-400 dark:text-yellow-400 light:text-yellow-700 border border-yellow-500/30',
      upload: 'bg-white/20 dark:bg-white/20 light:bg-gray-50 text-white/70 dark:text-white/70 light:text-gray-700 border border-white/30',
      badge: 'bg-red-500/20 dark:bg-red-500/20 light:bg-red-50 text-red-400 dark:text-red-400 light:text-red-700 border border-red-500/30',
      focus: 'bg-primary-300/20 dark:bg-primary-300/20 light:bg-indigo-50 text-primary-300 dark:text-primary-300 light:text-indigo-700 border border-primary-300/30',
      message: 'bg-accent-light/20 dark:bg-accent-light/20 light:bg-pink-50 text-accent-light dark:text-accent-light light:text-pink-700 border border-accent-light/30',
    };
    return colors[type] || 'bg-white/20 dark:bg-white/20 light:bg-gray-50 text-white/70 dark:text-white/70 light:text-gray-700 border border-white/30';
  };

  if (activities.length === 0) {
    return (
      <div className="card p-6 h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4 flex-shrink-0">Son Aktiviteler</h3>
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-white/60 dark:text-white/60 light:text-gray-500">Henüz aktivite bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4 flex-shrink-0">Son Aktiviteler</h3>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {activitiesList.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 dark:bg-white/5 light:bg-gray-50 rounded-lg hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-primary-50 transition-all">
            <div className="flex-shrink-0">
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white dark:text-white light:text-gray-900 truncate">
                  {activity.description}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getActivityColor(activity.type)}`}>
                  {activity.type}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-white/70 dark:text-white/70 light:text-gray-600">
                  {activity.user || 'Sistem'}
                </p>
                <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-500">
                  {formatDistanceToNow(new Date(activity.created_at))}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {activitiesList.length >= 10 && (
        <div className="mt-4 pt-4 border-t border-primary-300/20 dark:border-primary-300/20 light:border-primary-300/30 flex-shrink-0">
          <button className="text-sm text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-accent-light font-medium transition-colors">
            Tüm aktiviteleri görüntüle →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
