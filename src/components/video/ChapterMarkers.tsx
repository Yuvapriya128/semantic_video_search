// src/components/video/ChapterMarkers.tsx
import React from 'react';
import { Chapter } from '../../types';

interface Props {
  chapters: Chapter[];
  duration: number;
  currentTime: number;
  onChapterHover: (chapter: Chapter | null) => void;
}

const ChapterMarkers: React.FC<Props> = ({
  chapters,
  duration,
  currentTime,
  onChapterHover,
}) => {
  return (
    <>
      {chapters.map((chapter, index) => {
        const position = (chapter.start / duration) * 100;
        const isActive = currentTime >= chapter.start && currentTime <= chapter.end;
        
        return (
          <div
            key={index}
            className="absolute top-0 bottom-0"
            style={{ left: `${position}%` }}
          >
            {/* Chapter Marker Line */}
            <div
              className={`absolute top-0 w-0.5 h-full transition-all duration-200
                         ${isActive ? 'bg-primary-500' : 'bg-white'}`}
              style={{ 
                opacity: isActive ? 1 : 0.3,
                transform: 'translateX(-50%)'
              }}
              onMouseEnter={() => onChapterHover(chapter)}
              onMouseLeave={() => onChapterHover(null)}
            />
            
            {/* Chapter Start Dot */}
            <div
              className={`absolute -top-1 left-1/2 transform -translate-x-1/2 
                          w-2 h-2 rounded-full transition-all duration-200
                          ${isActive ? 'bg-primary-500 scale-150' : 'bg-white'}`}
              style={{ opacity: isActive ? 1 : 0.5 }}
            />
          </div>
        );
      })}
    </>
  );
};

export default ChapterMarkers;