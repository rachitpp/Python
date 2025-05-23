// src/components/DiagnosticReport.tsx
import React from 'react';

interface DiagnosticReportProps {
  report: string | null;
  loading: boolean;
  detectionResults: any;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  report,
  loading,
  detectionResults,
}) => {
  // Helper function to get color based on pathology class
  const getColorForClass = (className: string) => {
    // Map of pathology types to colors
    const colorMap: Record<string, string> = {
      'caries': '#FF5733', // Red-orange
      'periapical_lesion': '#3B82F6', // Blue
      'periodontal_disease': '#10B981', // Green
      'calculus': '#EC4899', // Pink
      'abscess': '#8B5CF6', // Purple
      'impacted_tooth': '#F59E0B', // Yellow
    };

    return colorMap[className.toLowerCase()] || '#FF4D4F'; // Default to red
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Diagnostic Report</h2>

      {!detectionResults && !loading && (
        <div className="p-4 bg-slate-100 rounded-lg">
          <p className="text-slate-600">
            Upload an image and detect pathologies to generate a diagnostic report.
          </p>
        </div>
      )}

      {detectionResults && !report && !loading && (
        <div>
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">Detected Pathologies</h3>
            <ul className="space-y-2">
              {detectionResults.predictions && detectionResults.predictions.map((pred: any, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getColorForClass(pred.class) }}
                  ></span>
                  <span>
                    {pred.class} ({(pred.confidence * 100).toFixed(1)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-slate-600">
            Click "Generate Diagnostic Report" to get AI-assisted diagnosis.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-8">
          <svg className="animate-spin size-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-700">Generating diagnostic report...</p>
        </div>
      )}

      {report && !loading && (
        <div className="prose prose-sm max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: report.replace(/\n/g, '<br/>')
            }}
          />
        </div>
      )}
    </div>
  );
};