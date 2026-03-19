// src/components/chapters/ChapterSidebar.tsx
import React from 'react';
import { FiX, FiClock, FiBookOpen } from 'react-icons/fi';
import ChapterItem from './ChapterItem';
import { Chapter } from '../../types';

interface Props {
  chapters: Chapter[];
  currentChapter?: Chapter;
  onChapterSelect: (timestamp: number) => void;
  onClose: () => void;
}

const ChapterSidebar: React.FC<Props> = ({
  chapters,
  currentChapter,
  onChapterSelect,
  onClose,
}) => {
  return (
    <div className="absolute top-0 left-0 w-96 h-full glass-effect 
                    border-r border-primary-500 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-300">
        <div className="flex items-center space-x-2">
          <FiBookOpen className="text-primary-400" size={20} />
          <h3 className="text-white font-semibold">Chapters</h3>
          <span className="bg-dark-300 text-light-300 text-xs px-2 py-1 rounded-full">
            {chapters.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-light-400 hover:text-white transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {chapters.map((chapter, index) => (
            <ChapterItem
              key={index}
              chapter={chapter}
              index={index}
              isActive={currentChapter?.id === chapter.id}
              onSelect={() => onChapterSelect(chapter.start)}
            />
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-dark-300 bg-dark-300 bg-opacity-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-light-400">Total Duration</span>
          <span className="text-white font-mono">
            {formatTotalDuration(chapters)}
          </span>
        </div>
      </div>
    </div>
  );
};

const formatTotalDuration = (chapters: Chapter[]): string => {
  if (chapters.length === 0) return '00:00:00';
  const lastChapter = chapters[chapters.length - 1];
  return lastChapter.endFormatted;
};

export default ChapterSidebar;