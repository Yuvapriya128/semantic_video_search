// src/components/upload/DragDropZone.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiAlertCircle } from 'react-icons/fi';

interface Props {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
}

const DragDropZone: React.FC<Props> = ({ onFileSelect, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [rejectedFile, setRejectedFile] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Clear previous rejected file message
    setRejectedFile(null);
    
    if (rejectedFiles.length > 0) {
      const rejectedFile = rejectedFiles[0];
      const error = rejectedFile.errors[0];
      
      let errorMessage = '';
      if (error.code === 'file-too-large') {
        errorMessage = 'File is too large. Maximum size is 2GB';
      } else if (error.code === 'file-invalid-type') {
        errorMessage = `Invalid file type. Please select a video file (${rejectedFile.file.type || 'unknown format'})`;
      } else {
        errorMessage = 'File validation failed';
      }
      
      setRejectedFile(errorMessage);
      if (onError) onError(errorMessage);
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, onError]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.mpeg', '.3gp', '.wmv', '.flv']
    },
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    maxFiles: 1,
    noClick: true, // Disable click to open (we'll handle manually)
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handleButtonClick = () => {
    open();
  };

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
        ${isDragging || isDragActive
          ? 'border-primary-500 bg-primary-500 bg-opacity-10 scale-105' 
          : rejectedFile
            ? 'border-red-500 bg-red-500 bg-opacity-5'
            : 'border-dark-300 hover:border-primary-400 hover:bg-dark-300'
        }`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center">
        {rejectedFile ? (
          <>
            <FiAlertCircle className="text-6xl text-red-500 mb-4" />
            <p className="text-xl text-white mb-2">Invalid File</p>
            <p className="text-red-400 mb-4">{rejectedFile}</p>
            <button
              onClick={handleButtonClick}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Another File
            </button>
          </>
        ) : isDragging || isDragActive ? (
          <>
            <FiUploadCloud className="text-6xl text-primary-500 mb-4 animate-bounce" />
            <p className="text-xl text-white mb-2">Drop your video here</p>
            <p className="text-light-400">Release to upload</p>
          </>
        ) : (
          <>
            <FiFile className="text-6xl text-light-400 mb-4" />
            <p className="text-xl text-white mb-2">Drag & drop your video here</p>
            <p className="text-light-400 mb-4">or</p>
            <button
              onClick={handleButtonClick}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Browse Files
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DragDropZone;