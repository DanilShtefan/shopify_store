import './IconButton.css';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger';
}

export function IconButton({
  children,
  variant = 'default',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`icon-btn ${variant === 'danger' ? 'icon-btn-danger' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
