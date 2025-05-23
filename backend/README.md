# Dental X-ray Diagnostic API

This is the backend API for the Dental X-ray Diagnostic Web Application. It provides endpoints for uploading and processing DICOM files, detecting pathologies using Roboflow, and generating diagnostic reports using OpenAI GPT.

## Features

- DICOM file upload and conversion to PNG
- Integration with Roboflow for pathology detection
- Integration with OpenAI GPT for diagnostic report generation
- RESTful API with FastAPI

## Project Structure

```
backend/
├── app/                    # Application package
│   ├── api/                # API endpoints and routers
│   ├── core/               # Core application components
│   ├── models/             # Pydantic models/schemas
│   ├── services/           # Service layer for business logic
│   └── utils/              # Utility functions and helpers
├── tests/                  # Test directory
├── uploads/                # Directory for uploaded DICOM files
├── processed/              # Directory for processed files
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
└── .env                    # Environment variables (not version controlled)
```

## Setup Instructions

1. Create a virtual environment:

```bash
python -m venv venv
```

2. Activate the virtual environment:

```bash
# On Windows
venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your API keys:

```
ROBOFLOW_API_KEY=your_roboflow_api_key
OPENAI_API_KEY=your_openai_api_key
```

5. Run the application:

```bash
python main.py
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### `/api/v1/upload/`

- **Method**: POST
- **Description**: Upload a DICOM file (.dcm or .rvg)
- **Returns**: Information about the uploaded file, including a file_id

### `/api/v1/image/{file_id}`

- **Method**: GET
- **Description**: Get the converted image
- **Returns**: The PNG image

### `/api/v1/detect/{file_id}`

- **Method**: POST
- **Description**: Detect pathologies using Roboflow API
- **Returns**: Detection results with bounding boxes

### `/api/v1/report/{file_id}`

- **Method**: POST
- **Description**: Generate a diagnostic report using OpenAI GPT
- **Returns**: The generated diagnostic report

## Testing

Run tests with pytest:

```bash
python -m pytest
```
