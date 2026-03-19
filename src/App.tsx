import React, { useState, useRef} from 'react';
import { FiUpload, FiYoutube, FiAlertCircle, FiX } from 'react-icons/fi';
import VideoPlayer from './components/video/VideoPlayer';
import LoadingSpinner from './components/common/LoadingSpinner';
import Transition from './components/common/Transition';
import { videoProcessor } from "./services/videoProcessor";

// Define the correct type that matches VideoPlayer props
type VideoSourceType = {
  url: string; 
  type: 'local' | 'youtube' | 'direct';
};

// Custom Alert Component
const CustomAlert: React.FC<{ 
  message: string; 
  type: 'error' | 'success' | 'warning';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  const colors = {
    error: {
      bg: 'bg-red-500',
      bgLight: 'bg-red-500 bg-opacity-10',
      border: 'border-red-500',
      text: 'text-red-500',
      icon: <FiAlertCircle className="text-red-500 text-xl" />
    },
    warning: {
      bg: 'bg-yellow-500',
      bgLight: 'bg-yellow-500 bg-opacity-10',
      border: 'border-yellow-500',
      text: 'text-yellow-500',
      icon: <FiAlertCircle className="text-yellow-500 text-xl" />
    },
    success: {
      bg: 'bg-green-500',
      bgLight: 'bg-green-500 bg-opacity-10',
      border: 'border-green-500',
      text: 'text-green-500',
      icon: <FiAlertCircle className="text-green-500 text-xl" />
    }
  };

  const color = colors[type];
  return (
    <div className={`fixed top-5 right-5 z-50 animate-slide-left`}>
      <div className={`${color.bgLight} ${color.border} border rounded-lg shadow-xl max-w-md w-full backdrop-blur-sm`}>
        <div className="flex items-start p-4">
          <div className="flex-shrink-0 mt-0.5">
            {color.icon}
          </div>
          <div className="flex-1 ml-3">
            <p className={`${color.text} font-medium`}>
              {type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Warning'}
            </p>
            <p className="text-light-200 text-sm mt-1">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-light-400 hover:text-white transition-colors ml-4"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};



function App() {
  
  const [videoSource, setVideoSource] = useState<VideoSourceType | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage] = useState("Processing your video... This may take a few moments.");
  const [showPlayer, setShowPlayer] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'dragdrop' | 'url' | 'youtube'>('dragdrop');
  const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chapters, setChapters] = useState<any[]>([]);

  const showAlert = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setAlert({ message, type });
    // Auto hide after 5 seconds
    setTimeout(() => setAlert(null), 5000);
  };

  // After uploading / processing a file
const handleVideoSubmit = async (file: File) => {
  setIsProcessing(true);

  try {
    console.log("Starting AI video processing...");

    const result = await videoProcessor.processVideo(file);

    console.log("Processing result:", result);

    const id = result.videoId ?? result.video_id;

    setVideoId(id);
    setChapters(result.chapters ?? result.data ?? []);

    const localUrl = URL.createObjectURL(file);

    setVideoSource({
      url: localUrl,
      type: "local"
    });

    setShowPlayer(true);

  } catch (error) {
    console.error(error);
    showAlert("Video processing failed", "error");
  } finally {
    setIsProcessing(false);
  }
};


// After loading URL or YouTube link
const handleUrlSubmit = async () => {
  const input = document.querySelector('input[type="url"]') as HTMLInputElement;
  const url = input?.value?.trim();

  if (!url) {
    showAlert('Please enter a URL', 'warning');
    return;
  }

  try {
    new URL(url);
  } catch {
    showAlert('Please enter a valid URL', 'error');
    return;
  }

  setIsProcessing(true);

  try {
    const isYouTube =
      url.includes("youtube.com/watch") ||
      url.includes("youtu.be/") ||
      url.includes("youtube.com/embed/");

    let result;

    if (isYouTube) {
      result = await videoProcessor.processYoutubeVideo(url);
    } else {
      result = await videoProcessor.processVideoUrl(url);
    }

    const id = result.videoId ?? result.video_id;

    setVideoId(id);
    setChapters(result.chapters ?? []);

    const videoUrl = result.video_url || result.url || result.videoUrl;

    if (!videoUrl) {
      throw new Error("Video URL missing from backend response");
    }

    setVideoSource({
      url: videoUrl,
      type: "local"
    });

    setShowPlayer(true);
    showAlert("Video processed successfully!", "success");

  } catch (error) {
    console.error(error);
    showAlert("Failed to process video", "error");
  } finally {
    setIsProcessing(false);
  }
};


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        showAlert(`'${file.name}' is not a valid video file. Please select a video file.`, 'error');
        return;
      }

      showAlert(`Video loaded successfully: ${file.name}`, 'success');
      setTimeout(() => handleVideoSubmit(file), 1500);

    }
  };

  // If showing player, render the video player
  if (showPlayer && videoSource) {
    return (
      <Transition type="fade-in">
        <VideoPlayer 
          videoSource={videoSource} 
          videoId={videoId ?? undefined} 
          chapters={chapters} 
        />

      </Transition>
    );
  }

  // Main upload screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 to-dark-300">
      {/* Custom Alert */}
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        
        
        {isProcessing ? (
          <div className="min-h-screen flex items-center justify-center">
  <LoadingSpinner message={processingMessage} />
</div>

        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Method Selector */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setUploadMethod('dragdrop')}
                className={`flex items-center px-6 py-3 rounded-lg transition-all ${
                  uploadMethod === 'dragdrop'
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-dark-200 text-light-300 hover:bg-dark-300'
                }`}
              >
                <FiUpload className="mr-2" />
                Drag & Drop
              </button>
              <button
                onClick={() => setUploadMethod('url')}
                className={`flex items-center px-6 py-3 rounded-lg transition-all ${
                  uploadMethod === 'url'
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-dark-200 text-light-300 hover:bg-dark-300'
                }`}
              >
                <FiYoutube className="mr-2" />
                YouTube Link
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Area */}
            <div className="bg-dark-200 rounded-2xl p-8 shadow-2xl border border-dark-300">
              {uploadMethod === 'dragdrop' && (
                <div 
                  className="border-2 border-dashed border-dark-400 rounded-xl p-12 text-center 
                           hover:border-primary-500 transition-colors cursor-pointer
                           hover:bg-dark-300 group"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      if (!file.type.startsWith('video/')) {
                        showAlert(`'${file.name}' is not a valid video file.`, 'error');
                        return;
                      }
                      handleVideoSubmit(file);

                    }
                  }}
                >
                  <FiUpload className="text-5xl text-primary-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-xl text-white mb-2">
                    Drag & drop your video here
                  </p>
                  <p className="text-light-400 mb-4">
                    or <span className="text-primary-500 font-semibold">click to browse</span>
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg transition-colors"
                  >
                    Select Video
                  </button>
                  <p className="text-xs text-light-500 mt-4">
                    Supports: MP4, MOV, AVI, MKV, WebM
                  </p>
                </div>
              )}
              
              {uploadMethod === 'url' && (
                <div className="p-6">
                  <h3 className="text-white font-semibold mb-4">Enter Video URL</h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="url"
                      placeholder="https://example.com/video.mp4"
                      className="flex-1 bg-dark-300 text-white rounded-lg px-4 py-3 
                               border border-dark-400 focus:border-primary-500 outline-none"
                    />
                    <button 
                      onClick={handleUrlSubmit}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Load Video
                    </button>
                  </div>
                </div>
              )}
              
              {uploadMethod === 'youtube' && (
                <div className="p-6">
                  <h3 className="text-white font-semibold mb-4">Enter YouTube Link</h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 bg-dark-300 text-white rounded-lg px-4 py-3 
                               border border-dark-400 focus:border-primary-500 outline-none"
                    />
                    <button 
                      onClick={handleUrlSubmit}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Load Video
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-dark-200 p-6 rounded-xl text-center hover:bg-dark-300 transition-colors">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📑</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Auto Chapters</h3>
                <p className="text-light-400 text-sm">Automatic chapter detection using AI</p>
              </div>
              <div className="bg-dark-200 p-6 rounded-xl text-center hover:bg-dark-300 transition-colors">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Smart Search</h3>
                <p className="text-light-400 text-sm">Search video content with natural language</p>
              </div>
              <div className="bg-dark-200 p-6 rounded-xl text-center hover:bg-dark-300 transition-colors">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Interactive Notes</h3>
                <p className="text-light-400 text-sm">Take timestamped notes and drawings</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}

export default App;