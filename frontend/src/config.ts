// Frontend configuration file

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const API_ROUTES = {
  UPLOAD: `${API_BASE_URL}/api/v1/upload/`,
  UPLOAD_MULTIPLE: `${API_BASE_URL}/api/v1/upload-multiple/`,
  IMAGE: (id: string) => `${API_BASE_URL}/api/v1/image/${id}`,
  DETECT: (id: string) => `${API_BASE_URL}/api/v1/detect/${id}`,
  DETECT_BATCH: `${API_BASE_URL}/api/v1/detect-batch/`,
  REPORT: (id: string) => `${API_BASE_URL}/api/v1/report/${id}`,
};

// Application settings
export const APP_CONFIG = {
  SUPPORTED_FORMATS: [".dcm", ".rvg"],
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
};

// Color mapping for pathologies
export const PATHOLOGY_COLORS: Record<string, string> = {
  caries: "#E53935", // Red - danger/critical
  periapical_lesion: "#1E88E5", // Blue - common problem
  periodontal_disease: "#43A047", // Green - chronic condition
  calculus: "#F9A825", // Gold/yellow - deposits
  abscess: "#8E24AA", // Purple - infection
  impacted_tooth: "#FB8C00", // Orange - structural issue
};
