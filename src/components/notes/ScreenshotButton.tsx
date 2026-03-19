// src/components/notes/ScreenshotButton.tsx
import React, { useState } from 'react';
import { FiCamera, FiCheck, FiX } from 'react-icons/fi';

interface Props {
  onScreenshot: (screenshot: string) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const ScreenshotButton: React.FC<Props> = ({ onScreenshot, videoRef }) => {
  const [isTaking, setIsTaking] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const takeScreenshot = () => {
    if (!videoRef.current) return;

    setIsTaking(true);
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const screenshot = canvas.toDataURL('image/png');
    setPreview(screenshot);
  };

  const handleConfirm = () => {
    if (preview) {
      onScreenshot(preview);
      setPreview(null);
      setIsTaking(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setIsTaking(false);
  };

  return (
    <>
      <button
        onClick={takeScreenshot}
        disabled={isTaking}
        className="flex-1 bg-dark-300 hover:bg-dark-400 text-light-200 
                 py-2 rounded-lg transition-colors flex items-center 
                 justify-center space-x-2 disabled:opacity-50"
      >
        <FiCamera />
        <span>Take Screenshot</span>
      </button>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center 
                      justify-center z-50">
          <div className="bg-dark-200 rounded-xl p-4 max-w-2xl">
            <h3 className="text-white font-semibold mb-4">Screenshot Preview</h3>
            <img src={preview} alt="Screenshot" className="rounded-lg max-h-96" />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-dark-300 hover:bg-dark-400 
                         text-white rounded-lg transition-colors"
              >
                <FiX className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 
                         text-white rounded-lg transition-colors"
              >
                <FiCheck className="inline mr-2" />
                Add to Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScreenshotButton;