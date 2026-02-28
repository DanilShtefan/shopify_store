import { useState, useContext, type FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import './Auth.css';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';

interface LockoutState {
  isLocked: boolean;
  remainingSeconds: number;
  message: string;
}

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockout, setLockout] = useState<LockoutState | null>(null);

  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);
  const navigate = useNavigate();

  // Если уже авторизован - редирект на главную
  useEffect(() => {
    if (authContext?.isAuthenticated) {
      navigate('/');
    }
  }, [authContext?.isAuthenticated, navigate]);

  // Очищаем ошибку при монтировании
  useEffect(() => {
    authContext?.clearError();
    setLockout(null);
  }, []);

  // Очищаем ошибку при уходе со страницы
  useEffect(() => {
    return () => {
      authContext?.clearError();
      setLockout(null);
    };
  }, []);

  // Таймер обратного отсчёта для блокировки
  useEffect(() => {
    if (!lockout?.isLocked || lockout.remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockout(prev => {
        if (!prev || prev.remainingSeconds <= 1) {
          clearInterval(timer);
          return { isLocked: false, remainingSeconds: 0, message: '' };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockout?.isLocked, lockout?.remainingSeconds]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await authContext?.login({ username, password });

    if (success) {
      toastContext?.showToast('Вы успешно вошли!', 'success');
      navigate('/');
      setLockout(null);
    }

    setLoading(false);
  };

  const error = authContext?.error;

  // Получаем текст ошибки
  const getErrorMessage = () => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
      // Проверяем, есть ли информация о блокировке
      if ('locked' in error && error.locked === true) {
        setLockout({
          isLocked: true,
          remainingSeconds: error.remaining_seconds || 0,
          message: error.message || '',
        });
        return error.error || 'Аккаунт заблокирован';
      }
      
      const firstKey = Object.keys(error)[0];
      const firstError = error[firstKey];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
    return String(error);
  };

  const errorMessage = getErrorMessage();

  // Форматирование времени для отображения
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="auth-title">Вход</h1>

        {lockout?.isLocked ? (
          <div className="auth-lockout">
            <div className="auth-lockout-icon">🔒</div>
            <h3 className="auth-lockout-title">Аккаунт заблокирован</h3>
            <p className="auth-lockout-message">
              {lockout.message || 'Слишком много неудачных попыток входа'}
            </p>
            {lockout.remainingSeconds > 0 && (
              <div className="auth-lockout-timer">
                <span className="auth-lockout-time">{formatTime(lockout.remainingSeconds)}</span>
              </div>
            )}
            <p className="auth-lockout-hint">
              Подождите указанное время и попробуйте снова
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}

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