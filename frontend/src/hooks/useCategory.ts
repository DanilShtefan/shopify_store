import { useContext } from 'react';
import { CategoryContext } from '../context/CategoryContext';

export function useCategory() {
  const context = useContext(CategoryContext);

  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }

  return context;
}
