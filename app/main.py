"""DevSecOps Demo Flask Application.

Provides minimal microservice endpoints for service discovery and health checks.
Runs securely via Gunicorn in containerized environments.
"""

import os
from flask import Flask, jsonify

app = Flask(__name__)

APP_VERSION = "1.0.0"


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


if __name__ == "__main__":
    # Bound to loopback interface for local manual testing only.
    # Production traffic is served via Gunicorn WSGI server.
    port = int(os.environ.get("PORT", 5000))
    app.run(host="127.0.0.1", port=port)
