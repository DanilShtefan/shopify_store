import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { LogoutButton } from '../../components/ui/LogoutButton/LogoutButton';
import './Profile.css';

export function Profile() {
  const { user, logout, updateUser, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
      setFieldErrors({});
    }
  }, [user, navigate]);

  // Очищаем ошибки при уходе со страницы
  useEffect(() => {
    return () => {
      setFieldErrors({});
      setIsEditing(false);
      clearError?.();
      if (user) {
        setFormData({
          username: user.username || '',
          email: user.email || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
        });
      }
    };
  }, [navigate, user, clearError]);

  // Парсим ошибки при сохранении
  useEffect(() => {
    if (error) {
      const errors: {[key: string]: string} = {};

      // Если error - это строка (JSON)
      if (typeof error === 'string') {
        try {
          const parsed = JSON.parse(error);
          if (typeof parsed === 'object' && parsed !== null) {
            Object.entries(parsed).forEach(([key, value]) => {
              errors[key] = Array.isArray(value) ? value[0] : String(value);
            });
          }
        } catch {
          // Не JSON, используем как общую ошибку
          errors._general = error;
        }
      }
      // Если error - это объект
      else if (typeof error === 'object' && error !== null) {
        Object.entries(error).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
      }

      setFieldErrors(errors);
    }
  }, [error]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = async () => {
    // Сравниваем изменения
    const changes: {
      username?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
    } = {};
    
    if (formData.username !== user?.username) changes.username = formData.username;
    if (formData.email !== user?.email) changes.email = formData.email;
    if (formData.first_name !== user?.first_name) changes.first_name = formData.first_name;
    if (formData.last_name !== user?.last_name) changes.last_name = formData.last_name;
    
    // Если есть изменения - сохраняем
    if (Object.keys(changes).length > 0) {
      const success = await updateUser(changes);
      if (success) {
        setIsEditing(false);
        setFieldErrors({});
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
    setFieldErrors({});
    setIsEditing(false);
  };

  if (!user) return null;

  const firstLetter = user.username.charAt(0).toUpperCase();

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {firstLetter}
          </div>
          <h1 className="profile-title">{user.username}</h1>
        </div>

        <div className="profile-body">
          <div className="profile-field">
            <Input
              label="Имя пользователя"
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
              disabled={!isEditing}
            />
          </div>

          <div className="profile-field">
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
              disabled={!isEditing}
            />
          </div>

          <div className="profile-field">
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
              disabled={!isEditing}
            />
          </div>

          <div className="profile-field">
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
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="profile-footer">
          {isEditing ? (
            <>
              <Button variant="outline" size="medium" onClick={handleCancel}>
                Отмена
              </Button>
              <Button variant="primary" size="medium" onClick={handleSave} disabled={Object.keys(fieldErrors).length > 0 || !formData.username || !formData.email}>
                Сохранить
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="medium" onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
              <LogoutButton size="medium" onClick={handleLogout}>
                Выход
              </LogoutButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
