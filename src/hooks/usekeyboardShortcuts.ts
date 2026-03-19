// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

interface ShortcutHandlers {
  onPlayPause?: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  onSearch?: () => void;
  onNotes?: () => void;
  onFullscreen?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
}

export const useKeyboardShortcuts = ({
  onPlayPause,
  onNextChapter,
  onPrevChapter,
  onSearch,
  onNotes,
  onFullscreen,
  onVolumeUp,
  onVolumeDown,
  onMute,
}: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlayPause?.();
          break;
        case 'ArrowRight':
          if (e.ctrlKey) {
            e.preventDefault();
            onNextChapter?.();
          }
          break;
        case 'ArrowLeft':
          if (e.ctrlKey) {
            e.preventDefault();
            onPrevChapter?.();
          }
          break;
        case 'KeyF':
          if (e.ctrlKey) {
            e.preventDefault();
            onSearch?.();
          }
          break;
        case 'KeyN':
          if (e.ctrlKey) {
            e.preventDefault();
            onNotes?.();
          }
          break;
        case 'KeyM':
          e.preventDefault();
          onMute?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onVolumeUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onVolumeDown?.();
          break;
        case 'Escape':
          // Handle escape (usually closes panels)
          break;
        case 'KeyT':
          if (e.ctrlKey) {
            e.preventDefault();
            // Toggle chapter sidebar
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onNextChapter, onPrevChapter, onSearch, onNotes, onFullscreen, onVolumeUp, onVolumeDown, onMute]);
};