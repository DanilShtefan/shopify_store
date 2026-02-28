const API_BASE_URL = 'http://127.0.0.1:8000/api';

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

export interface AuthResponse {
  tokens: {
    refresh: string;
    access: string;
  };
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface RefreshResponse {
  access: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Важно для cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    // Преобразуем объект в строку сразу
    const errorMessage = typeof error === 'object'
      ? JSON.stringify(error)
      : String(error);
    throw new Error(errorMessage);
  }

  return response.json();
}

export const authService = {
  /**
   * Регистрация пользователя
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Логин пользователя
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Выход
   */
  logout: async (): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>('/auth/logout/', {
      method: 'POST',
    });
  },

  /**
   * Получение CSRF токена
   */
  getCsrfToken: async (): Promise<{ csrfToken: string }> => {
    return fetchApi<{ csrfToken: string }>('/auth/csrf/', {
      method: 'GET',
    });
  },

  /**
   * Обновление access токена
   */
  refreshToken: async (refresh: string): Promise<RefreshResponse> => {
    return fetchApi<RefreshResponse>('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
  },

  /**
   * Получение профиля пользователя
   */
  getProfile: async (): Promise<AuthResponse['user']> => {
    return fetchApi<AuthResponse['user']>('/auth/profile/', {
      method: 'GET',
    });
  },

  /**
   * Обновление профиля пользователя
   */
  updateProfile: async (
    data: Partial<AuthResponse['user']>
  ): Promise<AuthResponse['user']> => {
    return fetchApi<AuthResponse['user']>('/auth/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};