/**
 * DevSecOps Control Plane — Universal Interactive Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Preset Architectures
  const PRESETS = {
    python: {
      name: 'devsecops-demo',
      badge: 'Python 3.12 (Flask + Gunicorn)',
      port: 5000,
      host: 'http://127.0.0.1:5000',
      healthPath: '/health',
      sastTool: 'Bandit (-ll AST Scan)',
      testTool: 'pytest tests/',
      baseImage: 'python:3.12-slim',
      cveExpected: 0
    },
    php: {
      name: 'fixhr',
      badge: 'PHP 8.3 (Laravel + Octane/FPM)',
      port: 8000,
      host: 'http://127.0.0.1:8000',
      healthPath: '/up',
      sastTool: 'PHPStan (Level 8) + composer audit',
      testTool: 'php artisan test --parallel',
      baseImage: 'php:8.3-fpm-alpine',
      cveExpected: 0
    },
    nodejs: {
      name: 'auth-service',
      badge: 'Node.js 20 (Express + TypeScript)',
      port: 3000,
      host: 'http://127.0.0.1:3000',
      healthPath: '/healthz',
      sastTool: 'npm audit + ESLint Security',
      testTool: 'npm test',
      baseImage: 'node:20-alpine',
      cveExpected: 0
    },
    golang: {
      name: 'payments-engine',
      badge: 'Go 1.22 (Distroless Static Binary)',
      port: 8080,
      host: 'http://127.0.0.1:8080',
      healthPath: '/live',
      sastTool: 'govulncheck + golangci-lint',
      testTool: 'go test ./...',
      baseImage: 'gcr.io/distroless/static-debian12:nonroot',
      cveExpected: 0
    },
    java: {
      name: 'billing-enterprise',
      badge: 'Java 17 (Spring Boot + Temurin)',
      port: 8080,
      host: 'http://127.0.0.1:8080',
      healthPath: '/actuator/health',
      sastTool: 'SpotBugs + Dependency-Check',
      testTool: 'mvn test -B',
      baseImage: 'eclipse-temurin:17-jre-alpine',
      cveExpected: 0
    },
    custom: {
      name: 'custom-microservice',
      badge: 'Polyglot Custom Architecture',
      port: 8000,
      host: 'http://127.0.0.1:8000',
      healthPath: '/health',
      sastTool: 'Universal Semgrep + Trivy',
      testTool: 'automated test suite',
      baseImage: 'alpine:latest',
      cveExpected: 0
    }
  };

  // DOM Elements
  const presetSelect = document.getElementById('project-preset-select');
  const appNameInput = document.getElementById('app-name-input');
  const appPortInput = document.getElementById('app-port-input');
  const targetHostInput = document.getElementById('target-host-input');
  const healthPathInput = document.getElementById('health-path-input');
  const currentLangBadge = document.getElementById('current-lang-badge');

  const btnPingService = document.getElementById('btn-ping-service');
  const btnTestRoot = document.getElementById('btn-test-root');
  const probeStatusIndicator = document.getElementById('probe-status-indicator');
  const probeUrlText = document.getElementById('probe-url-text');
  const probeStatusSubtext = document.getElementById('probe-status-subtext');
  const httpCodeTag = document.getElementById('http-code-tag');
  const probeLatencyBadge = document.getElementById('probe-latency-badge');
  const jsonResponseDisplay = document.getElementById('json-response-display');
  const btnCopyJson = document.getElementById('btn-copy-json');

  const btnSimulatePipeline = document.getElementById('btn-simulate-pipeline');
  const btnToggleFailure = document.getElementById('btn-toggle-failure');
  const failureToggleState = document.getElementById('failure-toggle-state');
  const terminalBody = document.getElementById('pipeline-terminal-body');
  const btnClearTerm = document.getElementById('btn-clear-term');

  const tabBtns = document.querySelectorAll('.tab-btn');
  const codeOutputArea = document.getElementById('code-output-area');
  const genFilename = document.getElementById('gen-filename');
  const btnCopyGenerated = document.getElementById('btn-copy-generated');

  let activeTab = 'workflow';
  let simulateFailure = false;
  let isSimulating = false;

  // Apply Preset
  function applyPreset(key) {
    const config = PRESETS[key] || PRESETS.custom;
    appNameInput.value = config.name;
    appPortInput.value = config.port;
    targetHostInput.value = config.host;
    healthPathInput.value = config.healthPath;
    currentLangBadge.textContent = config.badge;
    document.getElementById('step-1-desc').textContent = `${config.testTool} + ${config.sastTool}`;
    updateProbeUrlPreview();
    updateGeneratedArtifact();
    logTerminal(`[Preset] Switched architecture profile to: ${config.badge}`, 'info');
  }

  function updateProbeUrlPreview() {
    const base = targetHostInput.value.replace(/\/+$/, '');
    const path = healthPathInput.value.startsWith('/') ? healthPathInput.value : `/${healthPathInput.value}`;
    probeUrlText.textContent = `${base}${path}`;
  }

  presetSelect.addEventListener('change', (e) => applyPreset(e.target.value));
  [appNameInput, appPortInput, targetHostInput, healthPathInput].forEach(el => {
    el.addEventListener('input', () => {
      updateProbeUrlPreview();
      updateGeneratedArtifact();
    });
  });

  // Toggle Security Failure Simulation
  btnToggleFailure.addEventListener('click', () => {
    simulateFailure = !simulateFailure;
    if (simulateFailure) {
      failureToggleState.textContent = 'ON (Simulate CVE / SAST Flaw)';
      failureToggleState.className = 'state-on';
      logTerminal('[Simulation Alert] Injected Security Flaw: Pipeline will trigger automated security block & rollback.', 'warn');
    } else {
      failureToggleState.textContent = 'OFF';
      failureToggleState.className = 'state-off';
      logTerminal('[Simulation] Security Flaw Removed: Pipeline will pass with 100% green status.', 'info');
    }
  });

  // Live HTTP Probe Execution
  async function executeProbe(endpointUrl, label = 'Health Probe') {
    const startTime = performance.now();
    probeStatusSubtext.textContent = `Executing live probe against ${endpointUrl}...`;
    httpCodeTag.textContent = 'PROBING';
    httpCodeTag.className = 'http-status-code';
    probeStatusIndicator.className = 'status-indicator';

    logTerminal(`[Network] Dispatching GET ${endpointUrl}`, 'cmd');

    try {
      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });

      const latency = Math.round(performance.now() - startTime);
      probeLatencyBadge.textContent = `${latency} ms`;

      let dataText;
      let jsonData = null;
      try {
        jsonData = await response.json();
        dataText = JSON.stringify(jsonData, null, 2);
      } catch {
        dataText = await response.text();
      }

      jsonResponseDisplay.textContent = dataText;

      if (response.ok) {
        probeStatusIndicator.className = 'status-indicator pass';
        httpCodeTag.className = 'http-status-code code-200';
        httpCodeTag.textContent = `${response.status} OK`;
        probeStatusSubtext.textContent = `Live probe succeeded in ${latency}ms • Service active and healthy.`;
        logTerminal(`[Success] ${label} returned HTTP ${response.status} in ${latency}ms: ${dataText.replace(/\s+/g, ' ')}`, 'success');
      } else {
        probeStatusIndicator.className = 'status-indicator fail';
        httpCodeTag.className = 'http-status-code code-error';
        httpCodeTag.textContent = `${response.status} ERR`;
        probeStatusSubtext.textContent = `Endpoint returned HTTP status ${response.status}.`;
        logTerminal(`[HTTP Error] Received HTTP ${response.status} from ${endpointUrl}`, 'error');
      }
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      probeLatencyBadge.textContent = `${latency} ms`;
      probeStatusIndicator.className = 'status-indicator fail';
      httpCodeTag.className = 'http-status-code code-error';
      httpCodeTag.textContent = 'CONN_ERR';
      probeStatusSubtext.textContent = `Connection refused / CORS error. Ensure server is running on target port.`;
      jsonResponseDisplay.textContent = `// Error: Failed to fetch from ${endpointUrl}\n// Details: ${err.message}\n// Tip: Check if the application is running locally and allows CORS.`;
      logTerminal(`[Connection Failed] ${endpointUrl}: ${err.message}`, 'error');
    }
  }

  btnPingService.addEventListener('click', () => {
    const base = targetHostInput.value.replace(/\/+$/, '');
    const path = healthPathInput.value.startsWith('/') ? healthPathInput.value : `/${healthPathInput.value}`;
    executeProbe(`${base}${path}`, 'Health Probe');
  });

  btnTestRoot.addEventListener('click', () => {
    const base = targetHostInput.value.replace(/\/+$/, '');
    executeProbe(`${base}/`, 'Root Endpoint');
  });

  // Terminal Logger Helper
  function logTerminal(message, type = 'info') {
    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    line.textContent = `[${timestamp}] ${message}`;
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  btnClearTerm.addEventListener('click', () => {
    terminalBody.innerHTML = '';
    logTerminal('Terminal buffer cleared.', 'info');
  });

  // Pipeline Simulation
  btnSimulatePipeline.addEventListener('click', async () => {
    if (isSimulating) return;
    isSimulating = true;
    btnSimulatePipeline.disabled = true;

    // Reset stages
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`stage-step-${i}`);
      const chip = document.getElementById(`step-chip-${i}`);
      step.className = 'pipeline-step';
      chip.className = 'step-status-chip status-pending';
      chip.textContent = 'Pending';
      if (i < 4) document.getElementById(`connector-${i}`).className = 'pipeline-connector';
    }

    const appName = appNameInput.value || 'devsecops-app';
    const currentPreset = PRESETS[presetSelect.value] || PRESETS.custom;

    logTerminal(`\n=== Initiating Full DevSecOps Pipeline Simulation for [${appName}] ===`, 'cmd');

    // Stage 1: Quality Gate & SAST
    await runStage(1, 'Stage 1: Quality Gate & SAST', async () => {
      logTerminal(`Running unit test runner: ${currentPreset.testTool}...`, 'info');
      await sleep(1000);
      logTerminal(`Running static security analyzer: ${currentPreset.sastTool}...`, 'info');
      await sleep(1000);

      if (simulateFailure) {
        logTerminal(`[CRITICAL SAST VIOLATION] High-confidence security flaw detected! AST pattern matched hardcoded credential / injection risk.`, 'error');
        logTerminal(`[FAIL-FAST] Pipeline halted at Stage 1. Container build aborted.`, 'error');
        document.getElementById('sast-violations-count').textContent = '1';
        document.getElementById('sast-violations-count').className = 'metric-val val-danger';
        throw new Error('SAST Security Gate Blocked');
      }

      logTerminal(`✓ All unit tests passed (3/3 test suites green).`, 'success');
      logTerminal(`✓ SAST AST scan passed with 0 high/medium vulnerabilities.`, 'success');
    });

    if (simulateFailure) {
      finalizeSimulation(false);
      return;
    }

    // Stage 2: Build & Vulnerability Scan
    await runStage(2, 'Stage 2: Build & Container CVE Scan', async () => {
      logTerminal(`Setting up Docker Buildx with GitHub Actions cache backend...`, 'info');
      await sleep(800);
      logTerminal(`Building OCI container image [${appName}:local] using ${currentPreset.baseImage}...`, 'info');
      await sleep(1200);
      logTerminal(`Executing Trivy vulnerability scanner on image layers...`, 'info');
      await sleep(1000);
      logTerminal(`✓ Trivy scan completed: 0 CRITICAL, 0 HIGH CVEs detected.`, 'success');
      logTerminal(`✓ Docker image archived and uploaded as CI artifact.`, 'success');
    });

    // Stage 3: Kubernetes Staging & Smoke Test
    await runStage(3, 'Stage 3: Ephemeral K8s Staging & Smoke Test', async () => {
      logTerminal(`Provisioning ephemeral KinD (Kubernetes in Docker) cluster...`, 'info');
      await sleep(1000);
      logTerminal(`Sideloading ${appName}:local into KinD control plane...`, 'info');
      await sleep(800);
      logTerminal(`Applying Kubernetes manifests (deployment.yaml, service.yaml)...`, 'info');
      await sleep(900);
      logTerminal(`Waiting for deployment rollout (strategy: RollingUpdate)...`, 'info');
      await sleep(1000);
      logTerminal(`Port-forwarding service and executing curl probe to ${healthPathInput.value}...`, 'info');
      await sleep(800);
      logTerminal(`✓ HTTP 200 OK received on health probe. Smoke test passed!`, 'success');
    });

    // Stage 4: Publish to GHCR
    await runStage(4, 'Stage 4: Continuous Deployment (GHCR)', async () => {
      logTerminal(`Authenticating to GitHub Container Registry via OIDC token...`, 'info');
      await sleep(800);
      const sha = Math.random().toString(16).substring(2, 9);
      logTerminal(`Tagging image: ghcr.io/mobeius007/${appName}:${sha} & :latest`, 'info');
      await sleep(800);
      logTerminal(`Pushing layers to ghcr.io/mobeius007/${appName}...`, 'info');
      await sleep(1000);
      logTerminal(`✓ Successfully published immutable release artifact!`, 'success');
    });

    finalizeSimulation(true);
  });

  async function runStage(stageNum, stageName, executionFn) {
    const step = document.getElementById(`stage-step-${stageNum}`);
    const chip = document.getElementById(`step-chip-${stageNum}`);
    step.className = 'pipeline-step active';
    chip.className = 'step-status-chip status-running';
    chip.textContent = 'Running...';

    logTerminal(`--> Starting ${stageName}...`, 'cmd');

    try {
      await executionFn();
      step.className = 'pipeline-step pass';
      chip.className = 'step-status-chip status-pass';
      chip.textContent = 'Passed';
      if (stageNum < 4) {
        document.getElementById(`connector-${stageNum}`).className = 'pipeline-connector active';
      }
    } catch (err) {
      step.className = 'pipeline-step fail';
      chip.className = 'step-status-chip status-fail';
      chip.textContent = 'Failed';
      throw err;
    }
  }

  function finalizeSimulation(success) {
    isSimulating = false;
    btnSimulatePipeline.disabled = false;
    if (success) {
      logTerminal(`\n🎉 Pipeline completed successfully! All 4 DevSecOps gates passed 100% green.\n`, 'success');
    } else {
      logTerminal(`\n🛑 Pipeline failed! Security gate prevented rollout of vulnerable code.\n`, 'error');
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Artifact Code Generator Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      updateGeneratedArtifact();
    });
  });

  function updateGeneratedArtifact() {
    const appName = appNameInput.value || 'devsecops-app';
    const port = appPortInput.value || 8000;
    const healthPath = healthPathInput.value || '/health';
    const langKey = presetSelect.value;

    if (activeTab === 'workflow') {
      genFilename.textContent = `.github/workflows/ci.yml`;
      codeOutputArea.textContent = `name: DevSecOps CI/CD Pipeline (${appName})

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  devsecops-pipeline:
    uses: Mobeius007/CI-CD-pipeline-with-security-scanning/.github/workflows/reusable-devsecops.yml@main
    with:
      app_name: '${appName}'
      language: '${langKey}'
      health_endpoint: '${healthPath}'
      port: ${port}`;
    } else if (activeTab === 'dockerfile') {
      genFilename.textContent = `Dockerfile (${langKey.toUpperCase()})`;
      if (langKey === 'php') {
        codeOutputArea.textContent = `FROM composer:2.7 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

FROM php:8.3-fpm-alpine
RUN addgroup -g 10001 appgroup && adduser -u 10001 -G appgroup -s /sbin/nologin -D appuser
WORKDIR /var/www/html
COPY --chown=appuser:appgroup . .
COPY --from=vendor --chown=appuser:appgroup /app/vendor ./vendor
USER appuser:appgroup
EXPOSE ${port}
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=${port}"]`;
      } else if (langKey === 'nodejs') {
        codeOutputArea.textContent = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --if-present

FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 10001 appgroup && adduser -u 10001 -G appgroup -s /sbin/nologin -D appuser
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist 2>/dev/null || true
USER appuser:appgroup
EXPOSE ${port}
CMD ["node", "dist/index.js"]`;
      } else if (langKey === 'golang') {
        codeOutputArea.textContent = `FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server .

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=builder /app/server /app/server
USER nonroot:nonroot
EXPOSE ${port}
ENTRYPOINT ["/app/server"]`;
      } else {
        codeOutputArea.textContent = `FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=${port}
RUN groupadd -g 10001 appgroup && useradd -u 10001 -g appgroup -s /sbin/nologin -d /home/appuser -m appuser
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
RUN chown -R 10001:10001 /app
USER 10001:10001
EXPOSE ${port}
CMD ["gunicorn", "--bind", "0.0.0.0:${port}", "--workers", "2", "--worker-tmp-dir", "/tmp", "app.main:app"]`;
      }
    } else if (activeTab === 'k8s') {
      genFilename.textContent = `k8s/deployment.yaml`;
      codeOutputArea.textContent = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}-deployment
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: ${appName}
          image: ${appName}:local
          ports:
            - containerPort: ${port}
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            runAsNonRoot: true
            capabilities:
              drop: [ALL]
          livenessProbe:
            httpGet:
              path: ${healthPath}
              port: ${port}
          readinessProbe:
            httpGet:
              path: ${healthPath}
              port: ${port}
          volumeMounts:
            - name: tmp-volume
              mountPath: /tmp
      volumes:
        - name: tmp-volume
          emptyDir: {}`;
    }
  }

  // Copy Helpers
  btnCopyJson.addEventListener('click', () => {
    navigator.clipboard.writeText(jsonResponseDisplay.textContent).then(() => {
      btnCopyJson.textContent = 'Copied!';
      setTimeout(() => btnCopyJson.textContent = 'Copy', 1500);
    });
  });

  btnCopyGenerated.addEventListener('click', () => {
    navigator.clipboard.writeText(codeOutputArea.textContent).then(() => {
      btnCopyGenerated.textContent = 'Copied!';
      setTimeout(() => btnCopyGenerated.textContent = 'Copy File', 1500);
    });
  });

  // Initial load
  applyPreset('python');
});
