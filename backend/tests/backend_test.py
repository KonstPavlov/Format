# Pytest file for ФОРМАТ apartment renovation backend APIs
import os
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

# Load environment configurations
frontend_env = Path("/app/frontend/.env")
backend_env = Path("/app/backend/.env")

if frontend_env.exists():
    load_dotenv(frontend_env)
if backend_env.exists():
    load_dotenv(backend_env)

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://capella-builds.preview.emergentagent.com").rstrip("/")
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

@pytest.fixture(scope="session")
def db_client():
    """Establish connection to MongoDB for test data cleanup"""
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()

@pytest.fixture(autouse=True, scope="class")
def cleanup_test_data(db_client):
    """Teardown: Delete all test-created data with TEST_ prefix"""
    yield
    # Cleanup leads collection
    leads_deleted = db_client.leads.delete_many({"name": {"$regex": "^TEST_"}})
    print(f"\n[Teardown] Deleted {leads_deleted.deleted_count} test documents from leads collection.")
    # Cleanup status_checks collection
    status_deleted = db_client.status_checks.delete_many({"client_name": {"$regex": "^TEST_"}})
    print(f"[Teardown] Deleted {status_deleted.deleted_count} test documents from status_checks collection.")

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestBackendAPI:
    """Core FastAPI Endpoint Tests"""

    def test_root_endpoint(self, api_client):
        """Test root /api endpoint status and response structure"""
        response = api_client.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "ФОРМАТ" in data["message"]

    def test_create_lead_and_verify_persistence(self, api_client):
        """Test Lead Creation (POST /api/leads) and verify persistence (GET /api/leads)"""
        # Create Payload
        payload = {
            "name": "TEST_Alex",
            "phone": "+7 (999) 111-22-33",
            "comment": "TEST_Comment from automated pytest backend_test.",
            "calculator": {
                "room_type": "apartment",
                "area": 75.5,
                "repair_type": "overhaul",
                "addons": ["plumbing", "electrical"],
                "estimated_price": 680000.0
            }
        }
        
        # 1. POST Request to Create
        create_response = api_client.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_response.status_code == 200
        
        created_data = create_response.json()
        assert "id" in created_data or "_id" in created_data
        assert created_data["name"] == payload["name"]
        assert created_data["phone"] == payload["phone"]
        assert created_data["comment"] == payload["comment"]
        assert created_data["calculator"]["room_type"] == payload["calculator"]["room_type"]
        assert created_data["calculator"]["area"] == payload["calculator"]["area"]
        assert created_data["calculator"]["repair_type"] == payload["calculator"]["repair_type"]
        assert created_data["calculator"]["addons"] == payload["calculator"]["addons"]
        assert created_data["calculator"]["estimated_price"] == payload["calculator"]["estimated_price"]
        
        lead_id = created_data.get("id") or created_data.get("_id")
        assert isinstance(lead_id, str)
        
        # 2. GET Request to verify persistence in database
        get_response = api_client.get(f"{BASE_URL}/api/leads")
        assert get_response.status_code == 200
        
        leads_list = get_response.json()
        assert isinstance(leads_list, list)
        assert len(leads_list) > 0
        
        # Find the created lead in the list
        found_lead = None
        for lead in leads_list:
            if (lead.get("id") == lead_id) or (lead.get("_id") == lead_id):
                found_lead = lead
                break
                
        assert found_lead is not None, f"Lead with id {lead_id} was not found in GET /api/leads list"
        assert found_lead["name"] == payload["name"]
        assert found_lead["phone"] == payload["phone"]
        assert found_lead["comment"] == payload["comment"]
        assert found_lead["calculator"]["area"] == payload["calculator"]["area"]

    def test_create_status_and_verify_persistence(self, api_client):
        """Test Status check endpoint (POST /api/status) and verify persistence (GET /api/status)"""
        # Create Payload
        payload = {
            "client_name": "TEST_Status_Client"
        }
        
        # 1. POST Request to Create Status Check
        create_response = api_client.post(f"{BASE_URL}/api/status", json=payload)
        assert create_response.status_code == 200
        
        created_data = create_response.json()
        assert "id" in created_data
        assert created_data["client_name"] == payload["client_name"]
        assert "timestamp" in created_data
        
        status_id = created_data["id"]
        
        # 2. GET Request to verify persistence
        get_response = api_client.get(f"{BASE_URL}/api/status")
        assert get_response.status_code == 200
        
        status_list = get_response.json()
        assert isinstance(status_list, list)
        assert len(status_list) > 0
        
        # Find the created status check in the list
        found_status = None
        for status in status_list:
            if status.get("id") == status_id:
                found_status = status
                break
                
        assert found_status is not None, f"Status check with id {status_id} was not found in GET /api/status list"
        assert found_status["client_name"] == payload["client_name"]

    def test_create_lead_validation_error(self, api_client):
        """Test error handling when creating a lead with invalid/missing parameters"""
        # Missing required 'phone' field
        invalid_payload = {
            "name": "TEST_Invalid_User",
            "comment": "Missing phone number"
        }
        
        response = api_client.post(f"{BASE_URL}/api/leads", json=invalid_payload)
        assert response.status_code == 422
        
        # FastAPI returns structured validation errors
        data = response.json()
        assert "detail" in data
        assert isinstance(data["detail"], list)
        
        # Ensure the missing field is reported
        missing_fields = [err["loc"][-1] for err in data["detail"]]
        assert "phone" in missing_fields
