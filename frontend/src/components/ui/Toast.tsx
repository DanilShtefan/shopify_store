import './Toast.css';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
        >
          <span className="toast-message">{toast.message}</span>
          <button 
            className="toast-close"
            onClick={() => onRemove(toast.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}