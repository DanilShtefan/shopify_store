import { useState, useContext, type FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import './Auth.css';
import { Button } from '../../components/ui/Button/Button';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (authContext?.error) authContext.clearError();
    if (e.target.type === 'text') setUsername(e.target.value);
    else setPassword(e.target.value);
  };

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
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={handleChange}
              className="auth-input"
              required
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Пароль</label>
            <input
              type="password"
              value={password}
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