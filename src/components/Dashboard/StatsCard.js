import React from 'react';

const StatsCard = ({ title, value, change, changeType = 'positive', icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-300/20 border border-primary-300/40 text-primary-300',
    accent: 'bg-accent-light/20 border border-accent-light/40 text-accent-light',
    green: 'bg-green-500/20 border border-green-500/40 text-green-400',
    red: 'bg-red-500/20 border border-red-500/40 text-red-400',
  };

  const changeColorClasses = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-white/60',
  };

  return (
    <div className="card p-6 h-[120px] flex flex-col justify-center hover:shadow-lg hover:shadow-primary-300/20 transition-all duration-300">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-xs font-semibold text-white/60 dark:text-white/60 light:text-gray-600 uppercase tracking-wider truncate">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-lg font-bold text-white dark:text-white light:text-gray-900">{value}</p>
            {change && (
              <p className={`ml-2 text-xs font-semibold ${changeColorClasses[changeType]}`}>
                {change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;


