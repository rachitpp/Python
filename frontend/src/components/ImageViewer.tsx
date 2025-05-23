// src/components/ImageViewer.tsx
import React, { useEffect, useState, useRef } from 'react';
import { API_ROUTES } from '../config';

interface ImageViewerProps {
  imageId: string | null;
  detectionResults: any | null;
  onDetect: () => void;
  onGenerateReport: () => void;
  loading: {
    detection: boolean;
    report: boolean;
  };
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageId,
  detectionResults,
  onDetect,
  onGenerateReport,
  loading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Helper function to get color based on class name
  const getColorForClass = (className: string, alpha: number = 1) => {
    // Map of pathology types to colors
    const colorMap: Record<string, string> = {
      'caries': '#FF5733', // Red-orange
      'periapical_lesion': '#3B82F6', // Blue
      'periodontal_disease': '#10B981', // Green
      'calculus': '#EC4899', // Pink
      'abscess': '#8B5CF6', // Purple
      'impacted_tooth': '#F59E0B', // Yellow
    };

    const color = colorMap[className.toLowerCase()] || '#FF4D4F'; // Default to red
    
    if (alpha < 1) {
      // Convert hex to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return color;
  };
  
  // Function to render the image with detection boxes
  const renderImage = () => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scaled dimensions to fit in the container while maintaining aspect ratio
    const container = containerRef.current;
    let maxWidth = 700; // Default max width
    let maxHeight = 600; // Default max height
    
    if (container) {
      maxWidth = container.clientWidth - 40; // Subtract padding
    }
    
    // Calculate dimensions that maintain aspect ratio but fit within maxWidth and maxHeight
    let width = image.width;
    let height = image.height;
    
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = height * ratio;
    }
    
    if (height > maxHeight) {
      const ratio = maxHeight / height;
      height = maxHeight;
      width = width * ratio;
    }
    
    // Apply zoom
    width = width * zoomLevel;
    height = height * zoomLevel;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0, width, height);

    // Scale the bounding box coordinates to match the resized image
    const scaleX = width / image.width;
    const scaleY = height / image.height;

    // Draw bounding boxes if available
    if (detectionResults && detectionResults.predictions) {
      detectionResults.predictions.forEach((pred: any) => {
        const { x, y, width: boxWidth, height: boxHeight, class: className, confidence } = pred;

        // Scale the bounding box
        const scaledX = (x - boxWidth/2) * scaleX;
        const scaledY = (y - boxHeight/2) * scaleY;
        const scaledWidth = boxWidth * scaleX;
        const scaledHeight = boxHeight * scaleY;

        // Draw bounding box
        ctx.strokeStyle = getColorForClass(className);
        ctx.lineWidth = 2;
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

        // Draw background for text
        ctx.fillStyle = getColorForClass(className, 0.8);
        const labelText = `${className} (${(confidence * 100).toFixed(1)}%)`;
        const labelWidth = ctx.measureText(labelText).width + 10;
        ctx.fillRect(scaledX, scaledY - 22, labelWidth, 22);

        // Draw text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.max(12, 14 * scaleX * 0.6)}px Inter, sans-serif`;
        ctx.fillText(labelText, scaledX + 5, scaledY - 6);
      });
    }
  };

  // Zoom control functions
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleReset = () => {
    setZoomLevel(1);
  };

  // Load image when imageId changes
  useEffect(() => {
    if (!imageId) {
      setImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = API_ROUTES.IMAGE(imageId);
    img.onload = () => {
      setImage(img);
    };
  }, [imageId]);

  // Render image and detection boxes when data changes
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    renderImage();
  }, [image, detectionResults, zoomLevel]);

  // Render empty state when no image
  if (!imageId) {
    return (
      <div className="card h-80 flex items-center justify-center">
        <div className="text-center p-8 text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-12 mx-auto mb-4 text-slate-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p>No image uploaded</p>
          <p className="text-sm text-slate-400 mt-2">Upload a DICOM file to view results</p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (!image) {
    return (
      <div className="card h-80 flex items-center justify-center">
        <div className="text-center p-8">
          <svg className="animate-spin size-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Processing image...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" ref={containerRef}>
      <div className="card-header flex items-center justify-between bg-white">
        <h3 className="text-lg font-medium text-slate-800">X-ray Image</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-md hover:bg-slate-200 transition-colors"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded-md hover:bg-slate-200 transition-colors"
            title="Reset Zoom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-md hover:bg-slate-200 transition-colors"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4 flex justify-center items-center">
        <canvas
          ref={canvasRef}
          className="max-w-full shadow-sm"
        />
      </div>
      <div className="card-footer bg-white flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {detectionResults && detectionResults.predictions ? 
            `${detectionResults.predictions.length} pathologies detected` : 
            'No pathologies detected yet'}
        </p>
        <div className="space-x-2">
          <button
            onClick={onDetect}
            disabled={loading.detection}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 text-sm rounded-md transition-colors duration-300 disabled:bg-indigo-400"
          >
            {loading.detection ? 'Processing...' : 'Detect Pathologies'}
          </button>
          <button
            onClick={onGenerateReport}
            disabled={loading.report || !detectionResults}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 text-sm rounded-md transition-colors duration-300 disabled:bg-emerald-400"
          >
            {loading.report ? (
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 mr-2 animate-spin"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 6-6"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Diagnostic Report'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};