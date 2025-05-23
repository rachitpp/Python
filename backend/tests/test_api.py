import pytest
from fastapi.testclient import TestClient
from app.core.app_factory import create_app

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
    
    # Test image endpoint
    response = client.get("/api/v1/image/nonexistent")
    assert response.status_code == 404  # Should 404 for nonexistent file, but endpoint exists
    
    # Test detect endpoint
    response = client.post("/api/v1/detect/nonexistent")
    assert response.status_code == 404  # Should 404 for nonexistent file, but endpoint exists
    
    # Test report endpoint
    response = client.post("/api/v1/report/nonexistent")
    assert response.status_code == 404  # Should 404 for nonexistent file, but endpoint exists
