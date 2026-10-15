"""DevSecOps Demo Flask Application.

Provides minimal microservice endpoints for service discovery and health checks.
Runs securely via Gunicorn in containerized environments.
"""

import os
from flask import Flask, jsonify, send_from_directory

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
app = Flask(__name__, static_folder=frontend_dir, static_url_path="")

APP_VERSION = "1.0.0"


@app.after_request
def add_cors_headers(response):
    """Enable CORS so web browsers and dashboards can query health telemetry."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,OPTIONS"
    return response


@app.route("/", methods=["GET"])
def index():
    """Root endpoint returning service identification and current release version."""
    return jsonify({
        "message": "DevSecOps CI/CD Pipeline Microservice",
        "version": APP_VERSION,
        "status": "active"
    }), 200


@app.route("/health", methods=["GET"])
def health():
    """Health probe endpoint utilized by Kubernetes readiness and liveness probes."""
    return jsonify({
        "status": "ok"
    }), 200


@app.route("/dashboard", methods=["GET"])
def dashboard():
    """Serve the universal DevSecOps control plane frontend dashboard."""
    return send_from_directory(frontend_dir, "index.html")


if __name__ == "__main__":
    # Bound to loopback interface for local manual testing only.
    # Production traffic is served via Gunicorn WSGI server.
    port = int(os.environ.get("PORT", 5000))
    app.run(host="127.0.0.1", port=port)
