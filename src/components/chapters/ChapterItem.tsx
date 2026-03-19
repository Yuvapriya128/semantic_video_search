// src/components/chapters/ChapterItem.tsx
import React, { useState } from 'react';
import { FiPlay, FiCheckCircle, FiClock } from 'react-icons/fi'; // Make sure FiClock is here
import { Chapter } from '../../types';

interface Props {
  chapter: Chapter;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

const ChapterItem: React.FC<Props> = ({
  chapter,
  index,
  isActive,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative rounded-lg transition-all cursor-pointer
                 ${isActive 
                   ? 'bg-primary-500 bg-opacity-20 border-primary-500' 
                   : 'hover:bg-dark-300 border-transparent'
                 } border`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="p-3">
        <div className="flex items-start space-x-3">
          {/* Chapter Number/Status */}
          <div className="flex-shrink-0">
            {isActive ? (
              <FiCheckCircle className="text-primary-400" size={20} />
            ) : isHovered ? (
              <FiPlay className="text-primary-400" size={20} />
            ) : (
              <span className="text-light-400 text-sm font-mono">
                {(index + 1).toString().padStart(2, '0')}
              </span>
            )}
          </div>

          {/* Chapter Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium truncate
                          ${isActive ? 'text-primary-400' : 'text-white'}`}>
              {chapter.title}
            </h4>
            {chapter.summary && (
              <p className="text-xs text-light-400 mt-1 line-clamp-2">
                {chapter.summary}
              </p>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex-shrink-0 flex items-center space-x-1 text-xs">
            <FiClock className="text-light-400" size={12} />
            <span className="text-light-400 font-mono">
              {chapter.startFormatted}
            </span>
          </div>
        </div>

        {/* Progress Indicator for Active Chapter */}
        {isActive && (
          <div className="mt-2 w-full bg-dark-400 rounded-full h-1">
            <div 
              className="bg-primary-500 h-1 rounded-full transition-all duration-300"
              style={{ width: '45%' }} // This would be dynamic in real implementation
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterItem;