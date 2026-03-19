import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FiPenTool, FiTrash2, FiSave, FiRotateCcw, FiRotateCw } from 'react-icons/fi';
import { BsEraser } from 'react-icons/bs'; // Bootstrap eraser icon - this exists!

export interface DrawingCanvasRef {
  clear: () => void;
  getDrawing: () => string;
  undo: () => void;
  redo: () => void;
}

interface Props {
  onSave: (drawingData: string) => void;
  width?: number;
  height?: number;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(({ onSave, width = 400, height = 300 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useImperativeHandle(ref, () => ({
    clear: () => {
      clearCanvas();
    },
    getDrawing: () => {
      return canvasRef.current?.toDataURL('image/png') || '';
    },
    undo: () => {
      undo();
    },
    redo: () => {
      redo();
    }
  }));

  // Save state to history
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    
    // Limit history size
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const img = new Image();
      img.src = history[historyIndex - 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const img = new Image();
      img.src = history[historyIndex + 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      
      setHistoryIndex(historyIndex + 1);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Initial background
    context.fillStyle = '#2d2d44';
    context.fillRect(0, 0, width, height);
    
    // Set default styles
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    // Save initial state
    saveState();
  }, [width, height]);

  // Update context when tool/color/size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    if (tool === 'eraser') {
      ctx.strokeStyle = '#2d2d44';
      ctx.lineWidth = brushSize * 1.5;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  }, [tool, color, brushSize]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#2d2d44';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    setIsDrawing(true);
    setLastPos({ x, y });

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !lastPos) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();

    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPos(null);
      saveState();
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const drawingData = canvasRef.current.toDataURL('image/png');
    onSave(drawingData);
    clearCanvas();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar - Fixed Icons */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-dark-300 rounded-lg">
        {/* Pen Tool */}
        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded transition-colors ${
            tool === 'pen' ? 'bg-primary-500 text-white' : 'bg-dark-400 text-light-300 hover:bg-dark-500'
          }`}
          title="Pen"
        >
          <FiPenTool size={18} />
        </button>

        {/* Eraser Tool - Using BsEraser from react-icons/bs */}
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded transition-colors ${
            tool === 'eraser' ? 'bg-primary-500 text-white' : 'bg-dark-400 text-light-300 hover:bg-dark-500'
          }`}
          title="Eraser"
        >
          <BsEraser size={18} />
        </button>

        <div className="w-px h-8 bg-dark-400 mx-2" />

        {/* Color Picker */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer"
          title="Color"
        />

        {/* Brush Size */}
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-24"
          title="Brush Size"
        />
        <span className="text-light-400 text-sm">{brushSize}px</span>

        <div className="w-px h-8 bg-dark-400 mx-2" />

        {/* Undo Button */}
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 bg-dark-400 hover:bg-dark-500 text-light-300 rounded transition-colors disabled:opacity-50"
          title="Undo"
        >
          <FiRotateCcw size={18} />
        </button>

        {/* Redo Button */}
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-2 bg-dark-400 hover:bg-dark-500 text-light-300 rounded transition-colors disabled:opacity-50"
          title="Redo"
        >
          <FiRotateCw size={18} />
        </button>

        {/* Reset/Clear Button - Using FiTrash2 (Dustbin) for reset */}
        <button
          onClick={clearCanvas}
          className="p-2 bg-dark-400 hover:bg-dark-500 text-red-400 rounded transition-colors"
          title="Clear All (Reset)"
        >
          <FiTrash2 size={18} />
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors ml-auto"
          title="Save Drawing"
        >
          <FiSave size={18} />
        </button>
      </div>

      {/* Canvas */}
      <div className="border-2 border-dark-400 rounded-lg overflow-hidden bg-dark-300">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair w-full h-auto"
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;