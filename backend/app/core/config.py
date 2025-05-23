import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Create directories for storing uploaded and processed files
UPLOADS_DIR = BASE_DIR / "uploads"
PROCESSED_DIR = BASE_DIR / "processed"

# Create directories if they don't exist
UPLOADS_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

# API Keys
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# API Settings
ROBOFLOW_MODEL_ID = "adr/6"  # Model ID in format 'project/version'
ROBOFLOW_CONFIDENCE = 30  # Confidence threshold (0-100)
ROBOFLOW_OVERLAP = 50  # Overlap threshold (0-100)

# OpenAI Settings
OPENAI_MODEL = "gpt-3.5-turbo"
OPENAI_MAX_TOKENS = 500
OPENAI_TEMPERATURE = 0.3

# Application settings
API_PREFIX = "/api/v1"
DEBUG = True
PROJECT_NAME = "Dental X-ray Diagnostic API"
VERSION = "1.0.0"
DESCRIPTION = "API for dental X-ray diagnostics using Roboflow and OpenAI"
