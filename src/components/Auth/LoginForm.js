import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginForm = ({ onSwitchToRegister }) => {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (error) {
      if (error.response?.status === 401) {
        setError('root', {
          type: 'manual',
          message: 'Kullanıcı adı veya şifre hatalı'
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-4xl font-bold gradient-text">
            Admin Paneline Giriş
          </h2>
          <p className="mt-2 text-center text-sm text-white/60 dark:text-white/60 light:text-gray-600">
            Hesabınızla giriş yapın
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
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-accent-light text-sm font-semibold transition-colors"
            >
              Hesabınız yok mu? Kayıt olun →
            </button>
          </div>

          {/* Test User Info */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300 dark:text-blue-300 light:text-blue-700 text-center">
              🧪 <strong>Test Kullanıcısı:</strong> kubi / kubi
              <br />
              <span className="text-blue-200/80 dark:text-blue-200/80 light:text-blue-600">
                (Backend bağlantısı olmadığında çalışır)
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;


