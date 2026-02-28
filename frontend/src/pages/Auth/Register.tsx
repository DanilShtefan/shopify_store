import { useState, useContext, type FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import './Auth.css';
import { Button } from '../../components/ui/Button/Button';

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

  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);
  const navigate = useNavigate();

  // Очищаем ошибку при монтировании
  useEffect(() => {
    authContext?.clearError();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (authContext?.error) authContext.clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  // Парсинг ошибок
  const getErrors = () => {
    const err = authContext?.error;
    if (!err) return null;
    
    // Если строка - пытаемся распарсить
    if (typeof err === 'string') {
      try {
        return JSON.parse(err);
      } catch {
        return { detail: err };
      }
    }
    
    // Если уже объект
    if (typeof err === 'object' && err !== null) {
      return err;
    }
    
    return { detail: String(err) };
  };

  const errors = getErrors();

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="auth-title">Регистрация</h1>

        {errors && (
          <div className="auth-errors">
            {Object.entries(errors).map(([field, messages]) => (
              <div key={field} className="auth-error">
                <strong>{field === 'detail' ? 'Ошибка' : field}:</strong>{' '}
                {Array.isArray(messages) 
                  ? messages.map((msg, i) => <div key={i}>{msg}</div>)
                  : messages}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
              required
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              required
              disabled={loading}
            />
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">Имя</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="auth-input"
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Фамилия</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="auth-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              required
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Подтверждение пароля</label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              className="auth-input"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="medium"
            fullWidth
            loading={loading}
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