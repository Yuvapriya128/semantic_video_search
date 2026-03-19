// src/types/index.ts
export interface Chapter {
  id: number;
  title: string;
  start: number;
  end: number;
  startFormatted: string;
  endFormatted: string;
  summary: string;
}

export interface SearchResult {
  chapter: string;
  timestamp: number;
  start_time: string;
}


export interface Note {
  id: number;
  type: 'text' | 'drawing' | 'screenshot';
  content: string;
  timestamp: number;
  timestampFormatted: string;
  chapter?: string;
}

export interface VideoMetadata {
  duration: number;
  title: string;
  chapters: Chapter[];
  transcript: {
    text: string;
    start: number;
    end: number;
  }[];
}