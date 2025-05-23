// src/App.tsx
import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Navbar } from './components/Navbar';
import { FileUploader } from './components/FileUploader';
import { ImageViewer } from './components/ImageViewer';
import { DiagnosticReport } from './components/DiagnosticReport';
import { API_ROUTES } from './config';

function App() {
  // State management
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<any | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    background: false,
    detection: false,
    report: false,
  });

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setLoading(prev => ({ ...prev, upload: true }));
    setUploadedImageId(null);
    setDetectionResults(null);
    setDiagnosticReport(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(API_ROUTES.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedImageId(response.data.image_id);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('File upload failed. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  // Handle pathology detection
  const handleDetectPathologies = async () => {
    if (!uploadedImageId) {
      toast.warning('Please upload an image first');
      return;
    }

    setLoading(prev => ({ ...prev, detection: true }));
    setDetectionResults(null);

    try {
      const response = await axios.post(API_ROUTES.DETECT(uploadedImageId));
      setDetectionResults(response.data);
      toast.success('Pathologies detected!');
    } catch (error) {
      console.error('Detection error:', error);
      toast.error('Pathology detection failed. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, detection: false }));
    }
  };

  const handleGenerateReport = async () => {
    if (!uploadedImageId || !detectionResults) {
      toast.warning('Please detect pathologies first');
      return;
    }

    setLoading(prev => ({ ...prev, report: true }));
    setDiagnosticReport(null);

    try {
      const response = await axios.post(API_ROUTES.REPORT(uploadedImageId));
      setDiagnosticReport(response.data.report);
      toast.success('Diagnostic report generated!');
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Diagnostic report generation failed. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, report: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Navbar />
      <ToastContainer position="top-right" />
      
      <main className="container mx-auto py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
          <div className="md:col-span-1">
            <FileUploader onFileUpload={handleFileUpload} loading={loading.background} />
          </div>
          <div className="md:col-span-2">
            <ImageViewer
              imageId={uploadedImageId}
              detectionResults={detectionResults}
              onDetect={handleDetectPathologies}
              onGenerateReport={handleGenerateReport}
              loading={{
                detection: loading.detection,
                report: loading.report
              }}
            />

            {diagnosticReport && (
              <div className="mt-6">
                <DiagnosticReport 
                  report={diagnosticReport} 
                  loading={loading.report}
                  detectionResults={detectionResults}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;