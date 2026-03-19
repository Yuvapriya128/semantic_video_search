// src/components/upload/UrlInput.tsx
import React, { useState } from 'react';
import { FiLink, FiYoutube, FiArrowRight } from 'react-icons/fi';

interface Props {
  type: 'url' | 'youtube';
  onSubmit: (url: string) => void;
}

const UrlInput: React.FC<Props> = ({ type, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(true);

  const validateUrl = (input: string): boolean => {
    if (type === 'youtube') {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      return youtubeRegex.test(input);
    }
    // Basic video URL validation (mp4, webm, etc.)
    const videoRegex = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
    return videoRegex.test(input) || input.startsWith('http');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUrl(url)) {
      setIsValid(true);
      onSubmit(url);
    } else {
      setIsValid(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        {type === 'youtube' ? (
          <FiYoutube className="text-2xl text-red-500" />
        ) : (
          <FiLink className="text-2xl text-primary-500" />
        )}
        <span className="text-white font-medium">
          {type === 'youtube' ? 'Enter YouTube URL' : 'Enter Video URL'}
        </span>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setIsValid(true);
          }}
          placeholder={
            type === 'youtube'
              ? 'https://youtube.com/watch?v=...'
              : 'https://example.com/video.mp4'
          }
          className={`flex-1 bg-dark-300 text-white rounded-lg px-4 py-3 
                     border ${isValid ? 'border-dark-400' : 'border-red-500'} 
                     focus:border-primary-500 outline-none transition-colors`}
        />
        <button
          type="submit"
          className="bg-primary-500 hover:bg-primary-600 text-white 
                     px-6 py-3 rounded-lg transition-colors flex items-center 
                     justify-center space-x-2 whitespace-nowrap"
        >
          <span>Process Video</span>
          <FiArrowRight />
        </button>
      </div>
      
      {!isValid && (
        <p className="text-red-500 text-sm">
          Please enter a valid {type === 'youtube' ? 'YouTube' : 'video'} URL
        </p>
      )}
      
      {type === 'youtube' && (
        <p className="text-light-400 text-sm">
          Supported: YouTube links (public videos only)
        </p>
      )}
    </form>
  );
};

export default UrlInput;