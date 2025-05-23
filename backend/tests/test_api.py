import pytest
import os
import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.core.app_factory import create_app
from app.core.config import UPLOADS_DIR, PROCESSED_DIR

# Create test client
app = create_app()
client = TestClient(app)


def test_read_root():
    """
    Test the root endpoint
    """
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_api_endpoints_exist():
    """
    Test that API endpoints exist
    """
    # Test upload endpoint
    response = client.post("/api/v1/upload/")
    assert response.status_code in (400, 422)  # Should fail without file, but endpoint exists
    
    # Test multiple upload endpoint
    response = client.post("/api/v1/upload-multiple/")
    assert response.status_code in (400, 422)  # Should fail without files, but endpoint exists
    
    # Test image endpoint
    response = client.get("/api/v1/image/nonexistent")
    assert response.status_code == 404  # Should 404 for nonexistent file, but endpoint exists
    
    # Test detect endpoint
    response = client.post("/api/v1/detect/nonexistent")
    assert response.status_code == 404  # Should 404 for nonexistent file, but endpoint exists
    
    # Test batch detect endpoint
    response = client.post("/api/v1/detect-batch/", json=["nonexistent"])
    assert response.status_code in (200, 422)  # Should handle nonexistent files, but endpoint exists
    
    # Test report endpoint
    response = client.post("/api/v1/report/nonexistent")
    assert response.status_code == 404  # Should 404 for nonexistent file, but endpoint exists


@pytest.fixture
def mock_uploaded_file():
    """
    Fixture to create a mock uploaded DICOM file
    """
    # Create a temporary test file ID
    test_file_id = "test-file-id"
    
    # Path for the processed PNG file
    png_path = PROCESSED_DIR / f"{test_file_id}.png"
    
    # Create the directories if they don't exist
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    
    # Create an empty file to simulate a processed image
    with open(png_path, "w") as f:
        f.write("mock png content")
    
    # Create a mock detection results file with proper format
    detection_path = PROCESSED_DIR / f"{test_file_id}_detection.json"
    mock_results = {
        "predictions": [
            {"class": "caries", "confidence": 0.92, "x": 100, "y": 100, "width": 50, "height": 50},
            {"class": "periapical_lesion", "confidence": 0.85, "x": 200, "y": 200, "width": 30, "height": 30}
        ]
    }
    
    with open(detection_path, "w") as f:
        json.dump(mock_results, f)
    
    # Return the test file ID for use in tests
    yield test_file_id
    
    # Cleanup after tests
    if os.path.exists(png_path):
        os.remove(png_path)
    if os.path.exists(detection_path):
        os.remove(detection_path)


@patch("app.services.dicom_service.convert_dicom_to_png")
def test_upload_endpoint(mock_convert, tmp_path):
    """
    Test the file upload endpoint
    """
    # Mock the conversion function to return a file path
    mock_convert.return_value = str(PROCESSED_DIR / "test.png")
    
    # Create a test file
    test_file_path = tmp_path / "test.dcm"
    with open(test_file_path, "w") as f:
        f.write("mock dicom content")
    
    # Upload the test file
    with open(test_file_path, "rb") as f:
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("test.dcm", f, "application/dicom")}
        )
    
    # Verify the response
    assert response.status_code == 200
    assert "message" in response.json()
    assert "file_id" in response.json()
    assert "converted_image_path" in response.json()


@patch("app.services.dicom_service.convert_dicom_to_png")
def test_upload_multiple_endpoint(mock_convert, tmp_path):
    """
    Test the multiple file upload endpoint
    """
    # Mock the conversion function to return a file path
    mock_convert.return_value = str(PROCESSED_DIR / "test.png")
    
    # Create test files
    test_file_path1 = tmp_path / "test1.dcm"
    test_file_path2 = tmp_path / "test2.dcm"
    
    with open(test_file_path1, "w") as f:
        f.write("mock dicom content 1")
    with open(test_file_path2, "w") as f:
        f.write("mock dicom content 2")
    
    # Upload the test files
    with open(test_file_path1, "rb") as f1, open(test_file_path2, "rb") as f2:
        response = client.post(
            "/api/v1/upload-multiple/",
            files=[
                ("files", ("test1.dcm", f1, "application/dicom")),
                ("files", ("test2.dcm", f2, "application/dicom"))
            ]
        )
    
    # Verify the response
    assert response.status_code == 200
    assert "message" in response.json()
    assert "files" in response.json()
    assert "count" in response.json()
    assert response.json()["count"] == 2
    assert len(response.json()["files"]) == 2


