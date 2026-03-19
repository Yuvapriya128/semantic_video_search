// src/components/search/SearchResults.tsx

import React from 'react';
import { FiClock } from 'react-icons/fi';
import { SearchResult } from '../../types';

interface Props {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
}

const SearchResults: React.FC<Props> = ({ results, onResultClick }) => {

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-light-400">No results found</p>
        <p className="text-sm text-light-500 mt-2">
          Try asking a different question or browse the chapters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result, index) => (
        <button
          key={index}
          onClick={() => onResultClick(result)}
          className="w-full text-left group"
        >
          <div className="bg-dark-300 rounded-lg p-4 hover:bg-dark-400
                        transition-all transform hover:scale-102
                        hover:shadow-lg border border-transparent
                        hover:border-primary-500">

            {/* Chapter Title */}
            <div className="text-white text-lg font-medium
                          group-hover:text-primary-400
                          transition-colors">
              {result.chapter}
            </div>

            {/* Timestamp */}
            <div className="flex items-center space-x-2 mt-2 text-sm">
              <FiClock className="text-primary-400" size={14} />
              <span className="text-light-300 font-mono">
                {result.start_time}
              </span>
            </div>

          </div>
        </button>
      ))}
    </div>
  );
};

export default SearchResults;
