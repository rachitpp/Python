from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import API_PREFIX, PROJECT_NAME, VERSION, DESCRIPTION


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application
    """
    app = FastAPI(
        title=PROJECT_NAME,
        version=VERSION,
        description=DESCRIPTION
    )
    
    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allows all origins in development
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )
    
    # Include API router
    app.include_router(api_router, prefix=API_PREFIX)
    
    @app.get("/")
    async def root():
        return {"message": f"Welcome to {PROJECT_NAME}"}
    
    return app
