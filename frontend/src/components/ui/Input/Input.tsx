import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full-width' : ''} ${error ? 'input-has-error' : ''} ${className}`}>
      {label && (
        <label className="input-label">
          <span className="input-error-icon">*</span>
          {label}
        </label>
      )}
      <input className="input-field" {...props} />
      <span className="input-error-text">{error}</span>
    </div>
  );
}
