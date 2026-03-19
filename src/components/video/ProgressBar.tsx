import React, { useState, useRef } from 'react';

interface Chapter {
  id: number;
  title: string;
  start: number;
  end: number;
  startFormatted: string;
}

interface Props {
  currentTime: number;
  duration: number;
  chapters: Chapter[];
  onSeek: (time: number) => void;
}

const ProgressBar: React.FC<Props> = ({ currentTime, duration, chapters, onSeek }) => {
  const [hoveredChapter, setHoveredChapter] = useState<Chapter | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = (currentTime / duration) * 100 || 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * duration;
    
    onSeek(seekTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setHoverPosition(percentage);
    setShowPreview(true);

    // Find chapter at this position
    const timeAtPosition = (percentage / 100) * duration;
    const chapter = chapters.find(
      ch => timeAtPosition >= ch.start && timeAtPosition <= ch.end
    );
    
    if (chapter) {
      setHoveredChapter(chapter);
    } else {
      setHoveredChapter(null);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-4 py-2">
      {/* Progress Bar Container - Original smaller size */}
      <div
        ref={progressRef}
        className="relative h-2 bg-dark-300 rounded-full cursor-pointer group"
        onClick={handleProgressClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setShowPreview(false);
          setHoveredChapter(null);
        }}
      >
        {/* Progress Fill */}
        <div
          className="absolute h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />

        {/* Chapter Dividers */}
        {chapters.map((chapter) => {
          const position = (chapter.start / duration) * 100;
          return (
            <div
              key={chapter.id}
              className="absolute top-0 w-0.5 h-full bg-white"
              style={{ 
                left: `${position}%`,
                transform: 'translateX(-50%)',
                opacity: 0.5,
                zIndex: 10
              }}
            />
          );
        })}

        {/* Hover Preview Line */}
        {showPreview && (
          <div
            className="absolute top-0 w-0.5 h-full bg-white"
            style={{ 
              left: `${hoverPosition}%`,
              transform: 'translateX(-50%)',
              zIndex: 20,
              opacity: 0.8
            }}
          />
        )}

        {/* Chapter Tooltip */}
        {hoveredChapter && (
          <div
            className="absolute -top-12 transform -translate-x-1/2 
                       bg-dark-200 text-white px-2 py-1 rounded text-xs
                       border border-primary-500 whitespace-nowrap z-30"
            style={{ left: `${hoverPosition}%` }}
          >
            {hoveredChapter.title}
          </div>
        )}
      </div>

      {/* Time Display - Below progress bar like before */}
      <div className="flex justify-between text-xs text-light-400 mt-1">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <span className="font-mono">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;