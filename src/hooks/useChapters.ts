// src/hooks/useChapters.ts
import { useState, useEffect } from 'react';
import { Chapter } from '../types';
import { mockChapters } from '../services/mockData';

export const useChapters = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const loadChapters = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setChapters(mockChapters);
        setError(null);
      } catch (err) {
        setError('Failed to load chapters');
      } finally {
        setIsLoading(false);
      }
    };

    loadChapters();
  }, []);

  const getChapterAtTime = (time: number): Chapter | undefined => {
    return chapters.find(ch => time >= ch.start && time <= ch.end);
  };

  const updateCurrentChapter = (time: number) => {
    const chapter = getChapterAtTime(time);
    if (chapter) {
      setCurrentChapter(chapter);
    }
  };

  return {
    chapters,
    currentChapter,
    isLoading,
    error,
    getChapterAtTime,
    updateCurrentChapter,
  };
};