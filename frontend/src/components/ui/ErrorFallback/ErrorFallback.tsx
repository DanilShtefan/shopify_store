import { Button } from '../Button/Button';
import './ErrorFallback.css';

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
  
  return (
    <div className="error-fallback" role="alert">
      <h2>Что-то пошло не так</h2>
      <pre className="error-message">{errorMessage}</pre>
      <Button variant="primary" onClick={resetErrorBoundary}>
        Попробовать снова
      </Button>
    </div>
  );
}