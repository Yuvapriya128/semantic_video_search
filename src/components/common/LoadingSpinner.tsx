import React from 'react';

interface Props {
  message?: string;
}

const LoadingSpinner: React.FC<Props> = ({ message = 'Processing...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        {/* Inner circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 bg-primary-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="mt-6 text-light-400 text-lg">{message}</p>
      <p className="mt-2 text-light-500 text-sm">This may take a few moments...</p>
    </div>
  );
};

export default LoadingSpinner;