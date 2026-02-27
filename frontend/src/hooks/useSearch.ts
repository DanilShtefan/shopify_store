import { useState, useCallback } from 'react';
import { searchService, type SearchResult } from '../services/searchService';

interface UseSearchResult {
  results: SearchResult[];
  query: string;
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

export function useSearch(): UseSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchService.search(searchQuery);
      setResults(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
  }, []);

  return { results, query, loading, error, search, clearResults };
}
