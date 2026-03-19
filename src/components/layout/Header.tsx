// src/components/layout/Header.tsx
import React from 'react';
import { FiMenu, FiSettings, FiUser } from 'react-icons/fi';

interface Props {
  onMenuClick?: () => void;
}

const Header: React.FC<Props> = ({ onMenuClick }) => {
  return (
    <header className="bg-dark-200 border-b border-dark-300 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="text-light-300 hover:text-primary-400 transition-colors"
          >
            <FiMenu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <img src="/assets/logo.svg" alt="Semantic Seeker" className="h-8" />
            <span className="text-white font-semibold text-lg hidden sm:inline">
              Semantic Seeker
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="control-button">
            <FiSettings size={20} />
          </button>
          <button className="control-button">
            <FiUser size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;