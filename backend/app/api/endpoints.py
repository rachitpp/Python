from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse, FileResponse
from typing import List, Optional, Dict
import os
import uuid
import shutil
import json
from pathlib import Path

from app.core.config import UPLOADS_DIR, PROCESSED_DIR
from app.models.schemas import UploadResponse, DetectionResult, DiagnosticReport, MultipleUploadResponse
from app.services.dicom_service import convert_dicom_to_png
from app.services.roboflow_service import call_roboflow_api
from app.services.openai_service import generate_diagnostic_report

# Create router
router = APIRouter()

@router.post("/upload/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and process a single DICOM file (.dcm or .rvg)
    """
    # Check if file extension is valid
    if not (file.filename.endswith(".dcm") or file.filename.endswith(".rvg")):
        raise HTTPException(status_code=400, detail="Only DICOM files (.dcm or .rvg) are supported")
    
    # Generate a unique filename
    unique_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{unique_id}{file_extension}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Convert DICOM to PNG
        png_path = convert_dicom_to_png(str(file_path), unique_id)
        
        return UploadResponse(
            message="File uploaded and converted successfully",
            file_id=unique_id,
            converted_image_path=png_path
        )
    except Exception as e:
        # If there's an error, clean up the uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-multiple/", response_model=MultipleUploadResponse)
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """
    Upload and process multiple DICOM files (.dcm or .rvg)
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    successful_uploads = []
    errors = []
    
    for file in files:
        # Check if file extension is valid
        if not (file.filename.endswith(".dcm") or file.filename.endswith(".rvg")):
            errors.append(f"{file.filename}: Only DICOM files (.dcm or .rvg) are supported")
            continue
        
        # Generate a unique filename
        unique_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{unique_id}{file_extension}"
        file_path = UPLOADS_DIR / unique_filename
        
        try:
            # Save the uploaded file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Convert DICOM to PNG
            png_path = convert_dicom_to_png(str(file_path), unique_id)
            
            successful_uploads.append({
                "original_filename": file.filename,
                "file_id": unique_id,
                "converted_image_path": png_path
            })
            
        except Exception as e:
            # If there's an error, clean up the uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
            errors.append(f"{file.filename}: {str(e)}")
    
    if not successful_uploads and errors:
        raise HTTPException(status_code=400, detail={"message": "All uploads failed", "errors": errors})
    
    return MultipleUploadResponse(
        message="Files processed successfully" if not errors else "Some files processed with errors",
        files=successful_uploads,
        count=len(successful_uploads)
    )

@router.get("/image/{file_id}")
async def get_image(file_id: str):
    """
    Get the converted image
    """
    png_path = PROCESSED_DIR / f"{file_id}.png"
    if not png_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(png_path)

@router.post("/detect/{file_id}", response_model=DetectionResult)
async def detect_pathologies(file_id: str, background_tasks: BackgroundTasks):
    """
    Detect pathologies using Roboflow API
    """
    png_path = PROCESSED_DIR / f"{file_id}.png"
    if not png_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    try:
        # Check if detection results already exist (for tests or caching)
        detection_path = PROCESSED_DIR / f"{file_id}_detection.json"
        if detection_path.exists():
            # If results already exist, use them
            with open(detection_path, "r") as f:
                detection_results = json.load(f)
                return DetectionResult(
                    message="Pathologies detected successfully (cached)",
                    detection_results=detection_results
                )
        
        # Otherwise call Roboflow API for object detection
        detection_results = call_roboflow_api(str(png_path))
        
        # Save detection results
        with open(detection_path, "w") as f:
            json.dump(detection_results, f)
        
        return DetectionResult(
            message="Pathologies detected successfully",
            detection_results=detection_results
        )
    except Exception as e:
        error_message = f"Error detecting pathologies: {str(e)}"
        print(error_message)
        raise HTTPException(status_code=500, detail=error_message)

@router.post("/report/{file_id}", response_model=DiagnosticReport)
async def generate_report(file_id: str):
    """
    Generate diagnostic report using OpenAI GPT
    """
    detection_path = PROCESSED_DIR / f"{file_id}_detection.json"
    if not detection_path.exists():
        raise HTTPException(status_code=404, detail="Detection results not found")
    
    try:
        # Load detection results
        with open(detection_path, "r") as f:
            detection_results = json.load(f)
        
        # Generate report using OpenAI GPT
        report = generate_diagnostic_report(detection_results)
        
        # Save report
        report_path = PROCESSED_DIR / f"{file_id}_report.json"
        with open(report_path, "w") as f:
            json.dump({"report": report}, f)
        
        return DiagnosticReport(
            message="Diagnostic report generated successfully",
            report=report
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add a batch processing endpoint for multiple files
@router.post("/detect-batch/", response_model=Dict[str, List])
async def detect_pathologies_batch(file_ids: List[str]):
    """
    Detect pathologies for multiple images in batch
    """
    results = []
    errors = []
    
    for file_id in file_ids:
        png_path = PROCESSED_DIR / f"{file_id}.png"
        if not png_path.exists():
            errors.append({"file_id": file_id, "error": "Image not found"})
            continue
        
        try:
            # Check if detection results already exist (for tests or caching)
            detection_path = PROCESSED_DIR / f"{file_id}_detection.json"
            if detection_path.exists():
                # If results already exist, use them
                with open(detection_path, "r") as f:
                    detection_results = json.load(f)
                    results.append({
                        "file_id": file_id, 
                        "detection_results": detection_results
                    })
                    continue
            
            # Call Roboflow API for object detection
            detection_results = call_roboflow_api(str(png_path))
            
            # Save detection results
            with open(detection_path, "w") as f:
                json.dump(detection_results, f)
            
            results.append({
                "file_id": file_id, 
                "detection_results": detection_results
            })
            
        except Exception as e:
            error_message = str(e)
            print(f"Error processing file {file_id}: {error_message}")
            errors.append({"file_id": file_id, "error": error_message})
    
    return {
        "results": results,
        "errors": errors
    }
