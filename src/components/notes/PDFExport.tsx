import React, { useState } from 'react'; // Make sure useState is imported
import { FiDownload } from 'react-icons/fi';
import { Note } from '../../types';
import { exportToPDF } from '../../utils/pdfGenerator';

interface Props {
  notes: Note[];
  videoTitle?: string;
}

const PDFExport: React.FC<Props> = ({ notes, videoTitle = 'Video Notes' }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(notes, videoTitle);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={notes.length === 0 || isExporting}
      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 
                 disabled:opacity-50 text-white py-3 rounded-lg 
                 transition-colors flex items-center justify-center space-x-2"
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FiDownload size={18} />
          <span>Export Notes as PDF</span>
          <span className="bg-green-700 px-2 py-0.5 rounded text-xs">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </>
      )}
    </button>
  );
};

export default PDFExport;