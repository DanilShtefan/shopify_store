import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { LogoutButton } from '../../components/ui/LogoutButton/LogoutButton';
import type { User as UserType } from '../../services/authService';
import type { ChangeEvent } from 'react';
import './Profile.css';

interface ProfileCardProps {
  user: UserType;
  formData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  isEditing: boolean;
  fieldErrors: Record<string, string>;
  onFormChange: (field: 'username' | 'email' | 'first_name' | 'last_name', value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onLogout: () => void;
}

export function ProfileCard({
  user,
  formData,
  isEditing,
  fieldErrors,
  onFormChange,
  onEdit,
  onSave,
  onCancel,
  onLogout,
}: ProfileCardProps) {
  const firstLetter = user.username.charAt(0).toUpperCase();

  return (
    <div className="profile-card">
      {/* Header с аватаром */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {firstLetter}
        </div>
        <h1 className="profile-title">{user.username}</h1>
      </div>

      {/* Тело профиля */}
      <div className="profile-body">
        <div className="profile-field">
          <Input
            label="Имя пользователя"
            type="text"
            placeholder="Введите имя пользователя"
            value={formData.username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('username', e.target.value)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('email', e.target.value)}
            error={fieldErrors.email}
            disabled={!isEditing}
          />
        </div>

        <div className="profile-field-row">
          <div className="profile-field">
            <Input
              label="Имя"
              type="text"
              placeholder="Введите имя"
              value={formData.first_name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('first_name', e.target.value)}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('last_name', e.target.value)}
              error={fieldErrors.last_name}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Footer с кнопками */}
      <div className="profile-footer">
        {isEditing ? (
          <>
            <Button variant="outline" size="medium" onClick={onCancel}>
              Отмена
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={onSave}
              disabled={Object.keys(fieldErrors).length > 0 || !formData.username || !formData.email}
            >
              Сохранить
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="medium" onClick={onEdit}>
              Редактировать
            </Button>
            <LogoutButton size="medium" onClick={onLogout}>
              Выход
            </LogoutButton>
          </>
        )}
      </div>
    </div>
  );
}
