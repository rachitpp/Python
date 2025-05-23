// src/components/ImageViewer.tsx
import React, { useEffect, useState, useRef } from "react";
import { API_ROUTES } from "../config";

interface Prediction {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

interface DetectionResults {
  predictions: Prediction[];
}

interface ImageViewerProps {
  imageId: string | null;
  detectionResults: DetectionResults | null;
  onDetect: () => void;
  onGenerateReport: () => void;
  loading: {
    detection: boolean;
    report: boolean;
  };
  uploadedFileIds: string[];
  onChangeImage: (fileId: string) => void;
}

// Add these constants at the top of the file, outside the component
const MAX_IMAGE_WIDTH = 600; // Maximum width for displayed images
const MAX_IMAGE_HEIGHT = 500; // Maximum height for displayed images

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageId,
  detectionResults,
  onDetect,
  onGenerateReport,
  loading,
  uploadedFileIds,
  onChangeImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(
    null
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [imageError, setImageError] = useState<string | null>(null);

  // Helper function to resize the image
  const resizeImage = (img: HTMLImageElement): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      // Calculate the scaled dimensions
      const scaleFactor = Math.min(
        1,
        MAX_IMAGE_WIDTH / img.width,
        MAX_IMAGE_HEIGHT / img.height
      );

      const width = img.width * scaleFactor;
      const height = img.height * scaleFactor;

      // If the image is already smaller than our max dimensions, return it as is
      if (scaleFactor >= 1) {
        resolve(img);
        return;
      }

      // Create a canvas to resize the image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      // Draw the image on the canvas at the new size
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(img); // If can't get context, return original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert the canvas to a new image
      const resizedImage = new Image();
      resizedImage.crossOrigin = "Anonymous";

      // When the new image is loaded, resolve the promise
      resizedImage.onload = () => {
        resolve(resizedImage);
      };

      // Set the source of the new image to be the canvas data
      resizedImage.src = canvas.toDataURL("image/png");
    });
  };

  // Helper function to get color based on class name
  const getColorForClass = (className: string, alpha: number = 1) => {
    // Map of pathology types to colors
    const colorMap: Record<string, string> = {
      caries: "#FF5733", // Red-orange
      periapical_lesion: "#8B5CF6", // Purple
      periodontal_disease: "#10B981", // Green
      calculus: "#EC4899", // Pink
      abscess: "#6D28D9", // Deep purple
      impacted_tooth: "#F59E0B", // Yellow
    };

    const color = colorMap[className.toLowerCase()] || "#FF4D4F"; // Default to red

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
    if (!processedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use the dimensions of the processed image
    let width = processedImage.width;
    let height = processedImage.height;

    // Apply zoom
    width = width * zoomLevel;
    height = height * zoomLevel;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw the image on the canvas
    ctx.drawImage(processedImage, 0, 0, width, height);

    // Original image dimensions (for scaling the bounding boxes)
    const originalWidth = image ? image.width : processedImage.width;
    const originalHeight = image ? image.height : processedImage.height;

    // Scale the bounding box coordinates to match the resized image
    const scaleX = width / originalWidth;
    const scaleY = height / originalHeight;

    // Draw bounding boxes if available
    if (detectionResults && detectionResults.predictions) {
      detectionResults.predictions.forEach((pred) => {
        const {
          x,
          y,
          width: boxWidth,
          height: boxHeight,
          class: className,
          confidence,
        } = pred;

        // Scale the bounding box
        const scaledX = (x - boxWidth / 2) * scaleX;
        const scaledY = (y - boxHeight / 2) * scaleY;
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
        ctx.fillStyle = "#FFFFFF";
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
      setProcessedImage(null);
      setImageError(null);
      return;
    }

    // Clear previous state
    setImageError(null);
    setImage(null);
    setProcessedImage(null);

    const imageUrl = API_ROUTES.IMAGE(imageId);
    console.log("Loading image from:", imageUrl);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = async () => {
      console.log(
        "Image loaded successfully. Original dimensions:",
        img.width,
        "x",
        img.height
      );
      setImage(img);

      try {
        // Resize the image
        const resized = await resizeImage(img);
        console.log("Image resized to:", resized.width, "x", resized.height);
        setProcessedImage(resized);
      } catch (error) {
        console.error("Error resizing image:", error);
        setProcessedImage(img); // Use original if resize fails
      }
    };

    img.onerror = (error) => {
      console.error("Error loading image:", error);
      setImageError(
        "Failed to load the image. The server might not have processed the DICOM file correctly."
      );
    };

    // Make a test fetch request to verify the endpoint
    fetch(imageUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}: ${response.statusText}`
          );
        }
        console.log(
          "Image endpoint fetch succeeded with status:",
          response.status
        );
      })
      .catch((error) => {
        console.error("Image endpoint fetch failed:", error);
      });
  }, [imageId]);

  // Render image and detection boxes when data changes
  useEffect(() => {
    if (!processedImage || !canvasRef.current) return;
    renderImage();
  }, [processedImage, detectionResults, zoomLevel]);

  // Update canvas when container size changes
  useEffect(() => {
    const handleResize = () => {
      if (processedImage) renderImage();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [processedImage]);

  // Render empty state when no image
  if (!imageId) {
    return (
      <div className="rounded-xl overflow-hidden h-80 flex items-center justify-center bg-subtle-gradient">
        <div className="text-center p-8 text-gray-500 animate-fade-in">
          <div className="bg-gray-50 size-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10 text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Image Uploaded
          </h3>
          <p className="text-sm text-gray-400">
            Upload a DICOM file to begin analysis
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (imageError) {
    return (
      <div className="rounded-xl overflow-hidden h-80 flex items-center justify-center bg-red-50">
        <div className="text-center p-8 text-red-500 animate-fade-in">
          <div className="bg-red-50 size-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10 text-red-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-700 mb-2">
            Image Loading Error
          </h3>
          <p className="text-sm text-red-500 max-w-md">{imageError}</p>
          <div className="mt-4">
            <p className="text-xs text-gray-400">Image ID: {imageId}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (!processedImage) {
    return (
      <div className="rounded-xl overflow-hidden h-80 flex items-center justify-center bg-subtle-gradient">
        <div className="text-center p-8 animate-fade-in">
          <div className="relative size-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-primary-300 rounded-full opacity-20 animate-ping"></div>
            <svg
              className="animate-spin size-full text-primary-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-10 rounded-full bg-primary-500 bg-opacity-50 animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">
            Processing Image
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we prepare your image
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden w-full animate-fade-in"
      ref={containerRef}
    >
      <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between bg-gradient-to-b from-gray-50 to-white">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5 mr-2 text-primary-500"
          >
            <path
              fillRule="evenodd"
              d="M3 9a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9zm0 6.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
          X-ray Analysis
        </h3>

        <div className="flex space-x-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-all text-gray-600 hover:text-primary-600 active:scale-95"
            title="Zoom Out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15"
              />
            </svg>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-all text-gray-600 hover:text-primary-600 active:scale-95"
            title="Reset Zoom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-all text-gray-600 hover:text-primary-600 active:scale-95"
            title="Zoom In"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Add image selector when multiple files are uploaded */}
      {uploadedFileIds.length > 1 && (
        <div className="p-4 bg-gradient-to-r from-primary-50/80 via-primary-50/50 to-secondary-50/30 border-b border-gray-100">
          <div className="flex flex-wrap items-center">
            <h3 className="text-sm font-medium text-gray-700 mr-3">
              Selected Image:
            </h3>
            <div className="flex flex-wrap gap-2 flex-grow">
              {uploadedFileIds.map((fileId, index) => (
                <button
                  key={fileId}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    fileId === imageId
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => onChangeImage(fileId)}
                >
                  Image {index + 1}
                  {fileId === imageId && (
                    <span className="ml-1.5 inline-flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 flex justify-center items-center bg-subtle-primary-gradient overflow-auto relative min-h-[300px]">
        <canvas
          ref={canvasRef}
          className="max-w-full rounded-md transition-all duration-300"
          style={{
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            transform: `scale(${Math.max(
              0.98,
              Math.min(1, zoomLevel * 0.99)
            )})`, // Subtle breathing animation
          }}
        />
      </div>
      <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-b from-white to-gray-50">
        <div className="text-sm text-gray-600 flex items-center">
          {detectionResults && detectionResults.predictions ? (
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-primary-500"></span>
              <span className="font-medium">
                {detectionResults.predictions.length} pathologies detected
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-gray-300"></span>
              <span>No pathologies detected yet</span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={onDetect}
            disabled={loading.detection}
            className="bg-primary-500 hover:bg-primary-600 text-gray font-medium px-4 py-2.5 text-sm rounded-lg transition-all disabled:bg-primary-300 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {loading.detection ? (
              <>
                <svg
                  className="animate-spin size-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                <span>Detect Pathologies</span>
              </>
            )}
          </button>
          <button
            onClick={onGenerateReport}
            disabled={loading.report || !detectionResults}
            className="bg-secondary-500 hover:bg-secondary-600 text-gray font-medium px-4 py-2.5 text-sm rounded-lg transition-all disabled:bg-secondary-300 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {loading.report ? (
              <>
                <svg
                  className="animate-spin size-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
