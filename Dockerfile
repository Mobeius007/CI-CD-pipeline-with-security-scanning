# Use official minimal Python 3.12 slim image
FROM python:3.12-slim

# Prevent Python from writing .pyc files to disk and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Security: Create dedicated non-root user and group with explicit UID/GID 10001
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /sbin/nologin -d /home/appuser -m appuser

# Set working directory
WORKDIR /app

# Install dependencies before copying code to maximize Docker layer cache reuse
COPY requirements.txt .

# Install dependencies without pip cache to minimize image size and attack surface
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code and frontend
COPY app/ ./app/
COPY frontend/ ./frontend/

# Set ownership to non-root user
RUN chown -R 10001:10001 /app

# Switch to unprivileged non-root user
USER 10001:10001

# Expose microservice listening port
EXPOSE 8000

# Run production WSGI server with Gunicorn
# --worker-tmp-dir /tmp ensures compatibility with read-only root filesystems when /tmp is mounted with emptyDir
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--worker-tmp-dir", "/tmp", "--access-logfile", "-", "--error-logfile", "-", "app.main:app"]
