# Polyglot Architecture Presets

This directory contains production-grade, hardened Dockerfiles and configurations for all major language stacks and microservice architectures. Each preset complies with **Restricted Pod Security Standards** (non-root execution, minimal attack surface, multi-stage caching, and read-only root filesystems).

## Available Stacks
1. **[PHP / Laravel](file:///e:/Projects/CICD%20pipeline%20with%20security%20scanning/presets/php-laravel/README.md)** (FPM / Octane, Composer audit, PHPStan, `/up` probe)
2. **[Node.js / TypeScript](file:///e:/Projects/CICD%20pipeline%20with%20security%20scanning/presets/nodejs/README.md)** (Express / NestJS / Fastify, npm audit, non-root user)
3. **[Go / Golang](file:///e:/Projects/CICD%20pipeline%20with%20security%20scanning/presets/golang/README.md)** (Multi-stage scratch/distroless, static binary, ultra-minimal CVE footprint)
4. **[Java / Spring Boot](file:///e:/Projects/CICD%20pipeline%20with%20security%20scanning/presets/java-spring/README.md)** (Eclipse Temurin / Distroless, Maven/Gradle, `/actuator/health` probe)
5. **[Python](file:///e:/Projects/CICD%20pipeline%20with%20security%20scanning/presets/python/README.md)** (Flask / FastAPI / Django, Gunicorn WSGI, Bandit SAST)
