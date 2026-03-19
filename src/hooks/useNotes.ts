// src/hooks/useNotes.ts
import { useState } from 'react';
import { Note } from '../types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now(),
    };
    setNotes([...notes, newNote]);
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const updateNote = (id: number, updates: Partial<Note>) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, ...updates } : note
    ));
  };

  const saveDrawing = async (drawingData: string, timestamp: number, chapter?: string) => {
    setIsSaving(true);
    try {
      const newNote: Note = {
        id: Date.now(),
        type: 'drawing',
        content: drawingData,
        timestamp,
        timestampFormatted: formatTime(timestamp),
        chapter,
      };
      setNotes([...notes, newNote]);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    notes,
    isSaving,
    addNote,
    deleteNote,
    updateNote,
    saveDrawing,
  };
};