import { User } from 'lucide-react';
import { Addresses } from '../../components/ui/Addresses/Addresses';
import type { User as UserType } from '../../services/authService';
import { ProfileCard } from './ProfileCard';
import './Profile.css';

interface MobileProfileProps {
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

export function MobileProfile({
  user,
  formData,
  isEditing,
  fieldErrors,
  onFormChange,
  onEdit,
  onSave,
  onCancel,
  onLogout,
}: MobileProfileProps) {
  return (
    <div className="profile-card-single">
      {/* Карточка профиля */}
      <ProfileCard
        user={user}
        formData={formData}
        isEditing={isEditing}
        fieldErrors={fieldErrors}
        onFormChange={onFormChange}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        onLogout={onLogout}
      />

      {/* Разделитель */}
      <div className="profile-section-divider">
        <h3 className="profile-subtitle">
          <User size={18} />
          Адреса доставки
        </h3>
      </div>

      {/* Секция адресов */}
      <div className="profile-addresses-inline">
        <Addresses />
      </div>
    </div>
  );
}
