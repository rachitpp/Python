from typing import Dict, Any
import json
import requests
import os

from app.core.config import ROBOFLOW_API_KEY, ROBOFLOW_MODEL_ID, ROBOFLOW_CONFIDENCE, ROBOFLOW_OVERLAP

# Switch back to using direct HTTP requests which is more reliable
def call_roboflow_api(image_path: str) -> Dict[str, Any]:
    """
    Call Roboflow API for object detection using direct HTTP requests
    
    Args:
        image_path: Path to the image file
        
    Returns:
        JSON response from Roboflow API
        
    Raises:
        Exception: If API call fails
    """
    # For testing or when API key is not configured, return mock results
    if not ROBOFLOW_API_KEY or ROBOFLOW_API_KEY == 'your_roboflow_api_key':
        print("Roboflow API key not configured, returning mock results")
        return {
            "predictions": [
                {"class": "caries", "confidence": 0.92, "x": 100, "y": 100, "width": 50, "height": 50},
                {"class": "periapical_lesion", "confidence": 0.85, "x": 200, "y": 200, "width": 30, "height": 30}
            ]
        }
    
    try:
        # Construct the API URL with model ID
        api_url = f"https://detect.roboflow.com/{ROBOFLOW_MODEL_ID}"
        
        # Set up the parameters for the API call
        params = {
            "api_key": ROBOFLOW_API_KEY,
            "confidence": ROBOFLOW_CONFIDENCE,
            "overlap": ROBOFLOW_OVERLAP
        }
        
        # Open the image file
        with open(image_path, "rb") as img_file:
            # Call the Roboflow API directly using requests
            response = requests.post(
                api_url,
                params=params,
                files={"file": img_file}
            )
        
        # Check if the request was successful
        if response.status_code != 200:
            raise Exception(f"Roboflow API error: {response.text}")
        
        # Parse and return the JSON response
        return response.json()
    except Exception as e:
        raise Exception(f"Error calling Roboflow API: {str(e)}")
