from typing import Dict, Any, List
import openai
import logging

from app.core.config import OPENAI_API_KEY, OPENAI_MODEL, OPENAI_MAX_TOKENS, OPENAI_TEMPERATURE
from app.services.mock_report_service import generate_mock_diagnostic_report

# Setup logger
logger = logging.getLogger(__name__)

def generate_diagnostic_report(detection_results: Dict[str, Any]) -> str:
    """
    Generate a diagnostic report using OpenAI GPT or fallback to mock generator
    
    Args:
        detection_results: Detection results from Roboflow API
        
    Returns:
        Generated diagnostic report
    """
    # Check if OpenAI API key is available
    if not OPENAI_API_KEY or OPENAI_API_KEY == 'your_openai_api_key':
        logger.info("OpenAI API key not configured, using mock report generator")
        return generate_mock_diagnostic_report(detection_results)
    
    # If we have an API key, use OpenAI
    try:
        openai.api_key = OPENAI_API_KEY
        
        # Format the detected pathologies
        detected_items = detection_results.get("predictions", [])
        
        # Create a prompt for the OpenAI API
        prompt = f"""
        You are a dental radiologist. Based on the image annotations provided below (which include detected pathologies), 
        write a concise diagnostic report in clinical language.
        
        Detected pathologies:
        """
        
        for item in detected_items:
            prompt += f"\n- {item['class']} (confidence: {item['confidence']:.1%})"
        
        prompt += """
        
        Generate a brief diagnostic report:
        - Mention detected pathologies
        - Mention approximate tooth location if applicable
        - Add clinical advice if needed
        """
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "system", "content": prompt}],
            max_tokens=OPENAI_MAX_TOKENS,
            temperature=OPENAI_TEMPERATURE
        )
        
        # Extract the generated report
        report = response.choices[0].message.content.strip()
        return report
    except Exception as e:
        logger.warning(f"Error using OpenAI API: {str(e)}. Falling back to mock report generator.")
        return generate_mock_diagnostic_report(detection_results)
