"""Unit tests for DevSecOps Demo Flask Application."""

import pytest
from app.main import app, APP_VERSION


@pytest.fixture
def client():
    """Configures the Flask test client."""
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client


def test_root_endpoint(client):
    """Verify that GET / returns 200 OK and expected JSON payload."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.is_json
    data = response.get_json()
    assert "message" in data
    assert data["version"] == APP_VERSION
    assert data["status"] == "active"


def test_health_endpoint(client):
    """Verify that GET /health returns 200 OK and status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.is_json
    data = response.get_json()
    assert data == {"status": "ok"}


def test_non_existent_route(client):
    """Verify that requesting an unregistered path returns 404 Not Found."""
    response = client.get("/invalid-route")
    assert response.status_code == 404


def test_dashboard_endpoint(client):
    """Verify that GET /dashboard serves the control plane frontend."""
    response = client.get("/dashboard")
    assert response.status_code == 200
    assert b"DevSecOps Control Plane" in response.data


def test_embed_widget_endpoint(client):
    """Verify that GET /embed/widget.js serves embeddable widget script."""
    response = client.get("/embed/widget.js")
    assert response.status_code == 200
    assert b"devsecops-embed-widget" in response.data


def test_badge_status_endpoint(client):
    """Verify that GET /api/badge/status returns SVG status badge."""
    response = client.get("/api/badge/status")
    assert response.status_code == 200
    assert response.content_type.startswith("image/svg+xml")
    assert b"devsecops" in response.data
    assert b"healthy" in response.data


def test_badge_security_endpoint(client):
    """Verify that GET /api/badge/security returns SVG security badge."""
    response = client.get("/api/badge/security")
    assert response.status_code == 200
    assert response.content_type.startswith("image/svg+xml")
    assert b"grade A+" in response.data
