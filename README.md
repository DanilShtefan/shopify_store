# Shopify Store

Интернет-магазин на Django + React с безопасной аутентификацией через httpOnly cookie.

## 📋 Содержание

- [Технологии](#-технологии)
- [Структура проекта](#-структура-проекта)
- [Быстрый старт](#-быстрый-старт)
- [Архитектура](#-архитектура)
- [API Endpoints](#-api-endpoints)
- [Безопасность](#-безопасность)

---

## 🛠 Технологии

### Backend (Django)
- **Django 6.0** — веб-фреймворк
- **Django REST Framework** — API
- **SimpleJWT** — JWT токены
- **django-cors-headers** — CORS
- **SQLite** — база данных

### Frontend (React)
- **React 19** — UI библиотека
- **React Router v7** — роутинг
- **TypeScript** — типизация
- **Vite** — сборщик
- **Lucide React** — иконки

---

## 📁 Структура проекта

```
shopify_store/
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── components/       # UI компоненты
│   │   ├── context/          # React Context (Auth, Toast, Cart)
│   │   ├── hooks/            # Кастомные хуки
│   │   ├── pages/            # Страницы
│   │   ├── services/         # API сервисы
│   │   └── App.tsx           # Главный компонент
│   ├── vite.config.ts        # Vite конфигурация (proxy)
│   └── package.json
│
├── store/                    # Django приложение
│   ├── models.py             # Модели данных
│   ├── views.py              # API views
│   ├── middleware.py         # JWT аутентификация
│   └── forms.py              # Формы
│
├── shopify_store/            # Django проект
│   ├── settings.py           # Настройки
│   └── urls.py               # URL маршруты
│
├── manage.py                 # Django CLI
└── db.sqlite3                # База данных
```

---

## 🚀 Быстрый старт

### Требования
- Python 3.12+
- Node.js 18+

### 1. Установка зависимостей

```bash
# Backend
cd shopify_store
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

# Frontend
cd frontend
npm install
```

### 2. Настройка базы данных

```bash
cd shopify_store
python manage.py migrate
python manage.py createsuperuser  # Создание админа
```

### 3. Запуск

**Вариант 1: Раздельный запуск**
```bash
# Terminal 1 - Backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Вариант 2: Одновременный запуск**
```bash
cd frontend
npm run start-all
```

### 4. Доступ

- **Frontend:** http://localhost:5173
- **API:** http://localhost:5173/api/ (через proxy)
- **Admin:** http://localhost:5173/admin/

---

## 🏗 Архитектура

### Модели данных

| Модель | Описание |
|--------|----------|
| `Category` | Категории товаров (иерархические) |
| `Product` | Товары (название, цена, описание, склад) |
| `ProductImage` | Изображения товаров |
| `Cart` / `CartItem` | Корзина покупателя (session-based) |
| `Wishlist` / `WishlistItem` | Избранное (session-based) |
| `Address` | Адреса доставки пользователя |
| `FailedLoginAttempt` | Защита от брутфорса |

### Аутентификация

```
┌─────────────────────────────────────────────────────────────┐
│                    РЕГИСТРАЦИЯ / ВХОД                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Frontend отправляет username/password                    │
│ 2. Backend проверяет credentials                            │
│ 3. Генерирует JWT токены (access + refresh)                 │
│ 4. Устанавливает токены в httpOnly cookie                   │
│    - access_token: 1 час                                    │
│    - refresh_token: 1 день                                  │
│ 5. Возвращает данные пользователя                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    АВТОРИЗОВАННЫЙ ЗАПРОС                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Frontend отправляет запрос с credentials: 'include'      │
│ 2. Backend получает CSRF токен из cookie                    │
│ 3. JWT Middleware читает access_token из cookie             │
│ 4. Извлекает user_id из JWT                                 │
│ 5. Устанавливает request.user                               │
│ 6. @permission_classes([IsAuthenticated]) проверяет доступ  │
└─────────────────────────────────────────────────────────────┘
```

### Защита от CSRF

- CSRF токен хранится в cookie (`csrftoken`)
- Для POST/PUT/DELETE/PATCH запросов токен отправляется в заголовке `X-CSRFToken`
- `@ensure_csrf_cookie` устанавливает CSRF cookie при первом запросе

### Прокси (Vite)

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
}
```

Все API запросы идут на `localhost:5173/api`, Vite проксирует их на Django.

---

## 📡 API Endpoints

### Товары
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/products/` | Список товаров (пагинация, фильтры) |
| GET | `/api/products/<slug>/` | Детальная информация |
| GET | `/api/search/?q=...` | Поиск товаров |

### Категории
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/categories/` | Список категорий |

### Корзина (session-based)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/cart/<session_id>/` | Получить корзину |
| POST | `/api/cart/<session_id>/add/` | Добавить товар |
| PUT | `/api/cart/<session_id>/update/<id>/` | Обновить количество |
| DELETE | `/api/cart/<session_id>/remove/<id>/` | Удалить товар |

### Избранное (session-based)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/wishlist/<session_id>/` | Получить избранное |
| POST | `/api/wishlist/<session_id>/add/` | Добавить товар |
| DELETE | `/api/wishlist/<session_id>/remove/<id>/` | Удалить товар |

### Авторизация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register/` | Регистрация |
| POST | `/api/auth/login/` | Вход |
| POST | `/api/auth/logout/` | Выход |
| GET | `/api/auth/csrf/` | Получить CSRF токен |
| POST | `/api/auth/token/refresh/` | Обновить токен |
| GET | `/api/auth/profile/` | Профиль пользователя |
| PUT | `/api/auth/profile/update/` | Обновить профиль |

### Адреса (требует авторизации)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/addresses/` | Список адресов |
| POST | `/api/addresses/create/` | Добавить адрес |
| PUT | `/api/addresses/<id>/` | Обновить адрес |
| DELETE | `/api/addresses/<id>/delete/` | Удалить адрес |

---

## 🔒 Безопасность

### httpOnly Cookie
- JWT токены хранятся в httpOnly cookie (недоступны через JavaScript)
- Защита от XSS атак
- `SameSite=Lax` для локальной разработки

### Защита от брутфорса
- Блокировка после 5 неудачных попыток
- Время блокировки: 15 минут
- Отслеживание по username и IP

### CSRF Protection
- CSRF токен для всех mutating запросов
- Cookie с `HttpOnly=False` (нужен доступ из JS)
- Заголовок `X-CSRFToken` для POST/PUT/DELETE/PATCH

### CORS
- Разрешены только `localhost:5173` и `127.0.0.1:5173`
- `CORS_ALLOW_CREDENTIALS=True` для cookie

---

## 📝 Основные сценарии

### Регистрация
1. Пользователь заполняет форму (username, email, password)
2. `authService.register()` отправляет POST на `/api/auth/register/`
3. Backend создаёт пользователя, логинит, генерирует JWT
4. Токены устанавливаются в httpOnly cookie
5. Пользователь сохраняется в `AuthContext`
6. Редирект на главную

### Вход
1. Пользователь вводит username/password
2. `authService.login()` отправляет POST на `/api/auth/login/`
3. Backend проверяет credentials, генерирует JWT
4. Токены устанавливаются в cookie
5. Обновление `AuthContext`

### Обновление профиля
1. Пользователь редактирует данные в `/profile`
2. `authService.updateProfile()` отправляет PUT с CSRF токеном
3. Backend проверяет JWT из cookie и CSRF
4. Данные обновляются

---

## 🧪 Тестирование

```bash
# Backend тесты
python manage.py test

# Frontend линт
cd frontend
npm run lint
```

---

## 📦 Сборка

```bash
# Frontend production сборка
cd frontend
npm run build

# Django collectstatic
python manage.py collectstatic
```

---

## 🔧 Конфигурация

### Переменные окружения (для production)

```bash
# .env (Django)
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com

# .env (Frontend)
VITE_API_URL=https://api.yourdomain.com
```

### Настройки cookie (production)

```python
# settings.py
JWT_AUTH_COOKIE = {
    'access_token': {
        'httponly': True,
        'secure': True,  # Только HTTPS
        'samesite': 'None',  # Для cross-site
        'max_age': 60 * 60,
    },
    'refresh_token': {
        'httponly': True,
        'secure': True,
        'samesite': 'None',
        'max_age': 60 * 60 * 24,
    },
}
```

---

## 📄 Лицензия

MIT
