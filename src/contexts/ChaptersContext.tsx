// src/contexts/ChaptersContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { Chapter } from '../types';

interface ChaptersContextType {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  setChapters: (chapters: Chapter[]) => void;
  setCurrentChapter: (chapter: Chapter | null) => void;
  addChapter: (chapter: Chapter) => void;
  updateChapter: (id: number, updates: Partial<Chapter>) => void;
  deleteChapter: (id: number) => void;
  getChapterAtTime: (time: number) => Chapter | undefined;
}

const ChaptersContext = createContext<ChaptersContextType | undefined>(undefined);

export const ChaptersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

  const addChapter = (chapter: Chapter) => {
    setChapters([...chapters, chapter]);
  };

  const updateChapter = (id: number, updates: Partial<Chapter>) => {
    setChapters(chapters.map(ch => 
      ch.id === id ? { ...ch, ...updates } : ch
    ));
  };

  const deleteChapter = (id: number) => {
    setChapters(chapters.filter(ch => ch.id !== id));
  };

  const getChapterAtTime = (time: number) => {
    return chapters.find(ch => time >= ch.start && time <= ch.end);
  };

  return (
    <ChaptersContext.Provider value={{
      chapters,
      currentChapter,
      setChapters,
      setCurrentChapter,
      addChapter,
      updateChapter,
      deleteChapter,
      getChapterAtTime,
    }}>
      {children}
    </ChaptersContext.Provider>
  );
};

export const useChapters = () => {
  const context = useContext(ChaptersContext);
  if (context === undefined) {
    throw new Error('useChapters must be used within a ChaptersProvider');
  }
  return context;
};