"""
Startup utilities for the application.
These functions are called when the application starts to ensure proper initialization.
"""

import os
import numpy as np
from PIL import Image
from pathlib import Path
import logging

from app.core.config import UPLOADS_DIR, PROCESSED_DIR

logger = logging.getLogger(__name__)

def initialize_app():
    """
    Initialize the application.
    - Create necessary directories
    - Create placeholder files for testing
    """
    logger.info("Initializing application...")
    
    # Ensure directories exist
    UPLOADS_DIR.mkdir(exist_ok=True)
    PROCESSED_DIR.mkdir(exist_ok=True)
    
    # Create a placeholder image for testing
    create_placeholder_image()
    
    logger.info("Application initialized successfully")

def create_placeholder_image():
    """
    Create a placeholder image to use as a fallback
    """
    placeholder_path = PROCESSED_DIR / "placeholder.png"
    
    # Skip if the file already exists
    if placeholder_path.exists():
        return
    
    try:
        # Create a simple gradient test image
        width, height = 400, 300
        image = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Create a gradient background
        for y in range(height):
            for x in range(width):
                image[y, x] = [
                    int(255 * (1 - y/height)),
                    int(255 * (x/width * 0.7)),
                    int(255 * (y/height * 0.5 + 0.2))
                ]
        
        # Convert to PIL Image and save
        img = Image.fromarray(image)
        img.save(placeholder_path)
        
        logger.info(f"Created placeholder image at {placeholder_path}")
    except Exception as e:
        logger.error(f"Failed to create placeholder image: {str(e)}") 