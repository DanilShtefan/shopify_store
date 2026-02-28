import './LogoutButton.css';

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
}

export function LogoutButton({
  children = 'Выход',
  size = 'medium',
  className = '',
  ...props
}: LogoutButtonProps) {
  return (
    <button
      className={`logout-btn logout-btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
