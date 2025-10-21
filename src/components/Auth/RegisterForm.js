import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RegisterForm = ({ onSwitchToLogin }) => {
  const { register: registerUser, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser({
        username: data.username,
        password: data.password
      });
    } catch (error) {
      if (error.response?.status === 409) {
        setError('username', {
          type: 'manual',
          message: 'Bu kullanıcı adı zaten kullanılıyor'
        });
      } else {
        setError('root', {
          type: 'manual',
          message: error.response?.data?.detail || 'Kayıt olurken bir hata oluştu'
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-300/20 to-accent-light/20 rounded-2xl border border-primary-300/30 flex items-center justify-center">
            <svg className="h-10 w-10 text-primary-300 dark:text-primary-300 light:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-4xl font-bold gradient-text">
            Yeni Hesap Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-white/60 dark:text-white/60 light:text-gray-600">
            Admin paneline erişim için hesap oluşturun
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="card p-6 space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <input
                {...register('username', {
                  required: 'Kullanıcı adı gereklidir',
                  minLength: {
                    value: 3,
                    message: 'Kullanıcı adı en az 3 karakter olmalıdır'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'
                  }
                })}
                type="text"
                className="input-field w-full"
                placeholder="Kullanıcı adınızı girin"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Şifre gereklidir',
                    minLength: {
                      value: 4,
                      message: 'Şifre en az 4 karakter olmalıdır'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field w-full pr-10"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 dark:text-white/60 light:text-gray-500 hover:text-primary-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/70 dark:text-white/70 light:text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Şifre tekrarı gereklidir',
                  validate: value => value === password || 'Şifreler eşleşmiyor'
                })}
                type={showPassword ? 'text' : 'password'}
                className="input-field w-full"
                placeholder="Şifrenizi tekrar girin"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400 dark:text-red-400 light:text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-xl bg-red-500/20 dark:bg-red-500/20 light:bg-red-50 border border-red-500/40 p-4">
              <p className="text-sm text-red-400 dark:text-red-400 light:text-red-800">{errors.root.message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-accent-light text-sm font-semibold transition-colors"
            >
              Zaten hesabınız var mı? Giriş yapın →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;


