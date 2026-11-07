import http from 'node:http';
import { AuditReport } from '../core/types.js';
import { log, colors } from '../utils/logger.js';

export class WebInspector {
  public static serve(report: AuditReport, port = 4820): void {
    const html = this.renderHtml(report);

    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    });

    server.listen(port, () => {
      log.success(`Visual Web Inspector running at: ${colors.bold}${colors.cyan}http://localhost:${port}${colors.reset}`);
      console.log(`${colors.dim}Press Ctrl+C to close the inspector.${colors.reset}\n`);
    });
  }

  public static exportHtml(report: AuditReport): string {
    return this.renderHtml(report);
  }

  private static renderHtml(report: AuditReport): string {
    const findingsJson = JSON.stringify(report.findings);
    const scoreColor = report.score >= 80 ? '#10b981' : report.score >= 60 ? '#f59e0b' : '#ef4444';

    return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GuardMCP — Visual Security Inspector</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #121215;
      --card-border: #27272a;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --accent: #06b6d4;
      --critical: #ef4444;
      --high: #d946ef;
      --medium: #f59e0b;
      --low: #38bdf8;
      --secure: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      padding: 2rem 1.5rem;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 2rem;
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand-icon {
      font-size: 1.5rem;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: 8px;
      padding: 0.35rem 0.6rem;
    }
    .brand h1 { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; }
    .brand p { font-size: 0.8rem; color: var(--text-muted); }
    .author-badge {
      font-size: 0.75rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      background: #18181b;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      text-decoration: none;
    }
    .author-badge:hover { color: var(--accent); border-color: var(--accent); }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
      position: relative;
      overflow: hidden;
    }
    .metric-title { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .metric-value { font-size: 2.25rem; font-weight: 700; margin-top: 0.5rem; font-family: 'Geist Mono', monospace; }
    .score-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    /* Severity Bar */
    .severity-bar {
      display: flex;
      height: 8px;
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 2rem;
      background: #27272a;
    }
    .bar-seg { height: 100%; transition: width 0.3s ease; }

    /* Findings List */
    .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; }
    .findings-list { display: flex; flex-direction: column; gap: 1rem; }
    .finding-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
      transition: border-color 0.15s ease;
    }
    .finding-card:hover { border-color: #3f3f46; }
    .finding-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .finding-title { font-size: 1rem; font-weight: 600; color: #fff; }
    .finding-meta { font-size: 0.75rem; color: var(--text-muted); font-family: 'Geist Mono', monospace; margin-top: 0.25rem; }
    .finding-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      letter-spacing: 0.04em;
    }
    .badge-CRITICAL { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-HIGH { background: rgba(217, 70, 239, 0.15); color: #d946ef; border: 1px solid rgba(217, 70, 239, 0.3); }
    .badge-MEDIUM { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-LOW { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .finding-desc { font-size: 0.875rem; color: #d4d4d8; line-height: 1.5; margin-bottom: 0.75rem; }
    .finding-remediation {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      padding: 0.75rem;
      font-size: 0.8rem;
      color: #34d399;
      line-height: 1.4;
    }
    .finding-evidence {
      font-family: 'Geist Mono', monospace;
      font-size: 0.75rem;
      background: #09090b;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid #27272a;
      color: #a1a1aa;
      margin-top: 0.5rem;
      overflow-x: auto;
    }
    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--card-border);
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="brand-icon">🛡️</div>
        <div>
          <h1>GuardMCP Inspector</h1>
          <p>Model Context Protocol Security Posture Report</p>
        </div>
      </div>
      <a href="https://jatinsh.netlify.app/" target="_blank" class="author-badge">Built by Jatin Sharma ↗</a>
    </header>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">Security Health Score</div>
        <div class="metric-value" style="color: ${scoreColor};">${report.score}%</div>
        <span class="score-badge" style="background: ${scoreColor}20; color: ${scoreColor}; border: 1px solid ${scoreColor}40;">
          ${report.rating}
        </span>
      </div>
      <div class="metric-card">
        <div class="metric-title">Active MCP Servers</div>
        <div class="metric-value">${report.totalServers}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">Across ${report.analyzedConfigs.length} configuration files</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Total Findings</div>
        <div class="metric-value" style="color: ${report.findings.length > 0 ? '#f43f5e' : '#10b981'};">
          ${report.findings.length}
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
          ${report.severityCounts.CRITICAL} Critical • ${report.severityCounts.HIGH} High
        </div>
      </div>
    </div>

    <!-- Severity Proportion Bar -->
    <div class="severity-bar">
      <div class="bar-seg" style="width: ${(report.severityCounts.CRITICAL / (report.findings.length || 1)) * 100}%; background: var(--critical);"></div>
      <div class="bar-seg" style="width: ${(report.severityCounts.HIGH / (report.findings.length || 1)) * 100}%; background: var(--high);"></div>
      <div class="bar-seg" style="width: ${(report.severityCounts.MEDIUM / (report.findings.length || 1)) * 100}%; background: var(--medium);"></div>
      <div class="bar-seg" style="width: ${(report.severityCounts.LOW / (report.findings.length || 1)) * 100}%; background: var(--low);"></div>
    </div>

    <div class="section-title">
      <span>Security Findings & Remediation Steps</span>
      <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">${report.findings.length} issues identified</span>
    </div>

    <div class="findings-list">
      ${report.findings.length === 0 ? `
        <div class="finding-card" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
          <h3 style="color: var(--secure); font-size: 1.1rem; margin-bottom: 0.25rem;">Clean Bill of Health</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem;">No security vulnerabilities or unsafe parameter definitions were detected.</p>
        </div>
      ` : report.findings.map((f, i) => `
        <div class="finding-card">
          <div class="finding-header">
            <div>
              <div class="finding-title">${f.title}</div>
              <div class="finding-meta">Server: <strong>${f.serverName}</strong> ${f.toolName ? `› Tool: <strong>${f.toolName}</strong>` : ''} • Rule ID: ${f.id}</div>
            </div>
            <span class="finding-badge badge-${f.severity}">${f.severity}</span>
          </div>
          <div class="finding-desc">${f.description}</div>
          <div class="finding-remediation"><strong>Remediation:</strong> ${f.remediation}</div>
          <div class="finding-evidence">Evidence: ${f.evidence}</div>
        </div>
      `).join('')}
    </div>

    <footer>
      GuardMCP is open-source software created by <a href="https://jatinsh.netlify.app/" target="_blank" style="color: var(--accent); text-decoration: none;">Jatin Sharma</a> • Distributed under MIT License
    </footer>
  </div>
</body>
</html>`;
  }
}
