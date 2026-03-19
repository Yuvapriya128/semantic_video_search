// src/components/notes/NoteEditor.tsx
import React, { useState, useEffect } from 'react';
import { FiBold, FiItalic, FiUnderline, FiList, FiImage } from 'react-icons/fi';

interface Props {
  onSave: (content: string) => void;
  initialContent?: string;
}

const NoteEditor: React.FC<Props> = ({ onSave, initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);
  const [showToolbar, setShowToolbar] = useState(true);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="bg-dark-300 rounded-lg overflow-hidden border border-dark-400">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center space-x-1 p-2 border-b border-dark-400 
                      bg-dark-200">
          <button className="p-2 hover:bg-dark-300 rounded text-light-300 
                           hover:text-primary-400 transition-colors">
            <FiBold size={16} />
          </button>
          <button className="p-2 hover:bg-dark-300 rounded text-light-300 
                           hover:text-primary-400 transition-colors">
            <FiItalic size={16} />
          </button>
          <button className="p-2 hover:bg-dark-300 rounded text-light-300 
                           hover:text-primary-400 transition-colors">
            <FiUnderline size={16} />
          </button>
          <div className="w-px h-6 bg-dark-400 mx-1" />
          <button className="p-2 hover:bg-dark-300 rounded text-light-300 
                           hover:text-primary-400 transition-colors">
            <FiList size={16} />
          </button>
          <button className="p-2 hover:bg-dark-300 rounded text-light-300 
                           hover:text-primary-400 transition-colors">
            <FiImage size={16} />
          </button>
        </div>
      )}

      {/* Editor Area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your note here... (Ctrl+Enter to save)"
        className="w-full bg-dark-300 text-white p-3 min-h-[120px] 
                   outline-none resize-none"
      />

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t border-dark-400">
        <span className="text-xs text-light-400">
          {content.length} characters
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setContent('')}
            className="px-3 py-1 text-sm text-light-400 hover:text-white 
                     transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-4 py-1 bg-primary-500 hover:bg-primary-600 
                     text-white text-sm rounded transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;