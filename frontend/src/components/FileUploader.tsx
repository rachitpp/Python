// src/components/FileUploader.tsx
import React, { useRef, useState } from "react";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  onMultipleFilesUpload: (files: File[]) => void;
  loading: boolean;
  multipleFilesEnabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onMultipleFilesUpload,
  loading,
  multipleFilesEnabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileCount, setSelectedFileCount] = useState<number>(0);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      if (files.length === 1) {
        onFileUpload(files[0]);
      } else if (multipleFilesEnabled) {
        setSelectedFileCount(files.length);
        onMultipleFilesUpload(files);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(
        (file) => file.name.endsWith(".dcm") || file.name.endsWith(".rvg")
      );

      if (files.length === 0) {
        return;
      }

      if (files.length === 1) {
        onFileUpload(files[0]);
      } else if (multipleFilesEnabled) {
        setSelectedFileCount(files.length);
        onMultipleFilesUpload(files);
      } else {
        // If multiple files are dropped but feature is not enabled, just use the first one
        onFileUpload(files[0]);
      }
    }
  };

  return (
    <div
      className={`transition-all w-full overflow-hidden ${
        isDragging ? "ring-2 ring-primary-300" : ""
      }`}
    >
      <div className="p-5 bg-gradient-to-r from-primary-50/80 via-primary-50/50 to-secondary-50/30 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5 mr-2 text-primary-500"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6 6 0 00-5.98 6.496A5.25 5.25 0 006.75 20.25H18a4.5 4.5 0 002.206-8.423 3.75 3.75 0 00-4.133-4.303A6.001 6.001 0 0010.5 3.75zm2.03 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v4.94a.75.75 0 001.5 0v-4.94l1.72 1.72a.75.75 0 101.06-1.06l-3-3z"
              clipRule="evenodd"
            />
          </svg>
          Upload Dental X-ray{multipleFilesEnabled ? "s" : ""}
        </h2>
        <p className="text-gray-500 text-sm mt-1 pl-7">
          Upload your dental X-ray images for AI analysis
        </p>
      </div>

      <div
        className={`p-8 flex flex-col items-center justify-center space-y-6 transition-all ${
          isDragging
            ? "bg-primary-50 scale-98 border-2 border-dashed border-primary-300"
            : "bg-subtle-gradient hover:bg-subtle-primary-gradient"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className={`size-20 rounded-full flex items-center justify-center relative ${
            isDragging ? "animate-bounce-slow" : "animate-float"
          }`}
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200 to-secondary-100 opacity-60"></div>
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-primary-50 shadow-inner"></div>

          {/* Pulse animation when dragging */}
          {isDragging && (
            <>
              <div className="absolute inset-0 rounded-full bg-primary-300 animate-ping opacity-30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary-300 animate-pulse"></div>
            </>
          )}

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-10 text-primary-600 relative z-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-gray-700 mb-1 font-medium">
            Drag & drop your{" "}
            {multipleFilesEnabled ? "DICOM files" : "DICOM file"} here
          </p>
          <p className="text-gray-500 text-sm">or click the button below</p>
          {selectedFileCount > 0 && !loading && (
            <div className="mt-2 bg-primary-50 rounded-lg px-3 py-1.5 text-sm text-primary-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 mr-1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                />
              </svg>
              {selectedFileCount} file{selectedFileCount !== 1 ? "s" : ""}{" "}
              selected
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".dcm,.rvg"
          multiple={multipleFilesEnabled}
        />

        <button
          onClick={handleClick}
          disabled={loading}
          className="bg-primary-500 hover:bg-primary-600 text-gray font-medium px-6 py-3 rounded-lg transition-all disabled:bg-primary-300 shadow-sm hover:shadow-md active:scale-95 w-full flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin size-5 text-white flex-shrink-0"
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
                strokeWidth={2}
                stroke="currentColor"
                className="size-5 group-hover:translate-y-[-2px] transition-transform flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="truncate">
                Select File{multipleFilesEnabled ? "s" : ""}
              </span>
            </>
          )}
        </button>

        <div className="w-full pt-4 border-t border-gray-100 flex items-center justify-center">
          <div className="bg-gray-50 rounded-full px-3 py-1 text-xs text-gray-400 flex items-center space-x-1 border border-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-3 text-gray-400"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
            <span>Supported formats: DICOM (.dcm, .rvg)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
