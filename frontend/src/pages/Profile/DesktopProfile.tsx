import { Addresses } from '../../components/ui/Addresses/Addresses';
import type { User as UserType } from '../../services/authService';
import { ProfileCard } from './ProfileCard';
import './Profile.css';

interface DesktopProfileProps {
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

export function DesktopProfile({
  user,
  formData,
  isEditing,
  fieldErrors,
  onFormChange,
  onEdit,
  onSave,
  onCancel,
  onLogout,
}: DesktopProfileProps) {
  return (
    <div className="profile-card-desktop">
      {/* Левая колонка - профиль (sticky) */}
      <div className="profile-left-col">
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
      </div>

      {/* Правая колонка - адреса */}
      <div className="profile-right-col">
        <div className="addresses-card">
          <Addresses />
        </div>
      </div>
    </div>
  );
}
