import { useState, useContext, type FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import './Auth.css';

export function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);
  const navigate = useNavigate();

  // Очищаем ошибку при монтировании
  useEffect(() => {
    authContext?.clearError();
    setFieldErrors({});
  }, []);

  // Очищаем ошибку при уходе со страницы
  useEffect(() => {
    return () => {
      authContext?.clearError();
      setFieldErrors({});
    };
  }, []);

  // Парсим ошибки при сохранении
  useEffect(() => {
    setFieldErrors({});  // Сначала очищаем
    
    if (authContext?.error) {
      const errors: {[key: string]: string} = {};
      const err = authContext.error;

      // Если строка - пытаемся распарсить
      if (typeof err === 'string') {
        try {
          const parsed = JSON.parse(err);
          if (typeof parsed === 'object' && parsed !== null) {
            Object.entries(parsed).forEach(([key, value]) => {
              errors[key] = Array.isArray(value) ? value[0] : String(value);
            });
          }
        } catch {
          errors._general = err;
        }
      }
      // Если объект
      else if (typeof err === 'object' && err !== null) {
        Object.entries(err).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
      }

      setFieldErrors(errors);
    }
  }, [authContext?.error]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await authContext?.register(formData);

    if (success) {
      toastContext?.showToast('Аккаунт создан!', 'success');
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="auth-title">Регистрация</h1>

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            placeholder="Введите имя пользователя"
            value={formData.username}
            onChange={(e) => {
              setFormData({ ...formData, username: e.target.value });
              if (fieldErrors.username) {
                const newErrors = { ...fieldErrors };
                delete newErrors.username;
                setFieldErrors(newErrors);
              }
            }}
            error={fieldErrors.username}
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            placeholder="example@test.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (fieldErrors.email) {
                const newErrors = { ...fieldErrors };
                delete newErrors.email;
                setFieldErrors(newErrors);
              }
            }}
            error={fieldErrors.email}
            disabled={loading}
          />

          <div className="auth-row">
            <Input
              label="Имя"
              type="text"
              placeholder="Введите имя"
              value={formData.first_name}
              onChange={(e) => {
                setFormData({ ...formData, first_name: e.target.value });
                if (fieldErrors.first_name) {
                  const newErrors = { ...fieldErrors };
                  delete newErrors.first_name;
                  setFieldErrors(newErrors);
                }
              }}
              error={fieldErrors.first_name}
              disabled={loading}
            />

            <Input
              label="Фамилия"
              type="text"
              placeholder="Введите фамилию"
              value={formData.last_name}
              onChange={(e) => {
                setFormData({ ...formData, last_name: e.target.value });
                if (fieldErrors.last_name) {
                  const newErrors = { ...fieldErrors };
                  delete newErrors.last_name;
                  setFieldErrors(newErrors);
                }
              }}
              error={fieldErrors.last_name}
              disabled={loading}
            />
          </div>

          <Input
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (fieldErrors.password) {
                const newErrors = { ...fieldErrors };
                delete newErrors.password;
                setFieldErrors(newErrors);
              }
            }}
            error={fieldErrors.password}
            disabled={loading}
          />

          <Input
            label="Подтверждение пароля"
            type="password"
            placeholder="Повторите пароль"
            value={formData.password2}
            onChange={(e) => {
              setFormData({ ...formData, password2: e.target.value });
              if (fieldErrors.password2) {
                const newErrors = { ...fieldErrors };
                delete newErrors.password2;
                setFieldErrors(newErrors);
              }
            }}
            error={fieldErrors.password2}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="medium"
            fullWidth
            loading={loading}
            disabled={Object.keys(fieldErrors).length > 0 || loading}
            className="auth-button-animate"
          >
            Зарегистрироваться
          </Button>
        </form>

        <p className="auth-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}