"""
Backend tests for ФОРМАТ landing page.
Verifies the refactor to remove MongoDB and use SMTP-only lead capture
did not break the API contract.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://capella-builds.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


# --- Health check (no MongoDB dependency) ---
class TestHealth:
    def test_root_returns_200_and_message(self, api_client):
        r = api_client.get(f"{API}/", timeout=15)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert "message" in data
        assert isinstance(data["message"], str) and len(data["message"]) > 0


# --- Lead form (SMTP-only, no DB) ---
class TestLeads:
    def test_create_lead_minimal_payload(self, api_client):
        payload = {
            "name": "TEST_Иван",
            "phone": "+7 900 000 00 01",
            "comment": "TEST_ автотест: минимальная заявка"
        }
        r = api_client.post(f"{API}/leads", json=payload, timeout=30)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        # Response contract
        assert data["name"] == payload["name"]
        assert data["phone"] == payload["phone"]
        assert data["comment"] == payload["comment"]
        assert "email_sent" in data
        assert isinstance(data["email_sent"], bool)
        assert "created_at" in data
        # SMTP is configured per backend/.env, so email should be sent
        assert data["email_sent"] is True, f"email_sent expected True, got False. email_error={data.get('email_error')}"

    def test_create_lead_with_calculator(self, api_client):
        payload = {
            "name": "TEST_Мария",
            "phone": "+7 900 000 00 02",
            "comment": "TEST_ автотест: заявка с калькулятором",
            "calculator": {
                "room_type": "Квартира",
                "area": 55.5,
                "repair_type": "Косметический",
                "addons": ["Демонтаж", "Электрика"],
                "estimated_price": 750000
            }
        }
        r = api_client.post(f"{API}/leads", json=payload, timeout=30)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["calculator"] is not None
        assert data["calculator"]["room_type"] == "Квартира"
        assert data["calculator"]["area"] == 55.5
        assert data["calculator"]["repair_type"] == "Косметический"
        assert data["calculator"]["addons"] == ["Демонтаж", "Электрика"]
        assert data["calculator"]["estimated_price"] == 750000
        assert data["email_sent"] is True, f"email_sent expected True, got False. email_error={data.get('email_error')}"

    def test_create_lead_without_comment(self, api_client):
        payload = {"name": "TEST_Пётр", "phone": "+7 900 000 00 03"}
        r = api_client.post(f"{API}/leads", json=payload, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "TEST_Пётр"
        assert data["comment"] is None
        assert "email_sent" in data

    def test_create_lead_missing_required_field(self, api_client):
        # phone missing -> Pydantic validation error 422
        payload = {"name": "TEST_NoPhone"}
        r = api_client.post(f"{API}/leads", json=payload, timeout=15)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"


# --- Ensure MongoDB is truly gone (defensive) ---
class TestNoDBEndpoints:
    def test_status_endpoint_gone(self, api_client):
        # Old status_checks endpoint should not exist after refactor
        r = api_client.get(f"{API}/status", timeout=10)
        assert r.status_code in (404, 405), f"Old /api/status still present: {r.status_code}"
