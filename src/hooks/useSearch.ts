// src/hooks/useSearch.ts
import { useState } from 'react';
import { SearchResult } from '../types';
import { videoAPI } from '../services/api';

export const useSearch = (videoId: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data: any = await videoAPI.searchVideo(videoId, query);

      // backend response
      setResults(data?.results || []);

    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
};
