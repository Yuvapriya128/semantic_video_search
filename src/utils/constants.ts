// src/utils/constants.ts
export const APP_NAME = 'Semantic Seeker';
export const APP_VERSION = '1.0.0';

export const VIDEO_CONFIG = {
  MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
  SUPPORTED_FORMATS: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
  MAX_DURATION: 7200, // 2 hours in seconds
};

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const CHAPTER_CONFIG = {
  MIN_DURATION: 30, // Minimum chapter duration in seconds
  SIMILARITY_THRESHOLD: 0.7,
  MAX_MERGE_GAP: 5, // Maximum gap in seconds to merge segments
};

export const SEARCH_CONFIG = {
  MAX_RESULTS: 10,
  MIN_SIMILARITY: 0.3,
  RE_RANK_COUNT: 20,
};

export const NOTES_CONFIG = {
  MAX_NOTES: 100,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
};

export const STORAGE_KEYS = {
  THEME: 'semantic-seeker-theme',
  VOLUME: 'semantic-seeker-volume',
  PLAYBACK_SPEED: 'semantic-seeker-speed',
  RECENT_VIDEOS: 'semantic-seeker-recent',
};