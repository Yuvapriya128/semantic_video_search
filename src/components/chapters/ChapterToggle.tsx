// src/components/chapters/ChapterToggle.tsx
import React from 'react';
import { FiMenu, FiChevronLeft } from 'react-icons/fi';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const ChapterToggle: React.FC<Props> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="absolute left-4 top-1/2 transform -translate-y-1/2 
                 bg-dark-200 hover:bg-dark-300 text-white 
                 rounded-lg p-3 shadow-xl transition-all duration-300
                 border border-primary-500 border-opacity-50
                 hover:border-opacity-100 group z-10"
      style={{
        left: isOpen ? '24rem' : '1rem',
      }}
    >
      {isOpen ? (
        <FiChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      ) : (
        <FiMenu size={20} className="group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
};

export default ChapterToggle;