import { Note } from '../types';
import jsPDF from 'jspdf';

export const exportToPDF = async (notes: Note[], videoTitle: string = 'Video Notes'): Promise<void> => {
  // Create PDF with larger size for better image quality
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(99, 102, 241); // Primary color
  pdf.text(videoTitle, 20, 20);

  // Date and metadata
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
  pdf.text(`Total Notes: ${notes.length}`, 20, 35);

  let yPosition = 45;
  const pageHeight = 297; // A4 height in mm
  const margin = 20;
  const contentWidth = 170; // A4 width minus margins

  // Sort notes by timestamp
  const sortedNotes = [...notes].sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 0; i < sortedNotes.length; i++) {
    const note = sortedNotes[i];

    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    // Note header with chapter and timestamp
    pdf.setFontSize(12);
    pdf.setTextColor(99, 102, 241);
    pdf.setFont('helvetica', 'bold');
    
    // Chapter name and timestamp
    const headerText = note.chapter 
      ? `${note.chapter} • ${note.timestampFormatted}`
      : `Note ${i + 1} • ${note.timestampFormatted}`;
    pdf.text(headerText, 20, yPosition);
    yPosition += 7;

    // Note content
    pdf.setFontSize(11);
    pdf.setTextColor(50, 50, 50);
    pdf.setFont('helvetica', 'normal');

    if (note.type === 'text') {
      // Split long text into multiple lines
      const lines = pdf.splitTextToSize(note.content, contentWidth);
      pdf.text(lines, 20, yPosition);
      yPosition += lines.length * 6;
    } 
    else if (note.type === 'screenshot' || note.type === 'drawing') {
      try {
        // Extract base64 image data
        const imgData = note.content.split(',')[1];
        
        // Calculate image dimensions to fit page width while maintaining aspect ratio
        // Create a temporary image to get dimensions
        const img = new Image();
        img.src = note.content;
        
        // Wait for image to load (simplified - in real app you'd need async handling)
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        // Calculate dimensions to fit within content width (170mm) while maintaining aspect ratio
        const imgWidth = contentWidth;
        const imgHeight = (img.height * imgWidth) / img.width;
        
        // Limit height to reasonable size (max 100mm)
        const maxHeight = 100;
        const finalHeight = Math.min(imgHeight, maxHeight);
        const finalWidth = (img.width * finalHeight) / img.height;
        
        // Center the image
        const xOffset = 20 + (contentWidth - finalWidth) / 2;
        
        pdf.addImage(imgData, 'PNG', xOffset, yPosition, finalWidth, finalHeight);
        yPosition += finalHeight + 5;
      } catch (error) {
        pdf.text('[Image could not be embedded]', 20, yPosition);
        yPosition += 6;
      }
    }

    // Add separator between notes
    yPosition += 5;
    if (i < sortedNotes.length - 1) {
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 10;
    }
  }

  // Save the PDF
  const filename = `${videoTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
};