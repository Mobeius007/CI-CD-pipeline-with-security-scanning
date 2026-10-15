"""DevSecOps Demo Flask Application.

Provides minimal microservice endpoints for service discovery and health checks.
Runs securely via Gunicorn in containerized environments.
"""

import os
from flask import Flask, Response, jsonify, send_from_directory

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


@app.route("/embed/widget.js", methods=["GET"])
def embed_widget():
    """Serve the embeddable floating telemetry widget JavaScript."""
    return send_from_directory(frontend_dir, "widget.js", mimetype="application/javascript")


@app.route("/api/badge/status", methods=["GET"])
def badge_status():
    """Return dynamic SVG status badge for READMEs or dashboards."""
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="138" height="20">'
        '<linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/>'
        '<stop offset="1" stop-opacity=".1"/></linearGradient>'
        '<clipPath id="a"><rect width="138" height="20" rx="3" fill="#fff"/></clipPath>'
        '<g clip-path="url(#a)"><path fill="#555" d="M0 0h75v20H0z"/>'
        '<path fill="#10b981" d="M75 0h63v20H75z"/><path fill="url(#b)" d="M0 0h138v20H0z"/></g>'
        '<g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">'
        '<text x="37.5" y="15" fill="#010101" fill-opacity=".3">devsecops</text>'
        '<text x="37.5" y="14">devsecops</text>'
        '<text x="105.5" y="15" fill="#010101" fill-opacity=".3">healthy</text>'
        '<text x="105.5" y="14">healthy</text></g></svg>'
    )
    return Response(svg, mimetype="image/svg+xml")


@app.route("/api/badge/security", methods=["GET"])
def badge_security():
    """Return dynamic SVG security grade badge."""
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="130" height="20">'
        '<linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/>'
        '<stop offset="1" stop-opacity=".1"/></linearGradient>'
        '<clipPath id="a"><rect width="130" height="20" rx="3" fill="#fff"/></clipPath>'
        '<g clip-path="url(#a)"><path fill="#555" d="M0 0h65v20H0z"/>'
        '<path fill="#06b6d4" d="M65 0h65v20H65z"/><path fill="url(#b)" d="M0 0h130v20H0z"/></g>'
        '<g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">'
        '<text x="32.5" y="15" fill="#010101" fill-opacity=".3">security</text>'
        '<text x="32.5" y="14">security</text>'
        '<text x="96.5" y="15" fill="#010101" fill-opacity=".3">grade A+</text>'
        '<text x="96.5" y="14">grade A+</text></g></svg>'
    )
    return Response(svg, mimetype="image/svg+xml")


if __name__ == "__main__":
    # Bound to loopback interface for local manual testing only.
    # Production traffic is served via Gunicorn WSGI server.
    port = int(os.environ.get("PORT", 5000))
    app.run(host="127.0.0.1", port=port)
