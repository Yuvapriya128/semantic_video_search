import React, { useState } from 'react';
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi';
import { videoAPI } from '../../services/api';

interface SearchResult {
  id: number;
  text: string;
  timestamp: number;
  timestampFormatted: string;
  score: number;
  chapter: string;
}

interface Props {
  videoId?: string;
  onClose: () => void;
  onTimestampSelect: (timestamp: number) => void;
}

const SearchPanel: React.FC<Props> = ({ videoId, onClose, onTimestampSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock search function - replace with actual API call
  const performSearch = async (searchQuery: string) => {

    if (!videoId) return;

    setIsLoading(true);
    setHasSearched(true);

    try {

      const response: any = await videoAPI.searchVideo(videoId, searchQuery);

      const mappedResults: SearchResult[] = (response.results || []).map((r: any, index: number) => ({
        id: index,
        text: r.text,
        timestamp: r.timestamp,
        timestampFormatted: new Date(r.timestamp * 1000).toISOString().substr(11, 8),
        score: r.score,
        chapter: r.chapter || "Result"
      }));

      setResults(mappedResults);

    } catch (error) {

      console.error("Search failed", error);
      setResults([]);

    }

  setIsLoading(false);
};


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.9) return 'text-green-500';
    if (score > 0.8) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-dark-200 border-t border-primary-500 
                    shadow-2xl rounded-t-2xl overflow-hidden z-50"
         style={{ height: '40vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-300">
        <h3 className="text-white font-semibold flex items-center">
          <FiSearch className="mr-2 text-primary-400" />
          Search in Video
        </h3>
        <button
          onClick={onClose}
          className="text-light-400 hover:text-white transition-colors p-2 hover:bg-dark-300 rounded-lg"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="p-4 border-b border-dark-300">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the video content..."
              className="w-full bg-dark-300 text-white rounded-lg pl-10 pr-4 py-3 
                       border border-dark-400 focus:border-primary-500 
                       outline-none transition-colors"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-800 
                     disabled:opacity-50 text-white px-8 py-3 rounded-lg 
                     transition-colors font-medium"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Search tips */}
        <p className="text-xs text-light-400 mt-2">
          Try: "What is semantic search?", "Explain embeddings", "Show me the demo"
        </p>
      </form>

      {/* Results */}
      <div className="p-4 overflow-y-auto" style={{ height: 'calc(40vh - 140px)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-light-400">Searching video content...</p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => {
                  onTimestampSelect(result.timestamp);
                  onClose();
                }}
                className="w-full text-left group"
              >
                <div className="bg-dark-300 hover:bg-dark-400 rounded-lg p-4 
                              transition-all transform hover:scale-[1.02] 
                              border border-transparent hover:border-primary-500">
                  {/* Result Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-white group-hover:text-primary-400 
                                 transition-colors line-clamp-2">
                        {result.text}
                      </p>
                    </div>
                  </div>

                  {/* Result Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs bg-primary-500 bg-opacity-20 text-primary-400 
                                     px-2 py-1 rounded-full">
                        {result.chapter}
                      </span>
                      <div className="flex items-center text-light-400 text-sm">
                        <FiClock className="mr-1" size={14} />
                        <span className="font-mono">{result.timestampFormatted}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-light-400 text-lg">No results found</p>
            <p className="text-light-500 text-sm mt-2">
              Try different keywords or browse the chapters
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-light-400 text-lg">Ask anything about the video</p>
            <p className="text-light-500 text-sm mt-2">
              Get instant answers with timestamps
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;