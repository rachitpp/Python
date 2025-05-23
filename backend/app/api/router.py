from fastapi import APIRouter
from app.api.endpoints import router as endpoints_router

# Create main API router
api_router = APIRouter()

# Include the endpoints router
api_router.include_router(endpoints_router, prefix="")
