import React, { useState, useRef, useEffect } from 'react';
import { FiVolume, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi';

interface Props {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

const VolumeControl: React.FC<Props> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}) => {
  const [showSlider, setShowSlider] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <FiVolumeX size={20} />;
    if (volume < 0.3) return <FiVolume size={20} />;
    if (volume < 0.7) return <FiVolume1 size={20} />;
    return <FiVolume2 size={20} />;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setShowSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={sliderRef}>
      <button
        onClick={onToggleMute}
        onMouseEnter={() => setShowSlider(true)}
        className="text-white hover:text-primary-400 transition-colors p-2"
      >
        {getVolumeIcon()}
      </button>
      
      {showSlider && (
        <div 
          className="absolute bottom-full right-0 mb-2 bg-dark-200 rounded-lg 
                     p-4 shadow-xl border border-dark-300"
          onMouseLeave={() => setShowSlider(false)}
        >
          <div className="h-24 flex flex-col items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="h-24 w-1 bg-dark-300 rounded-lg appearance-none 
                         cursor-pointer volume-slider"
              style={{
                transform: 'rotate(0deg)',
              }}
            />
            <span className="text-xs text-light-400 mt-2">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolumeControl;