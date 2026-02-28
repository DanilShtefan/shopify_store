const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Получение CSRF токена из cookie
function getCsrfToken(): string | null {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Получение CSRF токена с сервера (если нет в cookie)
async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data.csrfToken || null;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  return null;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { requireAuth?: boolean },
  requireAuth: boolean = false
): Promise<T> {
  let csrfToken = getCsrfToken();
  
  // Если токена нет и это безопасный метод — пробуем получить
  if (!csrfToken && options?.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
    csrfToken = await fetchCsrfToken();
  }

  // Формируем заголовки
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Добавляем CSRF токен для безопасных методов
  if (csrfToken && options?.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
    headers['X-CSRFToken'] = csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Важно для отправки cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));

    // Если 403 — возможно проблема с CSRF
    if (response.status === 403) {
      console.error('CSRF token missing or invalid. Error:', error);
    }

    // Если токен 401 — пробуем обновить токен (опционально)
    if (response.status === 401 && requireAuth) {
      console.warn('Token expired or invalid');
    }

    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}