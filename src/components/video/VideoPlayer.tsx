// src/components/video/VideoPlayer.tsx
import React, { useRef, useState, useEffect } from 'react';
import {  FiPlay, FiPause, FiSkipBack, FiSkipForward, FiSearch, FiFileText, FiVolume2, FiVolumeX, FiMaximize, FiMinimize, FiHome, FiAlertCircle } from 'react-icons/fi';
import ProgressBar from './ProgressBar';
import SearchPanel from '../search/SearchPanel';
import NotesPanel from '../notes/NotesPanel';

interface Props {
  videoSource: { url: string; type: 'local' | 'youtube' | 'direct' };
  videoId?: string;
  chapters?: {
    id: number;
    title: string;
    start: number;
    end: number;
    startFormatted: string;
  }[];
}


// Declare YouTube Player API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VideoPlayer: React.FC<Props> = ({ videoSource, videoId, chapters: propChapters }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const [chapters, setChapters] = useState<any[]>(propChapters || []);
useEffect(() => {
    if (propChapters) {
      setChapters(propChapters);
    }
  }, [propChapters]);
  // Load YouTube IFrame API
  useEffect(() => {
    if (videoSource.type !== 'youtube') return;

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializeYouTubePlayer();
      };
    } else {
      initializeYouTubePlayer();
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoSource.url, videoSource.type]);
  //fetch data
  useEffect(() => {
  if (!videoId) return;

  fetch(`http://127.0.0.1:8000/videos/${videoId}/chapters`)
    .then(res => res.json())
    .then(data => {
      console.log("Backend response:", data);

      const rawChapters = data.chapters || data.segments || [];
      const formatted = rawChapters.map((seg: any, i: number) => ({
        id: i,
        title: seg.title || (seg.text?.slice(0, 40) + "…") || "Chapter",
        start: seg.start || 0,
        end: seg.end || 0,
        startFormatted: formatTime(seg.start || 0)
      }));

      setChapters(formatted);
    })
    .catch(err => {
      console.error(err);
      setChapters([]); // fallback to empty array if fetch fails
    });
}, [videoId]);


  const initializeYouTubePlayer = () => {
    if (!youtubeContainerRef.current) return;

    // Extract video ID from URL
    const videoId = extractYouTubeId(videoSource.url);
    if (!videoId) return;

    youtubePlayerRef.current = new window.YT.Player(youtubeContainerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        fs: 0,
      },
      events: {
        onReady: onYouTubeReady,
        onStateChange: onYouTubeStateChange,
        onError: onYouTubeError,
      },
    });
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const onYouTubeReady = () => {
    console.log('YouTube player ready');
    const player = youtubePlayerRef.current;
    if (player) {
      setDuration(player.getDuration());
      setVolume(player.getVolume() / 100);
    }
  };

  const onYouTubeStateChange = (event: any) => {
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    setIsPlaying(event.data === 1);
    
    if (event.data === 1) {
      // Start progress tracking
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = setInterval(() => {
        if (youtubePlayerRef.current) {
          setCurrentTime(youtubePlayerRef.current.getCurrentTime());
        }
      }, 100);
    } else {
      // Stop progress tracking
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    if (event.data === 0) {
      // Video ended
      setCurrentTime(duration);
    }
  };

  const onYouTubeError = (event: any) => {
    console.error('YouTube error:', event.data);
    let errorMessage = 'Failed to load YouTube video. ';
    switch (event.data) {
      case 2:
        errorMessage = 'Invalid video ID. Please check the URL.';
        break;
      case 5:
        errorMessage = 'HTML5 player error. Please try again.';
        break;
      case 100:
        errorMessage = 'Video not found or removed.';
        break;
      case 101:
      case 150:
        errorMessage = 'Video cannot be embedded.';
        break;
      default:
        errorMessage = 'Unable to play this YouTube video.';
    }
    setVideoError(errorMessage);
  };

  // Set up video event listeners for non-YouTube videos
  useEffect(() => {
    if (videoSource.type === 'youtube') return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      console.error('Video error:', target.error);
      
      let errorMessage = 'Failed to load video. ';
      switch (target.error?.code) {
        case 1:
          errorMessage = 'Video loading was aborted. Please try again.';
          break;
        case 2:
          errorMessage = 'Network error occurred. Please check your connection.';
          break;
        case 3:
          errorMessage = 'Video format not supported. Try converting to MP4.';
          break;
        case 4:
          errorMessage = 'Video cannot be played. The file may be corrupted.';
          break;
        default:
          errorMessage = 'Unable to play this video. Please try another file.';
      }
      setVideoError(errorMessage);
    };
    const handleLoadedData = () => {
      console.log('Video loaded successfully');
      setVideoError(null);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);

    video.load();

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoSource.url, videoSource.type]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => setShowControls(true));
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', () => setShowControls(true));
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoSource.type === 'youtube') {
      const player = youtubePlayerRef.current;
      if (player) {
        if (isPlaying) {
          player.pauseVideo();
        } else {
          player.playVideo();
        }
      }
      return;
    }

    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error('Playback failed:', error);
              setVideoError('Playback failed. The video format may not be supported.');
            });
        }
      }
    } catch (error) {
      console.error('Toggle play error:', error);
    }
  };

  const handleSeek = (time: number) => {
    if (videoSource.type === 'youtube') {
      const player = youtubePlayerRef.current;
      if (player) {
        player.seekTo(time, true);
        setCurrentTime(time);
      }
      return;
    }

    if (!videoRef.current) return;
    try {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const toggleMute = () => {
    if (videoSource.type === 'youtube') {
      const player = youtubePlayerRef.current;
      if (player) {
        if (isMuted) {
          player.unMute();
          player.setVolume(volume * 100);
        } else {
          player.mute();
        }
        setIsMuted(!isMuted);
      }
      return;
    }

    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    
    if (videoSource.type === 'youtube') {
      const player = youtubePlayerRef.current;
      if (player) {
        player.setVolume(newVolume * 100);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
      }
      return;
    }

    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const getLiveCurrentTime = () => {
  if (videoSource.type === 'youtube') {
    const player = youtubePlayerRef.current;
    if (player && typeof player.getCurrentTime === 'function') {
      return player.getCurrentTime();
    }
  }

  if (videoRef.current) {
    return videoRef.current.currentTime;
  }

  return currentTime;
};

const handleNextChapter = () => {
  if (!chapters.length) return;

  const liveTime = getLiveCurrentTime();

  const currentChapterIndex = chapters.findIndex(
    (ch, index) => {
      const nextChapter = chapters[index + 1];
      const chapterEnd = nextChapter ? nextChapter.start : ch.end;
      return liveTime >= ch.start && liveTime < chapterEnd;
    }
  );

  if (currentChapterIndex === -1) {
    // fallback: go to first chapter after current time
    const nextChapter = chapters.find(ch => ch.start > liveTime);
    if (nextChapter) {
      handleSeek(nextChapter.start);
    }
    return;
  }

  if (currentChapterIndex < chapters.length - 1) {
    handleSeek(chapters[currentChapterIndex + 1].start);
  }
};

const handlePrevChapter = () => {
  if (!chapters.length) return;

  const liveTime = getLiveCurrentTime();

  const currentChapterIndex = chapters.findIndex(
    (ch, index) => {
      const nextChapter = chapters[index + 1];
      const chapterEnd = nextChapter ? nextChapter.start : ch.end;
      return liveTime >= ch.start && liveTime < chapterEnd;
    }
  );

  if (currentChapterIndex === -1) {
    // fallback: go to last chapter before current time
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (chapters[i].start < liveTime) {
        handleSeek(chapters[i].start);
        return;
      }
    }
    return;
  }

  const currentChapter = chapters[currentChapterIndex];
  const timeIntoChapter = liveTime - currentChapter.start;

  // If user is more than 2 sec inside current chapter, restart current chapter
  if (timeIntoChapter > 2) {
    handleSeek(currentChapter.start);
    return;
  }

  // Otherwise go to previous chapter
  if (currentChapterIndex > 0) {
    handleSeek(chapters[currentChapterIndex - 1].start);
  } else {
    handleSeek(chapters[0].start);
  }
};


  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const goHome = () => {
    if (videoSource?.type === 'local' && videoSource?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(videoSource.url);
    }

    
    // Pause video if playing
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    // Reload the page to go back to upload screen
    window.location.reload();
  };


  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentChapter = () => {
    return chapters.find(ch => currentTime >= ch.start && currentTime <= ch.end);
  };

  // Render YouTube player with custom controls
  if (videoSource.type === 'youtube') {
    return (
      <div ref={containerRef} className="relative h-screen bg-black overflow-hidden">
        {/* YouTube Player Container */}
        <div ref={youtubeContainerRef} className="w-full h-full" />

        {/* Error Message Overlay */}
        {videoError && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-xl p-8 max-w-md text-center">
              <FiAlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">YouTube Error</h3>
              <p className="text-red-400 mb-4">{videoError}</p>
              <button
                onClick={goHome}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Go Back Home
              </button>
            </div>
          </div>
        )}

        {/* Home Button */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black via-black/50 to-transparent p-4 z-20">
          <button
            onClick={goHome}
            className="flex items-center space-x-2 bg-dark-200 hover:bg-dark-300 
                     text-white px-4 py-2 rounded-lg transition-colors
                     border border-primary-500 shadow-lg group"
          >
            <FiHome size={20} className="group-hover:text-primary-400" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        {/* Custom Controls for YouTube */}
        {showControls && !videoError && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent z-30">
            <ProgressBar
              currentTime={currentTime}
              duration={duration || 1}
              chapters={chapters}
              onSeek={handleSeek}
            />

            <div className="flex items-center justify-between px-4 py-3 relative">
              {/* Left side - Logo */}
              <div className="flex items-center">
                <img src="/assets/logo.svg" alt="Logo" className="h-8 w-8" />
              </div>

              {/* Center Controls */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                <button
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setShowNotes(false);
                    setShowChapters(false);
                  }}
                  className={`text-white hover:text-primary-400 transition-colors p-2 rounded-lg
                            ${showSearch ? 'bg-primary-500 bg-opacity-20 text-primary-400' : ''}`}
                  title="Search in video"
                >
                  <FiSearch size={20} />
                </button>

                <button
                  onClick={handlePrevChapter}
                  className="text-white hover:text-primary-400 transition-colors p-2"
                  title="Previous chapter"
                >
                  <FiSkipBack size={24} />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 
                           text-white flex items-center justify-center transition-all
                           transform hover:scale-105 shadow-lg"
                >
                  {isPlaying ? <FiPause size={28} /> : <FiPlay size={28} className="ml-1" />}
                </button>

                <button
                  onClick={handleNextChapter}
                  className="text-white hover:text-primary-400 transition-colors p-2"
                  title="Next chapter"
                >
                  <FiSkipForward size={24} />
                </button>

                <button
                  onClick={() => {
                    setShowNotes(!showNotes);
                    setShowSearch(false);
                    setShowChapters(false);
                  }}
                  className={`text-white hover:text-primary-400 transition-colors p-2 rounded-lg
                            ${showNotes ? 'bg-primary-500 bg-opacity-20 text-primary-400' : ''}`}
                  title="Take notes"
                >
                  <FiFileText size={20} />
                </button>
              </div>

              {/* Right side - Volume and Fullscreen */}
              <div className="flex items-center space-x-2 ml-auto">
                <button 
                  onClick={toggleMute} 
                  className="text-white hover:text-primary-400 transition-colors p-2"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-primary-500"
                  title="Volume"
                />
                <span className="text-white text-sm w-12">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
                
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-primary-400 transition-colors p-2 ml-2"
                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chapter Toggle Button */}
        <button
          onClick={() => {
            setShowChapters(!showChapters);
            setShowSearch(false);
            setShowNotes(false);
          }}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 
                     bg-dark-200 hover:bg-dark-300 text-white rounded-lg p-3 
                     shadow-xl border border-primary-500 transition-all duration-300 z-30
                     ${showChapters ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{
            left: showChapters ? '24rem' : '1rem',
          }}
          title="Show chapters"
        >
          <span className="text-xl">📑</span>
        </button>

        {/* Chapters Sidebar */}
        {showChapters && (
          <div className="absolute top-0 left-0 w-96 h-full bg-dark-200 
                        border-r border-primary-500 shadow-2xl flex flex-col z-40
                        animate-slide-right">
            <div className="flex items-center justify-between p-4 border-b border-dark-300">
              <h3 className="text-white font-semibold text-lg flex items-center">
                <span className="mr-2">📑</span>
                Chapters
                <span className="ml-2 bg-dark-300 text-light-300 text-sm px-2 py-1 rounded-full">
                  {chapters.length}
                </span>
              </h3>
              <button
                onClick={() => setShowChapters(false)}
                className="text-light-400 hover:text-white transition-colors p-2 hover:bg-dark-300 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {chapters.map((chapter, index) => {
                  const isActive = currentTime >= chapter.start && currentTime <= chapter.end;
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        handleSeek(chapter.start);
                        setShowChapters(false);
                      }}
                      className={`w-full text-left group relative overflow-hidden
                                rounded-lg transition-all transform hover:scale-[1.02]
                                ${isActive 
                                  ? 'bg-primary-500 bg-opacity-20 border-primary-500' 
                                  : 'hover:bg-dark-300 border-transparent'
                                } border`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-mono ${
                                isActive ? 'text-primary-400' : 'text-light-400'
                              }`}>
                                {(index + 1).toString().padStart(2, '0')}
                              </span>
                              <h4 className={`font-medium ${
                                isActive ? 'text-primary-400' : 'text-white'
                              }`}>
                                {chapter.title}
                              </h4>
                            </div>
                          </div>
                          <span className={`text-sm font-mono ml-4 ${
                            isActive ? 'text-primary-400' : 'text-light-400'
                          }`}>
                            {chapter.startFormatted}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-dark-300 bg-dark-300 bg-opacity-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-light-400">Total Duration</span>
                <span className="text-white font-mono">
                  {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-light-400">Current Chapter</span>
                <span className="text-primary-400 font-medium">
                  {getCurrentChapter()?.title || 'None'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search Panel */}
        {showSearch && (
          <SearchPanel
            videoId={videoId}
            onClose={() => setShowSearch(false)}
            onTimestampSelect={handleSeek}
          />
        )}

        {/* Notes Panel */}
        {showNotes && (
          <NotesPanel
            onClose={() => setShowNotes(false)}
            currentTime={currentTime}
            currentChapter={getCurrentChapter()}
            videoRef={videoRef}
          />
        )}
      </div>
    );
  }

  // Render regular video (non-YouTube)
  return (
    <div ref={containerRef} className="relative h-screen bg-black overflow-hidden">
      <video
        key={videoSource.url}
        ref={videoRef}
        src={videoSource.url}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        preload="auto"
        crossOrigin="anonymous"
      />


      {/* Error Message Overlay */}
      {videoError && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-xl p-8 max-w-md text-center">
            <FiAlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Playback Error</h3>
            <p className="text-red-400 mb-4">{videoError}</p>
            <p className="text-light-400 text-sm mb-4">
              Supported formats: MP4, WebM, OGG, MOV, AVI, MKV
            </p>
            <button
              onClick={goHome}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      )}

      {/* Home Button */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black via-black/50 to-transparent p-4 z-20">
        <button
          onClick={goHome}
          className="flex items-center space-x-2 bg-dark-200 hover:bg-dark-300 
                   text-white px-4 py-2 rounded-lg transition-colors
                   border border-primary-500 shadow-lg group"
        >
          <FiHome size={20} className="group-hover:text-primary-400" />
          <span className="hidden sm:inline">Home</span>
        </button>
      </div>

      {/* Video Controls */}
      {showControls && !videoError && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent">
          <ProgressBar
            currentTime={currentTime}
            duration={duration || 1}
            chapters={chapters}
            onSeek={handleSeek}
          />

          <div className="flex items-center justify-between px-4 py-3 relative">

            {/* Center Controls */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowSearch(!showSearch);
                  setShowNotes(false);
                  setShowChapters(false);
                }}
                className={`text-white hover:text-primary-400 transition-colors p-2 rounded-lg
                          ${showSearch ? 'bg-primary-500 bg-opacity-20 text-primary-400' : ''}`}
                title="Search in video"
              >
                <FiSearch size={20} />
              </button>

              <button
                onClick={handlePrevChapter}
                className="text-white hover:text-primary-400 transition-colors p-2"
                title="Previous chapter"
              >
                <FiSkipBack size={24} />
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 
                         text-white flex items-center justify-center transition-all
                         transform hover:scale-105 shadow-lg"
              >
                {isPlaying ? <FiPause size={28} /> : <FiPlay size={28} className="ml-1" />}
              </button>

              <button
                onClick={handleNextChapter}
                className="text-white hover:text-primary-400 transition-colors p-2"
                title="Next chapter"
              >
                <FiSkipForward size={24} />
              </button>

              <button
                onClick={() => {
                  setShowNotes(!showNotes);
                  setShowSearch(false);
                  setShowChapters(false);
                }}
                className={`text-white hover:text-primary-400 transition-colors p-2 rounded-lg
                          ${showNotes ? 'bg-primary-500 bg-opacity-20 text-primary-400' : ''}`}
                title="Take notes"
              >
                <FiFileText size={20} />
              </button>
            </div>

            {/* Right side - Volume and Fullscreen */}
            <div className="flex items-center space-x-2 ml-auto">
              <button 
                onClick={toggleMute} 
                className="text-white hover:text-primary-400 transition-colors p-2"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-primary-500"
                title="Volume"
              />
              <span className="text-white text-sm w-12">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
              
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-primary-400 transition-colors p-2 ml-2"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Toggle Button */}
      <button
        onClick={() => {
          setShowChapters(!showChapters);
          setShowSearch(false);
          setShowNotes(false);
        }}
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 
                   bg-dark-200 hover:bg-dark-300 text-white rounded-lg p-3 
                   shadow-xl border border-primary-500 transition-all duration-300 z-30
                   ${showChapters ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{
          left: showChapters ? '24rem' : '1rem',
        }}
        title="Show chapters"
      >
        <span className="text-xl">📑</span>
      </button>

      {/* Chapters Sidebar */}
      {showChapters && (
        <div className="absolute top-0 left-0 w-96 h-full bg-dark-200 
                      border-r border-primary-500 shadow-2xl flex flex-col z-40
                      animate-slide-right">
          <div className="flex items-center justify-between p-4 border-b border-dark-300">
            <h3 className="text-white font-semibold text-lg flex items-center">
              <span className="mr-2">📑</span>
              Chapters
              <span className="ml-2 bg-dark-300 text-light-300 text-sm px-2 py-1 rounded-full">
                {chapters.length}
              </span>
            </h3>
            <button
              onClick={() => setShowChapters(false)}
              className="text-light-400 hover:text-white transition-colors p-2 hover:bg-dark-300 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {chapters.map((chapter, index) => {
                const isActive = currentTime >= chapter.start && currentTime <= chapter.end;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      handleSeek(chapter.start);
                      setShowChapters(false);
                    }}
                    className={`w-full text-left group relative overflow-hidden
                              rounded-lg transition-all transform hover:scale-[1.02]
                              ${isActive 
                                ? 'bg-primary-500 bg-opacity-20 border-primary-500' 
                                : 'hover:bg-dark-300 border-transparent'
                              } border`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-mono ${
                              isActive ? 'text-primary-400' : 'text-light-400'
                            }`}>
                              {(index + 1).toString().padStart(2, '0')}
                            </span>
                            <h4 className={`font-medium ${
                              isActive ? 'text-primary-400' : 'text-white'
                            }`}>
                              {chapter.title}
                            </h4>
                          </div>
                        </div>
                        <span className={`text-sm font-mono ml-4 ${
                          isActive ? 'text-primary-400' : 'text-light-400'
                        }`}>
                          {chapter.startFormatted}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-dark-300 bg-dark-300 bg-opacity-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-light-400">Total Duration</span>
              <span className="text-white font-mono">
                {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-light-400">Current Chapter</span>
              <span className="text-primary-400 font-medium">
                {getCurrentChapter()?.title || 'None'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search Panel */}
      {showSearch && (
        <SearchPanel
          videoId={videoId}
          onClose={() => setShowSearch(false)}
          onTimestampSelect={handleSeek}
        />
      )}

      {/* Notes Panel */}
      {showNotes && (
        <NotesPanel
          onClose={() => setShowNotes(false)}
          currentTime={currentTime}
          currentChapter={getCurrentChapter()}
          videoRef={videoRef}
        />
      )}
    </div>
  );
};

export default VideoPlayer;