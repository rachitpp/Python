import uvicorn
from app.core.app_factory import create_app
from app.utils.logger import get_logger

# Create logger
logger = get_logger(__name__)

# Create the FastAPI application
app = create_app()

if __name__ == "__main__":
    logger.info("Starting Dental X-ray Diagnostic API")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
