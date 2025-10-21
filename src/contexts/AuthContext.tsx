import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, LoginCredentials, RegisterCredentials, LoginResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterCredentials) => Promise<LoginResponse>;
  assignRole: (roleData: { username: string; role: string }) => Promise<any>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isInstructor: () => boolean;
  isStudent: () => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setLoading(true);
      
      const response = await authAPI.login(credentials);
      const { token: newToken, username, roles, awarded_badges } = response.data;
      
      const userData: User = {
        username,
        roles,
        awarded_badges,
        created_at: new Date().toISOString()
      };
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success(`Hoş geldiniz, ${username}!`);
      return response.data;
    } catch (error: any) {
      const isNetworkError = error.code === 'ECONNREFUSED' || 
                            error.message?.includes('Network Error') ||
                            !error.response;
      
      if (isNetworkError && credentials.username === 'kubi' && credentials.password === 'kubi') {
        console.warn('⚠️ Backend bağlantısı yok. Test kullanıcısı (kubi) ile giriş yapılıyor...');
        
        const testUser: User = {
          username: 'kubi',
          roles: ['admin'],
          awarded_badges: [],
          created_at: new Date().toISOString()
        };
        const testToken = 'test-kubi-token-' + Date.now();
        
        setToken(testToken);
        setUser(testUser);
        localStorage.setItem('token', testToken);
        localStorage.setItem('user', JSON.stringify(testUser));
        
        toast.success('🧪 Test kullanıcısı ile giriş yapıldı (Backend bağlantısı yok)', {
          duration: 4000,
        });
        
        return {
          ok: true,
          token: testToken,
          username: testUser.username,
          roles: testUser.roles,
          awarded_badges: testUser.awarded_badges
        };
      }
      
      const message = error.response?.data?.detail || 'Giriş yapılırken bir hata oluştu';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterCredentials): Promise<LoginResponse> => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      const { token: newToken, username } = response.data;
      
      const userInfo: User = {
        username,
        roles: ['student'],
        awarded_badges: [],
        created_at: new Date().toISOString()
      };
      
      setToken(newToken);
      setUser(userInfo);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      toast.success(`Hesabınız oluşturuldu, hoş geldiniz ${username}!`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Kayıt olurken bir hata oluştu';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (roleData: { username: string; role: string }): Promise<any> => {
    try {
      const response = await authAPI.assignRole(roleData);
      toast.success('Rol başarıyla atandı');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Rol atanırken bir hata oluştu';
      toast.error(message);
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Başarıyla çıkış yapıldı');
  };

  const isAuthenticated = (): boolean => {
    return !!token && !!user;
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isInstructor = (): boolean => {
    return hasRole('instructor') || hasRole('admin');
  };

  const isStudent = (): boolean => {
    return hasRole('student');
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    assignRole,
    logout,
    isAuthenticated,
    hasRole,
    isAdmin,
    isInstructor,
    isStudent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};






