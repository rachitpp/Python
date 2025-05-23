// src/App.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Navbar } from "./components/Navbar";
import { FileUploader } from "./components/FileUploader";
import { ImageViewer } from "./components/ImageViewer";
import { DiagnosticReport } from "./components/DiagnosticReport";
import { API_ROUTES } from "./config";

// Create a configuration object with the API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

interface FileResult {
  file_id: string;
  detection_results: DetectionResults;
}

// Tab options for the main interface
type ActiveTab = "analysis" | "report";

function App() {
  // State management
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [detectionResults, setDetectionResults] =
    useState<DetectionResults | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<
    "online" | "offline" | "checking"
  >("checking");
  const [activeTab, setActiveTab] = useState<ActiveTab>("analysis");
  const [loading, setLoading] = useState({
    background: false,
    detection: false,
    report: false,
    upload: false,
    batchDetection: false,
  });
  const [multipleFilesEnabled, setMultipleFilesEnabled] = useState(false);

  // Auto-switch to report tab when report is generated
  useEffect(() => {
    if (diagnosticReport) {
      setActiveTab("report");
    }
  }, [diagnosticReport]);

  // Check backend status
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
          setBackendStatus("online");
          console.log("Backend API is online");
        } else {
          setBackendStatus("offline");
          console.error("Backend API returned error:", response.status);
        }
      } catch (error) {
        setBackendStatus("offline");
        console.error("Backend API is offline or inaccessible:", error);
      }
    };

    checkBackendStatus();
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    // Check if backend is online
    if (backendStatus === "offline") {
      toast.error("Backend API is offline. Please check your server.");
      return;
    }

    setLoading((prev) => ({ ...prev, upload: true }));
    setUploadedImageId(null);
    setUploadedFileIds([]);
    setDetectionResults(null);
    setDiagnosticReport(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading file:", file.name);
      const response = await axios.post(API_ROUTES.UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", response.data);

      // Check the response structure and extract the image ID
      // The backend may return either image_id or file_id based on the implementation
      const imageId = response.data.image_id || response.data.file_id;

      if (imageId) {
        setUploadedImageId(imageId);
        setUploadedFileIds([imageId]);
        toast.success("File uploaded successfully!");

        // Verify image URL is accessible
        try {
          const imageUrl = API_ROUTES.IMAGE(imageId);
          console.log("Verifying image URL:", imageUrl);

          const imgCheck = await fetch(imageUrl);
          if (!imgCheck.ok) {
            console.error("Image URL not accessible:", imgCheck.status);
            toast.warning("Image uploaded but may not display correctly");
          } else {
            console.log("Image URL verified successfully");
          }
        } catch (err) {
          console.error("Error checking image URL:", err);
        }
      } else {
        toast.warning("Unexpected response from server");
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("File upload failed. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  // Handle multiple files upload
  const handleMultipleFilesUpload = async (files: File[]) => {
    // Check if backend is online
    if (backendStatus === "offline") {
      toast.error("Backend API is offline. Please check your server.");
      return;
    }

    setLoading((prev) => ({ ...prev, upload: true }));
    setUploadedImageId(null);
    setUploadedFileIds([]);
    setDetectionResults(null);
    setDiagnosticReport(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      console.log(`Uploading ${files.length} files`);
      const response = await axios.post(API_ROUTES.UPLOAD_MULTIPLE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", response.data);

      // Check if the upload was successful
      if (
        response.data &&
        response.data.files &&
        response.data.files.length > 0
      ) {
        const fileIds = response.data.files.map(
          (file: { file_id: string }) => file.file_id
        );

        setUploadedFileIds(fileIds);
        // Set the first image as the active one
        setUploadedImageId(fileIds[0]);

        toast.success(
          `${files.length} file${
            files.length === 1 ? "" : "s"
          } uploaded successfully!`
        );
      } else {
        toast.warning("Unexpected response from server");
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("File upload failed. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  // Handle batch detection of pathologies
  const handleBatchDetect = async () => {
    if (uploadedFileIds.length === 0) {
      toast.warning("Please upload files first");
      return;
    }

    setLoading((prev) => ({ ...prev, batchDetection: true }));

    try {
      const response = await axios.post(
        API_ROUTES.DETECT_BATCH,
        uploadedFileIds
      );
      console.log("Batch detection response:", response.data);

      if (response.data && response.data.results) {
        // Get results for the current active image
        const currentImageResult = response.data.results.find(
          (result: FileResult) => result.file_id === uploadedImageId
        );

        if (currentImageResult) {
          setDetectionResults(currentImageResult.detection_results);
          toast.success("Pathologies detected on all images!");
        } else {
          toast.warning("No pathologies detected for the current image");
        }
      } else {
        toast.warning("Unexpected response format from server");
        console.warn("Unexpected detection response:", response.data);
      }
    } catch (error) {
      console.error("Batch detection error:", error);
      toast.error("Pathology detection failed. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, batchDetection: false }));
    }
  };

  // Handle pathology detection for a single image
  const handleDetectPathologies = async () => {
    if (!uploadedImageId) {
      toast.warning("Please upload an image first");
      return;
    }

    setLoading((prev) => ({ ...prev, detection: true }));
    setDetectionResults(null);

    try {
      const response = await axios.post(API_ROUTES.DETECT(uploadedImageId));
      console.log("Detection response:", response.data);

      if (response.data && response.data.detection_results) {
        setDetectionResults(response.data.detection_results);
        toast.success("Pathologies detected!");
      } else {
        toast.warning("No pathologies detected or unexpected response format");
        console.warn("Unexpected detection response:", response.data);
      }
    } catch (error) {
      console.error("Detection error:", error);
      toast.error("Pathology detection failed. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, detection: false }));
    }
  };

  const handleGenerateReport = async () => {
    if (!uploadedImageId || !detectionResults) {
      toast.warning("Please detect pathologies first");
      return;
    }

    setLoading((prev) => ({ ...prev, report: true }));
    setDiagnosticReport(null);

    try {
      const response = await axios.post(API_ROUTES.REPORT(uploadedImageId));
      console.log("Report response:", response.data);

      if (response.data && response.data.report) {
        setDiagnosticReport(response.data.report);
        toast.success("Diagnostic report generated!");
      } else {
        toast.warning("Report generation failed or unexpected response format");
        console.warn("Unexpected report response:", response.data);
      }
    } catch (error) {
      console.error("Report error:", error);
      toast.error("Diagnostic report generation failed. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, report: false }));
    }
  };

  // Display backend status message
  useEffect(() => {
    if (backendStatus === "offline") {
      toast.error(
        "Backend API is offline. Some features may not work correctly.",
        {
          autoClose: false,
        }
      );
    }
  }, [backendStatus]);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="light"
      />

      <main className="flex-grow w-full">
        <div className="container mx-auto py-6 px-4">
          {/* Tabs for navigation */}
          <div className="flex border-b border-gray-200 mb-6 animate-fade-in">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`py-2 px-4 text-sm font-medium flex items-center ${
                activeTab === "analysis"
                  ? "border-b-2 border-primary-500 text-primary-700"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } tab-highlight`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              Analysis
            </button>
            <button
              onClick={() => setActiveTab("report")}
              disabled={!diagnosticReport}
              className={`py-2 px-4 text-sm font-medium relative flex items-center ${
                activeTab === "report"
                  ? "border-b-2 border-primary-500 text-primary-700"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${
                !diagnosticReport ? "opacity-50 cursor-not-allowed" : ""
              } tab-highlight`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75a2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3.75h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75a2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75"
                />
              </svg>
              Diagnostic Report
              {diagnosticReport && (
                <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-secondary-400 animate-pulse-slow"></span>
              )}
            </button>

            {/* Add Multiple Files toggle to the right side of the tabs */}
            <div className="ml-auto flex items-center group relative">
              <span className="text-sm mr-2 text-gray-500">
                Multiple Files:
              </span>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  multipleFilesEnabled ? "bg-primary-500" : "bg-gray-200"
                } transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2`}
                role="switch"
                aria-checked={multipleFilesEnabled}
                onClick={() => setMultipleFilesEnabled(!multipleFilesEnabled)}
              >
                <span
                  className={`${
                    multipleFilesEnabled ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-10 right-0 bg-gray-800 text-white text-xs rounded-md py-1 px-2 pointer-events-none w-48">
                Toggle to upload and process multiple X-ray images at once
              </div>
            </div>
          </div>

          {/* Main content with conditional rendering based on active tab */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar (always visible) */}
            <div
              className="lg:w-1/4 flex-shrink-0 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="enhanced-card card-hover">
                <FileUploader
                  onFileUpload={handleFileUpload}
                  onMultipleFilesUpload={handleMultipleFilesUpload}
                  loading={loading.upload}
                  multipleFilesEnabled={multipleFilesEnabled}
                />
              </div>

              {detectionResults &&
                detectionResults.predictions &&
                activeTab === "analysis" && (
                  <div className="mt-6 enhanced-card p-5 bg-subtle-primary-gradient animate-scale-in">
                    <h3 className="text-base font-medium text-gray-800 mb-3 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                      Detection Results
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p className="mb-1 font-medium">
                        <span className="text-gradient">
                          {detectionResults.predictions.length}
                        </span>{" "}
                        pathologies detected
                      </p>
                      <ul className="space-y-1 mt-3">
                        {detectionResults.predictions.map((pred, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-all"
                          >
                            <span className="capitalize">{pred.class}</span>
                            <span className="bg-white/70 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              {(pred.confidence * 100).toFixed(1)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
            </div>

            {/* Main content area - shows either Analysis or Report based on active tab */}
            <div
              className="lg:w-3/4 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              {activeTab === "analysis" && (
                <div className="enhanced-card">
                  <ImageViewer
                    imageId={uploadedImageId}
                    detectionResults={detectionResults}
                    onDetect={
                      uploadedFileIds.length > 1
                        ? handleBatchDetect
                        : handleDetectPathologies
                    }
                    onGenerateReport={handleGenerateReport}
                    loading={{
                      detection: loading.detection || loading.batchDetection,
                      report: loading.report,
                    }}
                    uploadedFileIds={uploadedFileIds}
                    onChangeImage={(fileId) => {
                      setUploadedImageId(fileId);
                      setDetectionResults(null); // Reset detection results when switching images
                    }}
                  />
                </div>
              )}

              {activeTab === "report" && diagnosticReport && (
                <div className="enhanced-card animate-scale-in">
                  <DiagnosticReport
                    report={diagnosticReport}
                    loading={loading.report}
                    detectionResults={detectionResults}
                  />
                </div>
              )}

              {activeTab === "report" && !diagnosticReport && (
                <div className="enhanced-card bg-subtle-gradient p-8 flex justify-center items-center h-80 animate-fade-in">
                  <div className="text-center max-w-md">
                    <div className="bg-primary-50 size-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-10 text-primary-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75a2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3.75h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75a2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      No Report Generated Yet
                    </h3>
                    <p className="text-gray-500">
                      Upload an image and analyze pathologies to generate a
                      diagnostic report.
                    </p>
                    <button
                      onClick={() => setActiveTab("analysis")}
                      className="mt-4 px-4 py-2 bg-primary-100 text-primary-700 rounded-md font-medium hover:bg-primary-200 transition-colors text-sm inline-flex items-center"
                    >
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
                          d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                        />
                      </svg>
                      Go to Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
