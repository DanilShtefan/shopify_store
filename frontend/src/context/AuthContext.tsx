import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService, type LoginData, type RegisterData } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface JwtPayload {
  user_id: number;
  username: string;
  email: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: any;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Сохранение токенов в localStorage
   */
  const saveTokens = useCallback((access: string, refresh: string) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }, []);

  /**
   * Очистка токенов
   */
  const clearTokens = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  /**
   * Загрузка токенов из localStorage при старте
   */
  useEffect(() => {
    const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedAccess && storedRefresh) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);

      // Декодируем токен и получаем данные пользователя
      try {
        const payload = jwtDecode<JwtPayload>(storedAccess);
        setUser({
          id: payload.user_id,
          username: payload.username,
          email: payload.email,
          first_name: '',
          last_name: '',
        });
      } catch (e) {
        // Токен невалиден — очищаем
        clearTokens();
      }
    }
    setLoading(false);
  }, [clearTokens]);

  /**
   * Очистка ошибки
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Логин пользователя
   */
  const login = useCallback(async (data: LoginData): Promise<boolean> => {
    try {
      const response = await authService.login(data);
      saveTokens(response.tokens.access, response.tokens.refresh);
      setUser(response.user);
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
  }, [saveTokens]);

  /**
   * Регистрация пользователя
   */
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await authService.register(data);
      saveTokens(response.tokens.access, response.tokens.refresh);
      setUser(response.user);
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
  }, [saveTokens]);

  /**
   * Выход
   */
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, [clearTokens]);

  /**
   * Обновление access токена
   */
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) return false;

    try {
      const response = await authService.refreshToken(refreshToken);
      setAccessToken(response.access);
      localStorage.setItem(ACCESS_TOKEN_KEY, response.access);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, [refreshToken, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        loading,
        error,
        login,
        register,
        logout,
        refreshAccessToken,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}