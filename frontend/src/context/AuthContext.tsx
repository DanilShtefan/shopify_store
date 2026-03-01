import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService, type LoginData, type RegisterData, type User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: any;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (data: Partial<User>) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Очистка ошибки
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Загрузка данных пользователя при старте
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (e) {
        // Не авторизован — это нормально, просто очищаем данные
        // 403/401 означает что пользователь не вошёл в систему
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Обновление данных пользователя
   */
  const updateUser = useCallback(async (data: Partial<User>): Promise<boolean> => {
    // Очищаем ошибку перед запросом
    setError(null);

    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      return true;
    } catch (error) {
      let errorMessage: any = 'Ошибка обновления';
      if (error instanceof Error) {
        try {
          const errorData = error.message;
          if (typeof errorData === 'string') {
            const parsed = JSON.parse(errorData);
            errorMessage = parsed;
          } else {
            errorMessage = errorData;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
      console.error('Update profile failed:', error);
      return false;
    }
  }, []);

  /**
   * Логин пользователя
   */
  const login = useCallback(async (data: LoginData): Promise<boolean> => {
    try {
      const user = await authService.login(data);
      setUser(user);
      setError(null);
      return true;
    } catch (error) {
      let errorMessage = 'Ошибка входа';
      if (error instanceof Error) {
        try {
          const errorData = error.message;
          if (typeof errorData === 'string') {
            // Пытаемся распарсить JSON
            const parsed = JSON.parse(errorData);
            if (typeof parsed === 'object' && parsed !== null) {
              // Берём первую ошибку или detail
              const firstKey = Object.keys(parsed)[0];
              const firstError = parsed[firstKey];
              errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
            } else {
              errorMessage = parsed.detail || errorData;
            }
          } else {
            errorMessage = errorData;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  /**
   * Регистрация пользователя
   */
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      const user = await authService.register(data);
      setUser(user);
      setError(null);
      return true;
    } catch (error) {
      let errorMessage: any = 'Ошибка регистрации';
      if (error instanceof Error) {
        try {
          const errorData = error.message;
          if (typeof errorData === 'string') {
            const parsed = JSON.parse(errorData);
            errorMessage = parsed;
          } else {
            errorMessage = errorData;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
      console.error('Registration failed:', error);
      return false;
    }
  }, []);

  /**
   * Выход
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout failed:', e);
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
