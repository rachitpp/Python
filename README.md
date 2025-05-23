# Dental X-ray Analysis Application

This application provides AI-powered analysis of dental X-rays, detecting pathologies and generating diagnostic reports.

## Docker Setup

The application is containerized using Docker, with separate services for the frontend and backend.

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Clone the repository
2. Navigate to the project root
3. Build and start the containers:

```bash
docker-compose up --build
```

This will start:

- Backend API service on port 8000
- Frontend web interface on port 80

Access the application by opening http://localhost in your browser.

### Development Mode

To run the services in development mode with hot-reloading:

#### Backend

```bash
cd backend
uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend
npm run dev
```

## Running Tests

### Backend Tests

```bash
cd backend
pytest -v
```

## API Endpoints

The backend provides the following endpoints:

- `POST /api/v1/upload/` - Upload a DICOM file
- `GET /api/v1/image/{file_id}` - Get the processed image
- `POST /api/v1/detect/{file_id}` - Detect pathologies in the image
- `POST /api/v1/report/{file_id}` - Generate a diagnostic report

## Architecture

- **Frontend**: React with Vite, TypeScript, and Tailwind CSS
- **Backend**: FastAPI, Python, with OpenAI integration for report generation

## Note for Windows PowerShell Users

If using Windows PowerShell, run commands separately rather than using `&&`:

```powershell
cd backend
uvicorn main:app --reload
```

Instead of:

```bash
cd backend && uvicorn main:app --reload
```
