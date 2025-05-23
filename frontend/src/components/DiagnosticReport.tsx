// src/components/DiagnosticReport.tsx
import React, { useState } from "react";
import ReactDOMServer from "react-dom/server";

interface Prediction {
  class: string;
  confidence: number;
}

interface DetectionResults {
  predictions: Prediction[];
}

interface DiagnosticReportProps {
  report: string | null;
  loading: boolean;
  detectionResults: DetectionResults | null;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  report,
  loading,
  detectionResults,
}) => {
  // Add a state to track the current view mode
  const [viewMode, setViewMode] = useState<"modern" | "classic">("modern");

  // Helper function to get color based on pathology class
  const getColorForClass = (className: string) => {
    // Map of pathology types to colors
    const colorMap: Record<string, string> = {
      caries: "#FF5733", // Red-orange
      periapical_lesion: "#8B5CF6", // Purple
      periodontal_disease: "#10B981", // Green
      calculus: "#EC4899", // Pink
      abscess: "#6D28D9", // Deep purple
      impacted_tooth: "#F59E0B", // Yellow
    };

    return colorMap[className.toLowerCase()] || "#FF4D4F"; // Default to red
  };

  // Function to get icon based on section title - now returns the rendered HTML as a string
  const getSectionIcon = (sectionTitle: string): string => {
    let icon;

    switch (sectionTitle.toLowerCase()) {
      case "findings":
        icon = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
              clipRule="evenodd"
            />
          </svg>
        );
        break;
      case "diagnosis":
        icon = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
        );
        break;
      case "recommendations":
        icon = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
              clipRule="evenodd"
            />
          </svg>
        );
        break;
      case "analysis":
        icon = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
          </svg>
        );
        break;
      case "summary":
        icon = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        );
        break;
      default:
        icon = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
        );
    }

    // Convert React element to HTML string
    return ReactDOMServer.renderToString(icon);
  };

  // Function to parse the report and format it with styled sections
  const formatReport = (reportText: string) => {
    if (!reportText) return "";

    // Split the report by sections
    const sectionRegex =
      /(Findings|Diagnosis|Recommendations|Analysis|Summary):/g;
    const sections = reportText.split(sectionRegex);

    // Start with empty formatted content
    let formattedContent = "";

    // First element is any text before the first section heading
    if (sections[0].trim()) {
      formattedContent += `<div class="text-gray-700 mb-4">${sections[0].replace(
        /\n/g,
        "<br/>"
      )}</div>`;
    }

    // Process each section
    for (let i = 1; i < sections.length; i += 2) {
      if (i + 1 < sections.length) {
        const sectionTitle = sections[i];
        const sectionContent = sections[i + 1];

        // Create a styled section block
        formattedContent += `
          <div class="mb-6 animate-fade-in" style="animation-delay: ${
            (i / 2) * 0.1
          }s">
            <div class="flex items-center mb-2 pb-1 border-b border-primary-100">
              <div class="text-primary-600 mr-2 flex-shrink-0">${getSectionIcon(
                sectionTitle
              )}</div>
              <h3 class="text-primary-700 font-medium text-lg">${sectionTitle}</h3>
            </div>
            <div class="pl-7 text-gray-700 leading-relaxed">
              ${sectionContent
                .replace(/\n/g, "<br/>")
                .replace(
                  /(caries|periapical lesion|periodontal disease|calculus|abscess|impacted tooth)/gi,
                  '<span class="font-medium text-secondary-600 px-1.5 py-0.5 bg-secondary-50 rounded-md mx-0.5">$1</span>'
                )}
            </div>
          </div>`;
      }
    }

    return formattedContent;
  };

  return (
    <div className="rounded-xl overflow-hidden w-full animate-fade-in">
      <div className="border-b border-gray-100 px-5 py-4 bg-gradient-to-r from-secondary-50/80 via-secondary-50/50 to-primary-50/30 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 mr-2 text-secondary-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.251 2.251 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75"
            />
          </svg>
          Diagnostic Report
        </h2>

        {report && !loading && (
          <div className="flex space-x-1 text-sm">
            <button
              onClick={() => setViewMode("modern")}
              className={`px-2 py-1 rounded-l-md border border-gray-200 transition-colors ${
                viewMode === "modern"
                  ? "bg-secondary-50 text-secondary-700 border-secondary-200"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              Modern
            </button>
            <button
              onClick={() => setViewMode("classic")}
              className={`px-2 py-1 rounded-r-md border border-gray-200 transition-colors ${
                viewMode === "classic"
                  ? "bg-secondary-50 text-secondary-700 border-secondary-200"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              Classic
            </button>
          </div>
        )}
      </div>

      {!detectionResults && !loading && (
        <div className="p-8 flex flex-col items-center justify-center text-center bg-subtle-gradient animate-fade-in">
          <div className="bg-white size-16 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm animate-float">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8 text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75a2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3.75h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75a2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Report Available
          </h3>
          <p className="text-gray-500 text-sm max-w-md">
            Upload an image and detect pathologies to generate a diagnostic
            report.
          </p>
        </div>
      )}

      {detectionResults && !report && !loading && (
        <div className="p-6 overflow-x-auto bg-subtle-gradient">
          <div className="mb-6 bg-white border border-primary-100 rounded-lg p-5 shadow-sm animate-scale-in">
            <h3 className="font-medium text-primary-700 text-lg mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
              Detected Pathologies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {detectionResults.predictions &&
                detectionResults.predictions.map(
                  (pred: Prediction, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-md shadow-sm border border-gray-100 hover:border-primary-200 transition-all animate-fade-in card-hover list-none"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: getColorForClass(pred.class),
                          boxShadow: `0 0 0 2px rgba(255,255,255,0.8), 0 0 0 4px ${getColorForClass(
                            pred.class
                          )}20`,
                        }}
                      ></span>
                      <span className="font-medium text-gray-700 truncate capitalize">
                        {pred.class.replace("_", " ")}
                      </span>
                      <span className="text-gray-500 text-sm ml-auto bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100">
                        {(pred.confidence * 100).toFixed(1)}%
                      </span>
                    </li>
                  )
                )}
            </div>
          </div>
          <div className="flex items-center justify-center p-5 bg-white rounded-lg border border-secondary-100 shadow-sm animate-slide-up card-hover">
            <div className="flex items-center">
              <div className="relative mr-3 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-secondary-200 opacity-20 animate-ping-slow"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 text-secondary-500 relative z-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-secondary-700 font-medium">
                  Generate your AI-assisted diagnosis
                </p>
                <p className="text-gray-500 text-sm">
                  Click "Generate Report" to get a comprehensive analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-10 bg-subtle-gradient animate-fade-in">
          <div className="relative size-16 mb-4">
            <div className="absolute inset-0 bg-primary-300/30 rounded-full animate-ping"></div>
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
            Generating Report
          </h3>
          <p className="text-gray-500 text-sm">
            Our AI is analyzing your dental X-ray
          </p>
        </div>
      )}

      {report && !loading && viewMode === "modern" && (
        <div className="p-6 overflow-auto bg-subtle-gradient animate-fade-in">
          <div className="prose prose-zinc prose-sm max-w-none bg-white rounded-lg border border-gray-100 p-6 shadow-sm animate-scale-in overflow-hidden">
            <div
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatReport(report) }}
            />

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Generated {new Date().toLocaleString()}
              </span>
              <div className="inline-flex items-center px-4 py-2 bg-secondary-50 text-secondary-700 rounded-full text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4 mr-1.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                    clipRule="evenodd"
                  />
                </svg>
                AI-Generated Analysis
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-4 bg-gray-50 text-gray-500 flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5 mr-3 text-primary-400 flex-shrink-0 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs leading-relaxed">
                <span className="font-medium">Important note:</span> This
                analysis is AI-generated and intended for educational purposes
                only. Please consult with a qualified dental professional for an
                official diagnosis and treatment plan.
              </p>
            </div>
          </div>
        </div>
      )}

      {report && !loading && viewMode === "classic" && (
        <div className="p-6 overflow-auto bg-subtle-gradient animate-fade-in">
          <div className="prose prose-zinc prose-sm max-w-none bg-white rounded-lg border border-gray-100 p-6 shadow-sm animate-scale-in">
            <div
              className="leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: report
                  .replace(/\n/g, "<br/>")
                  .replace(
                    /(Findings|Diagnosis|Recommendations|Analysis|Summary):/g,
                    '<h3 class="text-primary-700 font-medium text-lg my-3 border-b border-primary-100 pb-2">$1:</h3>'
                  )
                  .replace(
                    /(caries|periapical lesion|periodontal disease|calculus|abscess|impacted tooth)/gi,
                    '<span class="font-medium text-secondary-600 px-1 bg-secondary-50 rounded">$1</span>'
                  ),
              }}
            />

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-secondary-50 text-secondary-700 rounded-full text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4 mr-1.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                    clipRule="evenodd"
                  />
                </svg>
                AI-Generated Analysis
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
