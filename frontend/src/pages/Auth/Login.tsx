import { useState, useContext, type FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import './Auth.css';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);
  const navigate = useNavigate();

  // Очищаем ошибку при монтировании
  useEffect(() => {
    authContext?.clearError();
  }, []);

  // Очищаем ошибку при уходе со страницы
  useEffect(() => {
    return () => {
      authContext?.clearError();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await authContext?.login({ username, password });

    if (success) {
      toastContext?.showToast('Вы успешно вошли!', 'success');
      navigate('/');
    }

    setLoading(false);
  };

  const error = authContext?.error;

  // Получаем текст ошибки
  const getErrorMessage = () => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
      const firstKey = Object.keys(error)[0];
      const firstError = error[firstKey];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
    return String(error);
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="auth-title">Вход</h1>

        {errorMessage && (
          <div className="auth-errors">
            <div className="auth-error">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            placeholder="Введите имя пользователя"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (authContext?.error) authContext.clearError();
            }}
            disabled={loading}
          />

          <Input
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (authContext?.error) authContext.clearError();
            }}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="medium"
            fullWidth
            loading={loading}
            disabled={!!authContext?.error || loading}
            className="auth-button-animate"
          >
            Войти
          </Button>
        </form>

        <p className="auth-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
        <p className="auth-link animate-delay">
          <Link to="/">На главную</Link>
        </p>
      </div>
    </div>
  );
}