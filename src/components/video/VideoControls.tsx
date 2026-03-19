// src/components/video/VideoControls.tsx
import React from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiSearch, FiFileText } from 'react-icons/fi';

interface Props {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSearch: () => void;
  onNotes: () => void;
  currentTime: number;
  duration: number;
  formatTime: (time: number) => string;
}

const VideoControls: React.FC<Props> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onSearch,
  onNotes,
  currentTime,
  duration,
  formatTime,
}) => {
  return (
    <div className="flex items-center justify-center space-x-6 px-4 py-2">
      {/* Current Time Display */}
      <span className="text-white text-sm font-mono">
        {formatTime(currentTime)}
      </span>

      {/* Control Buttons */}
      <div className="flex items-center space-x-4">
        {/* Search Button */}
        <button
          onClick={onSearch}
          className="text-white hover:text-primary-400 transition-colors p-2"
          title="Search in video"
        >
          <FiSearch size={20} />
        </button>

        {/* Previous Chapter */}
        <button
          onClick={onPrev}
          className="text-white hover:text-primary-400 transition-colors p-2"
          title="Previous chapter"
        >
          <FiSkipBack size={24} />
        </button>

        {/* Play/Pause Button - Rounded */}
        <button
          onClick={onPlayPause}
          className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 
                     text-white flex items-center justify-center transition-all
                     transform hover:scale-105 shadow-lg"
        >
          {isPlaying ? <FiPause size={28} /> : <FiPlay size={28} className="ml-1" />}
        </button>

        {/* Next Chapter */}
        <button
          onClick={onNext}
          className="text-white hover:text-primary-400 transition-colors p-2"
          title="Next chapter"
        >
          <FiSkipForward size={24} />
        </button>

        {/* Notes Button */}
        <button
          onClick={onNotes}
          className="text-white hover:text-primary-400 transition-colors p-2"
          title="Take notes"
        >
          <FiFileText size={20} />
        </button>
      </div>

      {/* Duration Display */}
      <span 
        className="text-white text-sm font-mono cursor-pointer hover:text-primary-400"
        onClick={() => {}}
        title="Click to toggle remaining/total time"
      >
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default VideoControls;