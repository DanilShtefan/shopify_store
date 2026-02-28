import { Loader2 } from 'lucide-react';
import './PageLoader.css';

export const PageLoader = () => {
  return (
    <div className="page-loader">
      <Loader2 className="spinner" size={48} />
      <p className="loading-text">Загрузка...</p>
    </div>
  );
};
