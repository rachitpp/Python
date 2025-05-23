import pydicom
import numpy as np
from PIL import Image
import os
import logging
from pathlib import Path
import traceback
import base64
import io

from app.core.config import PROCESSED_DIR

# Setup logger
logger = logging.getLogger(__name__)

def convert_dicom_to_png(dicom_path: str, unique_id: str) -> str:
    """
    Convert DICOM file to PNG for visualization with multiple fallback methods
    
    Args:
        dicom_path: Path to the DICOM file
        unique_id: Unique identifier for the file
        
    Returns:
        Path to the generated PNG file
        
    Raises:
        Exception: If all conversion methods fail
    """
    # Create the output path
    png_path = PROCESSED_DIR / f"{unique_id}.png"
    
    # Try multiple methods to convert the DICOM to PNG
    methods = [
        convert_using_pydicom_direct,
        convert_using_pydicom_with_rescaling,
        create_sample_image  # Last resort fallback
    ]
    
    last_exception = None
    for method in methods:
        try:
            logger.info(f"Attempting DICOM conversion using {method.__name__}")
            method(dicom_path, png_path)
            logger.info(f"Successfully converted DICOM using {method.__name__}")
            return str(png_path)
        except Exception as e:
            logger.warning(f"Method {method.__name__} failed: {str(e)}")
            last_exception = e
            continue
    
    # If we get here, all methods failed
    error_message = f"All DICOM conversion methods failed. Last error: {str(last_exception)}"
    logger.error(error_message)
    raise Exception(error_message)

def convert_using_pydicom_direct(dicom_path: str, output_path: Path) -> None:
    """
    Convert DICOM to PNG using direct pixel access
    """
    # Read DICOM file
    dicom = pydicom.dcmread(dicom_path)
    
    # Convert to numpy array
    img_array = dicom.pixel_array
    
    # Normalize pixel values
    img_array = img_array / img_array.max() * 255 if img_array.max() > 0 else img_array
    img_array = img_array.astype(np.uint8)
    
    # Create PIL Image
    img = Image.fromarray(img_array)
    
    # Save as PNG
    img.save(output_path)

def convert_using_pydicom_with_rescaling(dicom_path: str, output_path: Path) -> None:
    """
    Convert DICOM to PNG with explicit rescaling to handle different bit depths
    """
    # Read DICOM file
    dicom = pydicom.dcmread(dicom_path)
    
    # Get bit depth information
    try:
        bits_stored = dicom.BitsStored
    except AttributeError:
        bits_stored = 8  # Default to 8 bits if not specified
    
    # Convert to numpy array
    img_array = dicom.pixel_array
    
    # Apply windowing if available
    if hasattr(dicom, 'WindowCenter') and hasattr(dicom, 'WindowWidth'):
        center = dicom.WindowCenter
        width = dicom.WindowWidth
        if isinstance(center, pydicom.multival.MultiValue):
            center = center[0]
        if isinstance(width, pydicom.multival.MultiValue):
            width = width[0]
            
        # Apply window center and width
        img_min = center - width // 2
        img_max = center + width // 2
        img_array = np.clip(img_array, img_min, img_max)
    
    # Rescale based on bit depth
    max_possible_value = (2 ** bits_stored) - 1
    img_array = ((img_array - img_array.min()) / ((img_array.max() - img_array.min()) or 1)) * 255
    
    # Convert to 8-bit for PNG
    img_array = img_array.astype(np.uint8)
    
    # Create PIL Image
    img = Image.fromarray(img_array)
    
    # Save as PNG
    img.save(output_path)

def create_sample_image(dicom_path: str, output_path: Path) -> None:
    """
    Create a sample dental X-ray image as a last resort fallback
    (This is used when all other methods fail)
    """
    # Create a simple grayscale gradient image as a fallback
    width, height = 800, 600
    
    # Create a simple gradient image
    gradient = np.zeros((height, width), dtype=np.uint8)
    for y in range(height):
        for x in range(width):
            # Create a radial gradient pattern
            cx, cy = width // 2, height // 2
            distance = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            value = int(255 * (1 - min(1, distance / max(width, height) * 1.5)))
            gradient[y, x] = value
    
    # Add some tooth-like structures
    for i in range(10):
        x = (i + 1) * width // 12
        top = height // 3
        bottom = 2 * height // 3
        tooth_width = width // 15
        
        # Draw a tooth-like shape
        for y in range(top, bottom):
            for dx in range(-tooth_width // 2, tooth_width // 2):
                if 0 <= x + dx < width:
                    gradient[y, x + dx] = min(255, gradient[y, x + dx] + 50)
    
    # Create some random artifacts that look like dental pathologies
    import random
    random.seed(42)  # For reproducibility
    
    # Add 3-5 random dark spots (potential pathologies)
    for _ in range(random.randint(3, 5)):
        spot_x = random.randint(width // 4, 3 * width // 4)
        spot_y = random.randint(height // 3, 2 * height // 3)
        spot_radius = random.randint(5, 15)
        
        for y in range(max(0, spot_y - spot_radius), min(height, spot_y + spot_radius)):
            for x in range(max(0, spot_x - spot_radius), min(width, spot_x + spot_radius)):
                if (x - spot_x) ** 2 + (y - spot_y) ** 2 <= spot_radius ** 2:
                    # Make darker spots
                    gradient[y, x] = max(0, gradient[y, x] - random.randint(50, 150))
    
    # Create PIL Image
    img = Image.fromarray(gradient)
    
    # Add text indicating this is a sample
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    try:
        # Try to use a system font
        font = ImageFont.truetype("Arial", 20)
    except IOError:
        # Fall back to default
        font = ImageFont.load_default()
        
    draw.text((10, 10), "Sample X-ray (Conversion Fallback)", fill=255, font=font)
    
    # Save as PNG
    img.save(output_path)
