import { fetchApi } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface RegisterData {
  username: string;
  password: string;
  password2: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Сервер возвращает сразу данные пользователя (без обёртки)
export type AuthResponse = User;

export interface RefreshResponse {
  access: string;
}

export const authService = {
  /**
   * Регистрация пользователя
   * Токены автоматически устанавливаются в httpOnly cookie сервером
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  },

  /**
   * Логин пользователя
   * Токены автоматически устанавливаются в httpOnly cookie сервером
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  },

  /**
   * Выход
   * Сервер очищает cookie
   */
  logout: async (): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>('/auth/logout/', {
      method: 'POST',
      credentials: 'include',
    });
  },

  /**
   * Получение CSRF токена
   */
  getCsrfToken: async (): Promise<{ csrfToken: string }> => {
    return fetchApi<{ csrfToken: string }>('/auth/csrf/', {
      method: 'GET',
      credentials: 'include',
    });
  },

  /**
   * Обновление access токена
   * Refresh токен берётся из cookie, новый access токен устанавливается в cookie
   */
  refreshToken: async (): Promise<RefreshResponse> => {
    return fetchApi<RefreshResponse>('/auth/token/refresh/', {
      method: 'POST',
      credentials: 'include',
    });
  },

  /**
   * Получение профиля пользователя
   * JWT токен автоматически читается из cookie middleware на сервере
   */
  getProfile: async (): Promise<User> => {
    return fetchApi<User>('/auth/profile/', {
      method: 'GET',
      credentials: 'include',
    });
  },

  /**
   * Обновление профиля пользователя
   */
  updateProfile: async (
    data: Partial<User>
  ): Promise<User> => {
    return fetchApi<User>('/auth/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  },
};
