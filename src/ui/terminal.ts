import { AuditReport, SecurityFinding, Severity } from '../core/types.js';
import { colors } from '../utils/logger.js';

export class TerminalReporter {
  public static render(report: AuditReport): void {
    console.log(`\n${colors.bold}📋 MCP Security Posture Report${colors.reset}`);
    console.log(`${colors.gray}Scan completed: ${report.timestamp}${colors.reset}\n`);

    // Score & Summary Cards
    const scoreColor = report.score >= 80 ? colors.green : report.score >= 60 ? colors.yellow : colors.red;
    const ratingBadge =
      report.rating === 'SECURE'
        ? `${colors.bgGreen} SECURE ${colors.reset}`
        : report.rating === 'CRITICAL'
        ? `${colors.bgRed} CRITICAL RISK ${colors.reset}`
        : `${colors.bgYellow} ${report.rating} ${colors.reset}`;

    console.log(`  Security Health Score: ${scoreColor}${colors.bold}${report.score}/100${colors.reset}  ${ratingBadge}`);
    console.log(`  Total MCP Servers:     ${colors.bold}${report.totalServers}${colors.reset}`);
    console.log(`  Scanned Config Files:  ${colors.bold}${report.analyzedConfigs.length}${colors.reset}`);

    // Severity Breakdown
    console.log(`\n${colors.bold}Vulnerability Breakdown:${colors.reset}`);
    console.log(`  ${colors.red}${colors.bold}Critical:${colors.reset} ${report.severityCounts.CRITICAL}`);
    console.log(`  ${colors.magenta}${colors.bold}High:${colors.reset}     ${report.severityCounts.HIGH}`);
    console.log(`  ${colors.yellow}${colors.bold}Medium:${colors.reset}   ${report.severityCounts.MEDIUM}`);
    console.log(`  ${colors.cyan}${colors.bold}Low:${colors.reset}      ${report.severityCounts.LOW}`);

    // Findings List
    if (report.findings.length === 0) {
      console.log(`\n${colors.green}✔ No security vulnerabilities detected across configured MCP servers.${colors.reset}\n`);
      return;
    }

    console.log(`\n${colors.bold}Discovered Security Issues (${report.findings.length}):${colors.reset}\n`);

    report.findings.forEach((f, idx) => {
      const badge = this.getSeverityBadge(f.severity);
      console.log(`${colors.gray}─[ #${idx + 1} ]──────────────────────────────────────────────────${colors.reset}`);
      console.log(`${badge} ${colors.bold}${f.title}${colors.reset}  ${colors.gray}(${f.id})${colors.reset}`);
      console.log(`  ${colors.dim}Target Server:${colors.reset}  ${colors.cyan}${f.serverName}${colors.reset}${f.toolName ? ` › Tool: ${colors.yellow}${f.toolName}${colors.reset}` : ''}`);
      console.log(`  ${colors.dim}Description:${colors.reset}    ${f.description}`);
      console.log(`  ${colors.dim}Potential Impact:${colors.reset} ${f.impact}`);
      console.log(`  ${colors.dim}Remediation:${colors.reset}   ${colors.green}${f.remediation}${colors.reset}`);
      console.log(`  ${colors.dim}Evidence:${colors.reset}      ${colors.gray}${f.evidence}${colors.reset}\n`);
    });

    console.log(`${colors.gray}─────────────────────────────────────────────────────────────${colors.reset}`);
    console.log(`${colors.dim}💡 Run 'guardmcp inspect --web' to explore findings interactively in your browser.${colors.reset}\n`);
  }

  private static getSeverityBadge(severity: Severity): string {
    switch (severity) {
      case 'CRITICAL':
        return `${colors.bgRed} CRITICAL ${colors.reset}`;
      case 'HIGH':
        return `${colors.magenta}${colors.bold}[HIGH]${colors.reset}`;
      case 'MEDIUM':
        return `${colors.yellow}${colors.bold}[MED]${colors.reset}`;
      case 'LOW':
        return `${colors.cyan}${colors.bold}[LOW]${colors.reset}`;
      default:
        return `[INFO]`;
    }
  }
}
