# Dental X-ray Diagnostic Web Application - Frontend

## Overview

This is the frontend for the Dental X-ray Diagnostic Web Application. It allows users to upload Dental X-ray DICOM (.dcm or .rvg) images, visualize detected pathologies via bounding boxes, and generate diagnostic reports using AI.

## Features

- DICOM file upload interface
- X-ray image visualization with bounding boxes for detected pathologies
- Diagnostic report display panel
- Modern UI built with React, TypeScript, and Tailwind CSS

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── Navbar.tsx              # Application header
│   │   ├── FileUploader.tsx        # File upload component
│   │   ├── ImageViewer.tsx         # Image and bounding box renderer
│   │   └── DiagnosticReport.tsx    # Report display component
│   ├── App.tsx         # Main application component
│   ├── index.css       # Global styles including Tailwind
│   └── main.tsx        # Application entry point
├── index.html          # HTML template
└── package.json        # Dependencies and scripts
```

## Setup and Installation

1. Make sure you have Node.js installed (version 14.x or higher)

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at http://localhost:5173 (or the port shown in your terminal)

## Backend Integration

This frontend connects to a FastAPI backend that handles:
- DICOM file processing
- Integration with Roboflow for pathology detection
- Integration with OpenAI for diagnostic report generation

Make sure the backend server is running on http://localhost:8000 before using the frontend.

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- React Toastify (for notifications)
- Canvas API (for rendering images and bounding boxes)

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.
