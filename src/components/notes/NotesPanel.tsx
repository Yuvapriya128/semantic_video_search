import React, { useState, useRef } from 'react';
import { FiX, FiType, FiPenTool, FiDownload, FiCamera, FiTrash2, FiRotateCcw } from 'react-icons/fi';
import DrawingCanvas, { DrawingCanvasRef } from './DrawingCanvas';
import { exportToPDF } from '../../utils/pdfGenerator';

interface Note {
  id: number;
  type: 'text' | 'drawing' | 'screenshot';
  content: string;
  timestamp: number;
  timestampFormatted: string;
  chapter?: string;
}

interface Props {
  onClose: () => void;
  currentTime: number;
  currentChapter?: { title: string };
  videoRef: React.RefObject<HTMLVideoElement>;
}

const NotesPanel: React.FC<Props> = ({ onClose, currentTime, currentChapter, videoRef }) => {
  const [mode, setMode] = useState<'type' | 'draw'>('type');
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddTextNote = () => {
    if (!noteContent.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      type: 'text',
      content: noteContent,
      timestamp: currentTime,
      timestampFormatted: formatTime(currentTime),
      chapter: currentChapter?.title
    };

    setNotes([newNote, ...notes]);
    setNoteContent('');
  };

  const handleAddDrawing = (drawingData: string) => {
    const newNote: Note = {
      id: Date.now(),
      type: 'drawing',
      content: drawingData,
      timestamp: currentTime,
      timestampFormatted: formatTime(currentTime),
      chapter: currentChapter?.title
    };

    setNotes([newNote, ...notes]);
  };

  const handleScreenshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const screenshot = canvas.toDataURL('image/png');
    
    const newNote: Note = {
      id: Date.now(),
      type: 'screenshot',
      content: screenshot,
      timestamp: currentTime,
      timestampFormatted: formatTime(currentTime),
      chapter: currentChapter?.title
    };

    setNotes([newNote, ...notes]);
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const handleExportPDF = async () => {
    await exportToPDF(notes, 'Video Notes');
  };

  return (
    <div className="absolute top-0 right-0 w-[450px] h-full bg-dark-200 
                    border-l border-primary-500 shadow-2xl flex flex-col z-50">
      {/* Header - Simplified to just "Notes" */}
      <div className="flex items-center justify-between p-4 border-b border-dark-300">
        <h3 className="text-white font-semibold text-lg">Notes</h3>
        <button
          onClick={onClose}
          className="text-light-400 hover:text-white transition-colors p-2 hover:bg-dark-300 rounded-lg"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex p-4 space-x-2 border-b border-dark-300">
        <button
          onClick={() => setMode('type')}
          className={`flex-1 py-3 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all
            ${mode === 'type' 
              ? 'bg-primary-500 text-white shadow-lg' 
              : 'bg-dark-300 text-light-400 hover:bg-dark-400'}`}
        >
          <FiType size={18} />
          <span>Type</span>
        </button>
        <button
          onClick={() => setMode('draw')}
          className={`flex-1 py-3 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all
            ${mode === 'draw' 
              ? 'bg-primary-500 text-white shadow-lg' 
              : 'bg-dark-300 text-light-400 hover:bg-dark-400'}`}
        >
          <FiPenTool size={18} />
          <span>Draw</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'type' ? (
          <div className="space-y-4">
            <div className="bg-dark-300 rounded-lg p-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type your note here..."
                className="w-full h-32 bg-dark-400 text-white rounded-lg p-3 
                         border border-dark-500 focus:border-primary-500 
                         outline-none resize-none placeholder-light-500"
              />
              
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleAddTextNote}
                  disabled={!noteContent.trim()}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-800 
                           disabled:opacity-50 text-white py-2 rounded-lg transition-colors font-medium"
                >
                  Add Note
                </button>
                <button
                  onClick={handleScreenshot}
                  className="bg-dark-400 hover:bg-dark-500 text-light-200 
                           px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  title="Take screenshot"
                >
                  <FiCamera size={18} />
                  <span>Shot</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <DrawingCanvas
              ref={canvasRef}
              onSave={handleAddDrawing}
              width={400}
              height={300}
            />
            <div className="flex justify-end">
              <button
                onClick={handleClearCanvas}
                className="bg-dark-300 hover:bg-dark-400 text-light-200 
                         px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiRotateCcw size={16} />
                <span>Clear Canvas</span>
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="mt-6">
          <h4 className="text-light-300 font-medium mb-3 flex items-center">
            <span>Saved Notes</span>
            <span className="ml-2 bg-dark-300 text-light-400 text-xs px-2 py-1 rounded-full">
              {notes.length}
            </span>
          </h4>
          
          {notes.length === 0 ? (
            <div className="text-center py-8 bg-dark-300 rounded-lg">
              <p className="text-light-400">No notes yet</p>
              <p className="text-light-500 text-sm mt-1">
                {mode === 'type' ? 'Type a note or take a screenshot' : 'Create a drawing'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-dark-300 rounded-lg p-3 border border-dark-400 hover:border-primary-500 transition-colors group"
                >
                  {/* Note Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-primary-500 bg-opacity-20 text-primary-400 
                                     px-2 py-1 rounded-full font-mono">
                        {note.timestampFormatted}
                      </span>
                      {note.chapter && (
                        <span className="text-xs bg-dark-400 text-light-300 px-2 py-1 rounded-full">
                          {note.chapter}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 text-light-400 
                               hover:text-red-500 transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  
                  {/* Note Content */}
                  {note.type === 'text' && (
                    <p className="text-white text-sm whitespace-pre-wrap">{note.content}</p>
                  )}
                  
                  {note.type === 'screenshot' && (
                    <div className="relative group/image">
                      <img 
                        src={note.content} 
                        alt="Screenshot" 
                        className="w-full rounded-lg mt-2 cursor-pointer 
                                 hover:opacity-90 transition-opacity"
                        onClick={() => window.open(note.content, '_blank')}
                      />
                    </div>
                  )}
                  
                  {note.type === 'drawing' && (
                    <div className="relative group/image">
                      <img 
                        src={note.content} 
                        alt="Drawing" 
                        className="w-full rounded-lg mt-2 cursor-pointer bg-dark-400"
                        onClick={() => window.open(note.content, '_blank')}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer with Export PDF */}
      <div className="p-4 border-t border-dark-300">
        <button
          onClick={handleExportPDF}
          disabled={notes.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 
                   disabled:opacity-50 text-white py-3 rounded-lg transition-colors 
                   flex items-center justify-center space-x-2 font-medium"
        >
          <FiDownload size={18} />
          <span>Export as PDF ({notes.length} notes)</span>
        </button>
      </div>
    </div>
  );
};

export default NotesPanel;