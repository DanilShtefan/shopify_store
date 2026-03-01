import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { MobileProfile } from './MobileProfile';
import { DesktopProfile } from './DesktopProfile';
import './Profile.css';

export function Profile() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('Profile must be used within AuthProvider');
  }

  const { user, logout, updateUser, error, clearError, isAuthenticated, loading } = context;
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });

  // Загрузка данных пользователя
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/login');
    } else if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
      setFieldErrors({});
    }
  }, [user, navigate, loading, isAuthenticated]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      setFieldErrors({});
      setIsEditing(false);
      clearError?.();
    };
  }, [navigate, clearError]);

  // Парсинг ошибок
  useEffect(() => {
    if (!error) {
      setFieldErrors({});
      return;
    }

    const errors: Record<string, string> = {};

    if (typeof error === 'string') {
      try {
        const parsed = JSON.parse(error);
        if (typeof parsed === 'object' && parsed !== null) {
          Object.entries(parsed).forEach(([key, value]) => {
            errors[key] = Array.isArray(value) ? value[0] : String(value);
          });
        }
      } catch {
        errors._general = error;
      }
    } else if (typeof error === 'object' && error !== null) {
      Object.entries(error).forEach(([key, value]) => {
        errors[key] = Array.isArray(value) ? value[0] : String(value);
      });
    }

    setFieldErrors(errors);
  }, [error]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = async () => {
    const changes: Partial<typeof formData> = {};

    if (formData.username !== user?.username) changes.username = formData.username;
    if (formData.email !== user?.email) changes.email = formData.email;
    if (formData.first_name !== user?.first_name) changes.first_name = formData.first_name;
    if (formData.last_name !== user?.last_name) changes.last_name = formData.last_name;

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

  const handleFormChange = (field: 'username' | 'email' | 'first_name' | 'last_name', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      {/* Мобильная версия (< 900px) */}
      <MobileProfile
        user={user}
        formData={formData}
        isEditing={isEditing}
        fieldErrors={fieldErrors}
        onFormChange={handleFormChange}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onLogout={handleLogout}
      />

      {/* Десктопная версия (≥ 900px) */}
      <DesktopProfile
        user={user}
        formData={formData}
        isEditing={isEditing}
        fieldErrors={fieldErrors}
        onFormChange={handleFormChange}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onLogout={handleLogout}
      />
    </div>
  );
}
