import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const UserModal = ({ isOpen, onClose, user, mode = 'view' }) => {
  const { assignRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  const availableRoles = [
    { value: 'student', label: 'Öğrenci' },
    { value: 'instructor', label: 'Eğitmen' },
    { value: 'admin', label: 'Admin' },
  ];

  useEffect(() => {
    if (user && isOpen) {
      setSelectedRoles(user.roles || []);
      setValue('username', user.username);
      setValue('email', user.email);
      setValue('full_name', user.full_name);
      setValue('phone', user.phone);
      setValue('bio', user.bio);
      setValue('department', user.department);
      setValue('student_id', user.student_id);
      setValue('grade_level', user.grade_level);
      setValue('major', user.major);
      setValue('enrollment_year', user.enrollment_year);
    } else if (!user && isOpen && mode === 'create') {
      reset();
      setSelectedRoles([]);
    }
  }, [user, isOpen, mode, setValue, reset]);

  const handleRoleChange = (role, checked) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, role]);
    } else {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    }
  };

  const onSubmit = async (data) => {
    if (mode === 'create') {
      try {
        setIsLoading(true);
        await authAPI.register({
          username: data.username,
          password: data.password || 'defaultPassword123',
          email: data.email,
          full_name: data.full_name,
        });
        toast.success('Kullanıcı başarıyla oluşturuldu');
        onClose();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Kullanıcı oluşturulurken bir hata oluştu';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else if (mode === 'edit') {
      try {
        setIsLoading(true);
        toast.info('Kullanıcı düzenleme için backend admin endpoint gerekli');
        onClose();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Kullanıcı güncellenirken bir hata oluştu';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAssignRole = async () => {
    if (selectedRoles.length === 0) {
      toast.error('En az bir rol seçmelisiniz');
      return;
    }

    try {
      setIsLoading(true);
      for (const role of selectedRoles) {
        if (!user.roles?.includes(role)) {
          await assignRole({
            username: user.username,
            role: role
          });
        }
      }
      toast.success('Roller başarıyla atandı');
      onClose();
    } catch (error) {
      toast.error('Rol atanırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-gradient-to-br from-dark-card to-dark-input dark:from-dark-card dark:to-dark-input light:from-white light:to-gray-50 rounded-2xl text-left overflow-hidden shadow-2xl border border-primary-300/30 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold gradient-text">
                {mode === 'create' ? 'Yeni Kullanıcı' : 
                 mode === 'edit' ? 'Kullanıcı Düzenle' : 'Kullanıcı Detayları'}
              </h3>
              <button
                onClick={onClose}
                className="text-white/60 dark:text-white/60 light:text-gray-500 hover:text-primary-300 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Kullanıcı Adı */}
              <div>
                <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-white/40 dark:text-white/40 light:text-gray-500" />
                  </div>
                  <input
                    {...register('username', {
                      required: 'Kullanıcı adı gereklidir',
                      minLength: { value: 3, message: 'En az 3 karakter olmalıdır' }
                    })}
                    type="text"
                    disabled={mode === 'view' || mode === 'edit'}
                    className={`input-field pl-10 ${mode === 'view' || mode === 'edit' ? 'opacity-60' : ''}`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-white/40 dark:text-white/40 light:text-gray-500" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email gereklidir',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Geçerli bir email adresi girin'
                      }
                    })}
                    type="email"
                    disabled={mode === 'view'}
                    className={`input-field pl-10 ${mode === 'view' ? 'opacity-60' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Ad Soyad */}
              <div>
                <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  {...register('full_name', {
                    required: 'Ad soyad gereklidir'
                  })}
                  type="text"
                  disabled={mode === 'view'}
                  className={`input-field ${mode === 'view' ? 'opacity-60' : ''}`}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                  Telefon
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-white/40 dark:text-white/40 light:text-gray-500" />
                  </div>
                  <input
                    {...register('phone')}
                    type="tel"
                    disabled={mode === 'view'}
                    className={`input-field pl-10 ${mode === 'view' ? 'opacity-60' : ''}`}
                  />
                </div>
              </div>

              {/* Biyografi */}
              <div>
                <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                  Biyografi
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  disabled={mode === 'view'}
                  className={`input-field ${mode === 'view' ? 'opacity-60' : ''}`}
                />
              </div>

              {/* Öğrenci Bilgileri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                    Öğrenci No
                  </label>
                  <input
                    {...register('student_id')}
                    type="text"
                    disabled={mode === 'view'}
                    className={`input-field ${mode === 'view' ? 'opacity-60' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                    Sınıf
                  </label>
                  <input
                    {...register('grade_level')}
                    type="text"
                    disabled={mode === 'view'}
                    className={`input-field ${mode === 'view' ? 'opacity-60' : ''}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                    Bölüm
                  </label>
                  <input
                    {...register('major')}
                    type="text"
                    disabled={mode === 'view'}
                    className={`input-field ${mode === 'view' ? 'opacity-60' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                    Kayıt Yılı
                  </label>
                  <input
                    {...register('enrollment_year')}
                    type="number"
                    min="2000"
                    max="2030"
                    disabled={mode === 'view'}
                    className={`input-field ${mode === 'view' ? 'opacity-60' : ''}`}
                  />
                </div>
              </div>

              {/* Roller */}
              <div>
                <label className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-3">
                  Roller
                </label>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <label key={role.value} className="flex items-center p-2 rounded-lg hover:bg-primary-300/10 dark:hover:bg-primary-300/10 light:hover:bg-primary-50 transition-all">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.value)}
                        onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                        disabled={mode === 'view'}
                        className="rounded border-primary-300/30 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-white dark:text-white light:text-gray-900">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  İptal
                </button>
                
                {mode === 'view' && (
                  <button
                    type="button"
                    onClick={handleAssignRole}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Atanıyor...' : 'Rol Ata'}
                  </button>
                )}
                
                {(mode === 'create' || mode === 'edit') && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;