def test_get_image_endpoint(mock_uploaded_file):
    """
    Test retrieving an image
    """
    response = client.get(f"/api/v1/image/{mock_uploaded_file}")
    assert response.status_code == 200


@patch("app.services.roboflow_service.call_roboflow_api")
def test_detect_pathologies_endpoint(mock_roboflow, mock_uploaded_file):
    """
    Test the detect pathologies endpoint
    """
    # Mock Roboflow API response
    mock_results = {
        "predictions": [
            {"class": "caries", "confidence": 0.92, "x": 100, "y": 100, "width": 50, "height": 50},
            {"class": "periapical_lesion", "confidence": 0.85, "x": 200, "y": 200, "width": 30, "height": 30}
        ]
    }
    
    # Configure the mock correctly using side_effect to ensure it's called
    def mock_call_roboflow_api(image_path):
        return mock_results
        
    mock_roboflow.side_effect = mock_call_roboflow_api
    
    # Test the endpoint
    response = client.post(f"/api/v1/detect/{mock_uploaded_file}")
    
    # Verify the response
    assert response.status_code == 200
    assert "message" in response.json()
    assert "detection_results" in response.json()
    assert len(response.json()["detection_results"]["predictions"]) == 2


@patch("app.services.roboflow_service.call_roboflow_api")
def test_detect_batch_endpoint(mock_roboflow, mock_uploaded_file):
    """
    Test the batch detection endpoint
    """
    # Mock Roboflow API response
    mock_results = {
        "predictions": [
            {"class": "caries", "confidence": 0.92, "x": 100, "y": 100, "width": 50, "height": 50},
            {"class": "periapical_lesion", "confidence": 0.85, "x": 200, "y": 200, "width": 30, "height": 30}
        ]
    }
    
    # Configure the mock correctly using side_effect
    def mock_call_roboflow_api(image_path):
        return mock_results
        
    mock_roboflow.side_effect = mock_call_roboflow_api
    
    # Test the endpoint
    response = client.post(
        "/api/v1/detect-batch/", 
        json=[mock_uploaded_file, "nonexistent-file"]
    )
    
    # Verify the response
    assert response.status_code == 200
    assert "results" in response.json()
    assert "errors" in response.json()
    assert len(response.json()["results"]) == 1
    assert len(response.json()["errors"]) == 1


@patch("app.services.openai_service.generate_diagnostic_report")
def test_generate_report_endpoint(mock_openai, mock_uploaded_file):
    """
    Test the report generation endpoint
    """
    # Mock OpenAI's response
    mock_report = """# Dental Radiographic Diagnostic Report

## Summary
Multiple dental pathologies detected in the X-ray.

## Findings
- Patient has dental caries and periapical lesion.

## Recommendations
Immediate dental consultation is recommended.
    """
    mock_openai.return_value = mock_report
    
    # Test the endpoint
    response = client.post(f"/api/v1/report/{mock_uploaded_file}")
    
    # Verify the response
    assert response.status_code == 200
    assert "message" in response.json()
    assert "report" in response.json()
    assert "## Findings" in response.json()["report"]


def test_error_handling():
    """
    Test error handling for various scenarios
    """
    # Test uploading an invalid file type
    with open(__file__, "rb") as f:
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("test.txt", f, "text/plain")}
        )
    assert response.status_code == 400
    assert "Only DICOM files" in response.json()["detail"]
    
    # Test uploading multiple invalid file types
    with open(__file__, "rb") as f:
        response = client.post(
            "/api/v1/upload-multiple/",
            files=[
                ("files", ("test.txt", f, "text/plain"))
            ]
        )
    assert response.status_code in (200, 400)
    
    # Test accessing a non-existent image
    response = client.get("/api/v1/image/nonexistent-image")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
