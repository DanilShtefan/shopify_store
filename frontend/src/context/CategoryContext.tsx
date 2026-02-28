import { createContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import { categoryService, type Category } from '../services/categoryService';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  selectCategory: (slug: string | null) => void;
  refreshCategories: () => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data.categories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCategory = useCallback((slug: string | null) => {
    setSelectedCategory(slug);
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        selectedCategory,
        selectCategory,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}
