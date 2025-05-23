from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UploadResponse(BaseModel):
    message: str
    file_id: str
    converted_image_path: str

class DetectionResult(BaseModel):
    message: str
    detection_results: Dict[str, Any]

class DiagnosticReport(BaseModel):
    message: str
    report: str

class Prediction(BaseModel):
    class_name: str = Field(..., alias="class")
    confidence: float
    x: float
    y: float
    width: float
    height: float

class RoboflowResponse(BaseModel):
    predictions: List[Prediction]
    time: float

class Error(BaseModel):
    detail: str
