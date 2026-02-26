import { Link } from 'react-router-dom';
import './BackButton.css';

interface BackButtonProps {
  to?: string;
  text?: string;
}

export function BackButton({ to = '/', text = 'Вернуться к товарам' }: BackButtonProps) {
  return (
    <Link to={to} className="back-button">
      <span className="back-arrow">←</span>
      <span className="back-text">{text}</span>
    </Link>
  );
}
