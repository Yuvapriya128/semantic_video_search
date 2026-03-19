// src/components/upload/VideoUpload.tsx

import React, { useState, useRef } from 'react';
import { FiUpload, FiLink, FiYoutube, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import DragDropZone from './DragDropZone';
import { videoAPI } from '../../services/api';

interface Props {
  onVideoSubmit: (source: { url: string; type: 'local' | 'youtube' | 'direct' }) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];

const SUPPORTED_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska'
];

const VideoUpload: React.FC<Props> = ({ onVideoSubmit }) => {

  const [uploadMethod, setUploadMethod] = useState<'dragdrop' | 'url' | 'youtube'>('dragdrop');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {

    if (!file) {
      return { isValid: false, errorMessage: 'No file selected' };
    }

    if (!file.type.startsWith('video/')) {
      return {
        isValid: false,
        errorMessage: `'${file.name}' is not a video file`
      };
    }

    const isSupportedMime = SUPPORTED_MIME_TYPES.includes(file.type);

    if (!isSupportedMime) {
      return {
        isValid: false,
        errorMessage: `Unsupported format: ${file.type}`
      };
    }

    if (file.size > MAX_FILE_SIZE) {

      const sizeInGB = (file.size / (1024 * 1024 * 1024)).toFixed(2);

      return {
        isValid: false,
        errorMessage: `File size (${sizeInGB}GB) exceeds 2GB`
      };
    }

    const fileName = file.name.toLowerCase();

    const hasValidExtension = SUPPORTED_EXTENSIONS.some(ext =>
      fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        errorMessage: `Unsupported extension`
      };
    }

    return { isValid: true };

  };


  const handleFileSelect = async (file: File) => {

    setError(null);
    setSuccess(null);

    const validation = validateFile(file);

    if (!validation.isValid) {
      setError(validation.errorMessage || 'Invalid file');
      return;
    }

    try {

      setIsLoading(true);

      console.log("Uploading video...");

      const response: any = await videoAPI.uploadVideo(file);

      console.log("Upload response:", response);

      const videoId = response.videoId;

      if (!videoId) {
        throw new Error("Video ID missing from backend");
      }

      const localUrl = URL.createObjectURL(file);

      // Wait for chapters
      let chaptersReady = false;

      while (!chaptersReady) {

        console.log("Checking chapter generation...");

        try {

          const chapterResponse: any = await videoAPI.getChapters(videoId);

          if (chapterResponse?.chapters?.length > 0) {
            chaptersReady = true;
          }

        } catch (err) {
          console.log("Chapters not ready yet...");
        }

        if (!chaptersReady) {
          await new Promise(res => setTimeout(res, 3000));
        }
      }

      console.log("Chapters ready");

      onVideoSubmit({
        url: localUrl,
        type: 'local'
      });

      setSuccess(`Video processed successfully`);

      setTimeout(() => setSuccess(null), 3000);

    }

    catch (err) {

      console.error(err);

      setError("Failed to process video");

    }

    finally {

      setIsLoading(false);

    }

  };


  const resetFileInput = () => {

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setError(null);
    setSuccess(null);

  };


  return (

    <div className="max-w-4xl mx-auto">

      <div className="flex justify-center space-x-4 mb-8">

        <button
          onClick={() => { setUploadMethod('dragdrop'); resetFileInput(); }}
          className={`flex items-center px-6 py-3 rounded-lg ${
            uploadMethod === 'dragdrop'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-200 text-light-300'
          }`}
        >
          <FiUpload className="mr-2" />
          Drag & Drop
        </button>

        <button
          onClick={() => { setUploadMethod('url'); resetFileInput(); }}
          className={`flex items-center px-6 py-3 rounded-lg ${
            uploadMethod === 'url'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-200 text-light-300'
          }`}
        >
          <FiLink className="mr-2" />
          Video URL
        </button>

        <button
          onClick={() => { setUploadMethod('youtube'); resetFileInput(); }}
          className={`flex items-center px-6 py-3 rounded-lg ${
            uploadMethod === 'youtube'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-200 text-light-300'
          }`}
        >
          <FiYoutube className="mr-2" />
          YouTube
        </button>

      </div>


      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
        onChange={(e) => {

          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }

        }}
        className="hidden"
      />


      <div className="bg-dark-200 rounded-2xl p-8 border border-dark-300">

        {uploadMethod === 'dragdrop' && (
          <DragDropZone
            onFileSelect={handleFileSelect}
            onError={setError}
          />
        )}


        {error && (

          <div className="mt-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4">

            <div className="flex items-start space-x-3">

              <FiAlertCircle className="text-red-500 text-xl"/>

              <div>

                <p className="text-red-500 font-medium">Upload Failed</p>
                <p className="text-red-400 text-sm mt-1">{error}</p>

                <button
                  onClick={resetFileInput}
                  className="mt-3 text-sm bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Try Again
                </button>

              </div>

            </div>

          </div>

        )}


        {success && (

          <div className="mt-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4">

            <div className="flex items-center space-x-3">

              <FiCheckCircle className="text-green-500 text-xl" />
              <p className="text-green-500">{success}</p>

            </div>

          </div>

        )}


        {isLoading && (

          <div className="mt-6 text-center text-white">

            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mx-auto mb-4"></div>

            <p>Processing video with AI...</p>
            <p className="text-sm text-gray-400 mt-2">
              Extracting audio • Transcribing • Generating embeddings • Creating chapters
            </p>

          </div>

        )}

      </div>

    </div>

  );

};

export default VideoUpload;
