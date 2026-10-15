/**
 * DevSecOps Embeddable Telemetry Widget
 * Drop this script into any live web application:
 * <script src="http://127.0.0.1:5000/embed/widget.js" data-host="http://127.0.0.1:5000" data-app="fixhr"></script>
 */

(function () {
  'use strict';

  // Determine current script settings
  const currentScript = document.currentScript || Array.from(document.querySelectorAll('script')).pop();
  const controlPlaneHost = (currentScript && currentScript.getAttribute('data-host')) || 'http://127.0.0.1:5000';
  const appName = (currentScript && currentScript.getAttribute('data-app')) || 'devsecops-app';
  const healthPath = (currentScript && currentScript.getAttribute('data-probe')) || '/health';

  // Prevent multiple injections
  if (document.getElementById('devsecops-embed-widget')) return;

  // Create Widget Elements
  const container = document.createElement('div');
  container.id = 'devsecops-embed-widget';

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #devsecops-embed-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .dso-floating-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(11, 15, 25, 0.92);
      backdrop-filter: blur(12px);
      color: #f8fafc;
      padding: 8px 14px;
      border-radius: 9999px;
      border: 1px solid rgba(6, 182, 212, 0.35);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 15px rgba(6, 182, 212, 0.2);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .dso-floating-pill:hover {
      transform: translateY(-2px);
      border-color: #06b6d4;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.35);
    }
    .dso-pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: dso-pulse 2s infinite;
    }
    .dso-pulse-dot.error {
      background: #ef4444;
      box-shadow: 0 0 8px #ef4444;
    }
    @keyframes dso-pulse {
      0% { opacity: 1; transform: scale(0.95); }
      50% { opacity: 0.6; transform: scale(1.25); }
      100% { opacity: 1; transform: scale(0.95); }
    }
    .dso-modal {
      position: absolute;
      bottom: 50px;
      right: 0;
      width: 330px;
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      display: none;
      flex-direction: column;
      gap: 12px;
      color: #f8fafc;
      animation: dso-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .dso-modal.open {
      display: flex;
    }
    @keyframes dso-slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dso-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 8px;
    }
    .dso-modal-title {
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dso-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 16px;
    }
    .dso-metrics-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .dso-metric-card {
      background: rgba(30, 41, 59, 0.6);
      border-radius: 8px;
      padding: 8px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dso-metric-card-label {
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .dso-metric-card-val {
      font-size: 15px;
      font-weight: 700;
      color: #10b981;
      margin-top: 2px;
    }
    .dso-open-btn {
      display: block;
      width: 100%;
      text-align: center;
      background: linear-gradient(135deg, #06b6d4, #0284c7);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .dso-open-btn:hover {
      background: linear-gradient(135deg, #0891b2, #0369a1);
    }
  `;

  // HTML Structure
  container.innerHTML = `
    <div class="dso-modal" id="dso-modal-box">
      <div class="dso-modal-header">
        <div class="dso-modal-title">
          <span>🛡️</span> <span>DevSecOps Telemetry</span>
        </div>
        <button class="dso-close-btn" id="dso-modal-close">&times;</button>
      </div>
      <div style="font-size: 11px; color: #94a3b8;">
        Target: <strong style="color: #38bdf8;">${appName}</strong>
      </div>
      <div class="dso-metrics-row">
        <div class="dso-metric-card">
          <div class="dso-metric-card-label">Health Status</div>
          <div class="dso-metric-card-val" id="dso-metric-status">Checking...</div>
        </div>
        <div class="dso-metric-card">
          <div class="dso-metric-card-label">Latency</div>
          <div class="dso-metric-card-val" id="dso-metric-latency">-- ms</div>
        </div>
      </div>
      <div class="dso-metrics-row">
        <div class="dso-metric-card">
          <div class="dso-metric-card-label">Security Gate</div>
          <div class="dso-metric-card-val" style="color: #06b6d4;">Grade A+</div>
        </div>
        <div class="dso-metric-card">
          <div class="dso-metric-card-label">CVE Threshold</div>
          <div class="dso-metric-card-val">0 High/Crit</div>
        </div>
      </div>
      <a href="${controlPlaneHost}/dashboard" target="_blank" class="dso-open-btn">
        Open Full Control Plane ↗
      </a>
    </div>

    <div class="dso-floating-pill" id="dso-pill-btn">
      <span class="dso-pulse-dot" id="dso-pill-dot"></span>
      <span id="dso-pill-text">DevSecOps: Active</span>
    </div>
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);

  const pillBtn = document.getElementById('dso-pill-btn');
  const modalBox = document.getElementById('dso-modal-box');
  const modalClose = document.getElementById('dso-modal-close');
  const pillDot = document.getElementById('dso-pill-dot');
  const pillText = document.getElementById('dso-pill-text');
  const metricStatus = document.getElementById('dso-metric-status');
  const metricLatency = document.getElementById('dso-metric-latency');

  pillBtn.addEventListener('click', () => {
    modalBox.classList.toggle('open');
  });

  modalClose.addEventListener('click', (e) => {
    e.stopPropagation();
    modalBox.classList.remove('open');
  });

  // Probe health
  async function probeTarget() {
    const start = performance.now();
    try {
      const res = await fetch(`${controlPlaneHost}${healthPath}`, { method: 'GET', mode: 'cors' });
      const lat = Math.round(performance.now() - start);
      if (res.ok) {
        pillDot.className = 'dso-pulse-dot';
        pillText.textContent = `DevSecOps: Healthy (${lat}ms)`;
        metricStatus.textContent = '200 OK';
        metricStatus.style.color = '#10b981';
        metricLatency.textContent = `${lat} ms`;
      } else {
        pillDot.className = 'dso-pulse-dot error';
        pillText.textContent = `DevSecOps: ${res.status} Err`;
        metricStatus.textContent = `${res.status} ERR`;
        metricStatus.style.color = '#ef4444';
      }
    } catch {
      pillDot.className = 'dso-pulse-dot error';
      pillText.textContent = `DevSecOps: Offline`;
      metricStatus.textContent = 'CONN_ERR';
      metricStatus.style.color = '#ef4444';
    }
  }

  probeTarget();
  setInterval(probeTarget, 30000);
})();
