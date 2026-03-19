// src/services/mockData.ts
import { Chapter, SearchResult, Note } from '../types';

export const mockChapters: Chapter[] = [
  {
    id: 1,
    title: 'Introduction to Semantic Search',
    start: 0,
    end: 125,
    startFormatted: '00:00',
    endFormatted: '02:05',
    summary: 'Overview of semantic search concepts and applications in video content.',
  },
  {
    id: 2,
    title: 'Understanding Embeddings',
    start: 125,
    end: 342,
    startFormatted: '02:05',
    endFormatted: '05:42',
    summary: 'Deep dive into vector embeddings and how they capture semantic meaning.',
  },
  {
    id: 3,
    title: 'Timestamp Retrieval System',
    start: 342,
    end: 561,
    startFormatted: '05:42',
    endFormatted: '09:21',
    summary: 'How the system retrieves precise timestamps based on user queries.',
  },
  {
    id: 4,
    title: 'Chapter Generation Algorithm',
    start: 561,
    end: 823,
    startFormatted: '09:21',
    endFormatted: '13:43',
    summary: 'Automatic chapter detection using semantic coherence analysis.',
  },
  {
    id: 5,
    title: 'Demo and Use Cases',
    start: 823,
    end: 1200,
    startFormatted: '13:43',
    endFormatted: '20:00',
    summary: 'Practical demonstration with real-world examples and applications.',
  },
];

export const mockSearchResults: SearchResult[] = [
  {
    chapter: 'Introduction to Semantic Search',
    timestamp: 45,
    start_time: '00:45'
  },
  {
    chapter: 'Embedding Models',
    timestamp: 150,
    start_time: '02:30'
  },
  {
    chapter: 'Similarity Search',
    timestamp: 380,
    start_time: '06:20'
  },
  {
    chapter: 'Chapter Detection',
    timestamp: 600,
    start_time: '10:00'
  }
];

export const mockNotes: Note[] = [
  {
    id: 1,
    type: 'text',
    content: 'Key concept: Semantic search vs keyword search',
    timestamp: 120,
    timestampFormatted: '02:00',
    chapter: 'Introduction to Semantic Search',
  },
  {
    id: 2,
    type: 'text',
    content: 'BERT model produces 768-dimensional embeddings',
    timestamp: 200,
    timestampFormatted: '03:20',
    chapter: 'Understanding Embeddings',
  },
];

export const mockVideoMetadata = {
  id: 'video-123',
  title: 'Semantic Video Search Tutorial',
  duration: 1200,
  durationFormatted: '20:00',
  thumbnail: '/assets/thumbnail.jpg',
  chapters: mockChapters,
};