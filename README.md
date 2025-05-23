# Dental X-ray Analysis Platform

<div align="center">
  <img src="frontend/public/logo.png" alt="Dental X-ray Analysis Logo" width="150">
  <h3>AI-Powered Dental Pathology Detection and Diagnosis</h3>
  
  [![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-Latest-61DAFB?logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-Latest-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Live Demo](#-live-demo)
- [Architecture](#-architecture)
- [Backend](#-backend)
  - [API Endpoints](#api-endpoints)
  - [Technologies Used](#backend-technologies)
  - [Project Structure](#backend-structure)
  - [Installation](#backend-installation)
- [Frontend](#-frontend)
  - [Technologies Used](#frontend-technologies)
  - [Project Structure](#frontend-structure)
  - [Installation](#frontend-installation)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [License](#-license)

## 🔍 Overview

This platform provides an intuitive interface for dental professionals to upload dental X-ray images, detect pathologies using advanced computer vision, and receive AI-generated diagnostic reports. The solution combines modern web technologies with powerful AI models to improve dental diagnostics and treatment planning.

## ✨ Features

- **X-ray Upload**: Support for standard DICOM (.dcm, .rvg) dental X-ray file formats
- **Pathology Detection**: Automated detection of dental pathologies using Roboflow's vision API
- **AI Diagnostics**: Intelligent reports generated with OpenAI's GPT models
- **Interactive Visualization**: View detected pathologies with bounding boxes
- **Multi-Image Support**: Process and analyze multiple X-rays in batch
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🌐 Live Demo

- Backend API: [https://python-cmab.onrender.com](https://python-cmab.onrender.com)
- Frontend: [Your frontend URL]

## 🏗 Architecture

The application follows a modern client-server architecture:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│  React Frontend │◄─────►│  FastAPI Backend│◄─────►│  AI Services    │
│  (TypeScript)   │       │  (Python)       │       │  (Roboflow/     │
│                 │       │                 │       │   OpenAI)       │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

## 🔧 Backend

The backend is built with FastAPI, a modern, high-performance web framework for building APIs with Python. It handles file uploads, image processing, and communication with AI services.

### API Endpoints

| Endpoint                   | Method | Description                                     |
| -------------------------- | ------ | ----------------------------------------------- |
| `/`                        | GET    | Health check and welcome message                |
| `/api/v1/upload/`          | POST   | Upload a single DICOM file                      |
| `/api/v1/upload-multiple/` | POST   | Upload multiple DICOM files                     |
| `/api/v1/image/{file_id}`  | GET    | Get the converted image                         |
| `/api/v1/detect/{file_id}` | POST   | Detect pathologies using Roboflow API           |
| `/api/v1/detect-batch/`    | POST   | Detect pathologies for multiple images in batch |
| `/api/v1/report/{file_id}` | POST   | Generate a diagnostic report using OpenAI GPT   |
| `/api/v1/health`           | GET    | Health check endpoint for monitoring            |

### Backend Technologies

- **FastAPI**: Modern, fast web framework for building APIs
- **PyDICOM**: Library for processing DICOM files
- **Pillow**: Image processing library
- **Roboflow API**: Computer vision API for pathology detection
- **OpenAI API**: GPT-based API for generating diagnostic reports
- **Gunicorn + Uvicorn**: Production-ready ASGI server

### Backend Structure

```
backend/
├── app/
│   ├── api/
│   │   └── endpoints.py     # API endpoint definitions
│   ├── core/
│   │   ├── app_factory.py   # Application setup
│   │   └── config.py        # Configuration management
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── services/
│   │   ├── dicom_service.py # DICOM processing
│   │   ├── roboflow_service.py # Vision AI integration
│   │   └── openai_service.py # OpenAI integration
│   └── utils/
│       ├── logger.py        # Logging setup
│       └── startup.py       # Application initialization
├── tests/
│   └── test_api.py          # API integration tests
├── main.py                  # Application entry point
├── requirements.txt         # Project dependencies
└── Dockerfile               # Container configuration
```

### Backend Installation

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your API keys

# Run the server for development
uvicorn main:app --reload
```

## 🎨 Frontend

The frontend is built with React, TypeScript, and Tailwind CSS, providing a modern, responsive user interface for interacting with the dental X-ray analysis platform.

### Frontend Technologies

- **React**: Component-based UI library
- **TypeScript**: Typed JavaScript for better development experience
- **Vite**: Modern frontend build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: Promise-based HTTP client
- **React Router**: Navigation for React applications

### Frontend Structure

```
frontend/
├── public/
│   └── logo.png          # Application logo
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   ├── FileUploader.tsx # File upload component
│   │   ├── ImageViewer.tsx # X-ray viewing component
│   │   └── DiagnosticReport.tsx # Report display
│   ├── config.ts         # Application configuration
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Entry point
├── index.html            # HTML template
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

### Frontend Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## 🚀 Deployment

The application is deployed using Render.com for both backend and frontend.

### Backend Deployment

- **Service Type**: Web Service
- **Environment**: Python
- **Build Command**: `pip install --no-cache-dir -r requirements.txt`
- **Start Command**: `gunicorn main:app --workers 1 --timeout 120 --preload --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

### Frontend Deployment

- **Service Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: URL of the deployed backend API

## 🔐 Environment Variables

### Backend

- `ROBOFLOW_API_KEY`: API key for Roboflow vision services
- `OPENAI_API_KEY`: API key for OpenAI's GPT services
- `TEST_MODE`: Set to "True" to enable test mode

### Frontend

- `VITE_API_URL`: URL of the backend API

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for dental professionals</p>
</div>

