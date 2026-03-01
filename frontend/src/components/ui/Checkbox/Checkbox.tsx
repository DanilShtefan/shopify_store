import { Check } from 'lucide-react';
import './Checkbox.css';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, label, disabled = false, className = '' }: CheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange();
    }
  };

  return (
    <label className={`checkbox-wrapper ${className} ${disabled ? 'disabled' : ''}`}>
      <button
        type="button"
        className={`checkbox ${checked ? 'checked' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        aria-checked={checked}
        role="checkbox"
        tabIndex={disabled ? -1 : 0}
      >
        {checked && <Check size={16} strokeWidth={3} />}
      </button>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
}
