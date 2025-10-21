import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

interface User {
  username: string;
  full_name?: string;
  roles?: string[];
}

interface UserSelectDropdownProps {
  users: User[];
  selectedUsers: string[];
  onSelect: (usernames: string[]) => void;
  placeholder?: string;
  label?: string;
  multiple?: boolean;
  showTagsInside?: boolean; // true: input içinde, false: input dışında
}

const UserSelectDropdown: React.FC<UserSelectDropdownProps> = ({
  users,
  selectedUsers,
  onSelect,
  placeholder = 'Kullanıcı seçin...',
  label,
  multiple = true,
  showTagsInside = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower) ||
      false;
    
    if (multiple) {
      return matchesSearch && !selectedUsers.includes(user.username);
    }
    
    return matchesSearch;
  });

  const handleToggleUser = (username: string) => {
    if (multiple) {
      if (selectedUsers.includes(username)) {
        onSelect(selectedUsers.filter((u) => u !== username));
      } else {
        onSelect([...selectedUsers, username]);
      }
    } else {
      onSelect([username]);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRemoveUser = (username: string) => {
    onSelect(selectedUsers.filter((u) => u !== username));
  };

  const getSelectedUserInfo = (username: string) => {
    return users.find((u) => u.username === username);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Selected Users Tags Outside Input (when showTagsInside is false) */}
      {!showTagsInside && selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUsers.map((username) => {
            const user = getSelectedUserInfo(username);
            return (
              <div
                key={username}
                className="inline-flex items-center px-3 py-1 bg-primary-300/20 dark:bg-primary-300/20 light:bg-primary-100 border border-primary-300/40 dark:border-primary-300/40 light:border-primary-300 rounded-full text-sm"
              >
                <UserIcon className="w-4 h-4 mr-1.5 text-primary-300 dark:text-primary-300 light:text-primary-600" />
                <span className="text-white dark:text-white light:text-gray-900 font-medium">
                  {user?.full_name || username}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveUser(username)}
                  className="ml-2 text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-red-400 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input Field */}
      <div
        onClick={() => setIsOpen(true)}
        className="relative cursor-pointer"
      >
        <div className="input-field w-full pr-10 flex items-center gap-2 overflow-x-auto scrollbar-hide flex-nowrap">
          <MagnifyingGlassIcon className="w-5 h-5 text-white/40 dark:text-white/40 light:text-gray-400 flex-shrink-0 ml-1" />
          
          {/* Selected Users Tags Inside Input (when showTagsInside is true) */}
          {showTagsInside && selectedUsers.map((username) => {
            const user = getSelectedUserInfo(username);
            return (
              <div
                key={username}
                className="inline-flex items-center px-2 py-1 bg-primary-300/20 dark:bg-primary-300/20 light:bg-primary-100 border border-primary-300/40 dark:border-primary-300/40 light:border-primary-300 rounded-lg text-xs flex-shrink-0"
              >
                <span className="text-white dark:text-white light:text-gray-900 font-medium">
                  {user?.full_name || username}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveUser(username);
                  }}
                  className="ml-1.5 text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-red-400 transition-colors"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={showTagsInside && selectedUsers.length > 0 ? '' : placeholder}
            className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-white dark:text-white light:text-gray-900 placeholder-white/40 dark:placeholder-white/40 light:placeholder-gray-400"
          />
          
          {!showTagsInside && selectedUsers.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-primary-300/30 dark:bg-primary-300/30 light:bg-primary-200 text-primary-300 dark:text-primary-300 light:text-primary-700 text-xs font-semibold rounded-full">
              {selectedUsers.length}
            </span>
          )}
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-dark-card dark:bg-dark-card light:bg-white border border-primary-300/30 dark:border-primary-300/30 light:border-gray-300 rounded-xl shadow-2xl shadow-primary-300/20 overflow-hidden">
          {filteredUsers.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {filteredUsers.slice(0, 50).map((user) => (
                <button
                  key={user.username}
                  type="button"
                  onClick={() => handleToggleUser(user.username)}
                  className="w-full px-4 py-3 text-left hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-primary-50 transition-colors border-b border-primary-300/10 dark:border-primary-300/10 light:border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-300/20 dark:bg-primary-300/20 light:bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-300 dark:text-primary-300 light:text-primary-600">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white dark:text-white light:text-gray-900 truncate">
                        {user.full_name || user.username}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-600 truncate">
                          @{user.username}
                        </p>
                        {user.roles && user.roles.length > 0 && (
                          <span className="px-2 py-0.5 bg-accent-light/20 dark:bg-accent-light/20 light:bg-pink-100 text-accent-light dark:text-accent-light light:text-pink-700 text-xs rounded-full">
                            {user.roles[0]}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedUsers.includes(user.username) && (
                      <div className="flex-shrink-0 w-5 h-5 bg-primary-300 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <UserIcon className="mx-auto h-12 w-12 text-white/20 dark:text-white/20 light:text-gray-300" />
              <p className="mt-2 text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                {searchTerm ? 'Kullanıcı bulunamadı' : 'Kullanıcı listesi boş'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSelectDropdown;

