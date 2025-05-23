// Frontend configuration file

// API endpoints
export const API_BASE_URL = 'http://localhost:8000';
export const API_ROUTES = {
  UPLOAD: `${API_BASE_URL}/api/v1/upload/`,
  IMAGE: (id: string) => `${API_BASE_URL}/api/v1/image/${id}`,
  DETECT: (id: string) => `${API_BASE_URL}/api/v1/detect/${id}`,
  REPORT: (id: string) => `${API_BASE_URL}/api/v1/report/${id}`,
};

// Application settings
export const APP_CONFIG = {
  SUPPORTED_FORMATS: ['.dcm', '.rvg'],
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
};

// Color mapping for pathologies
export const PATHOLOGY_COLORS: Record<string, string> = {
  'caries': '#FF5733', // Red-orange
  'periapical_lesion': '#33A1FF', // Blue
  'periodontal_disease': '#33FF57', // Green
  'calculus': '#FF33A1', // Pink
  'abscess': '#A133FF', // Purple
  'impacted_tooth': '#FFFF33', // Yellow
};
