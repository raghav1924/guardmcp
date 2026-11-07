import { AuditReport, McpConfigFile, SecurityFinding, Severity } from './types.js';
import { ALL_RULES } from '../rules/rules.js';

export class AuditEngine {
  public static audit(configs: McpConfigFile[]): AuditReport {
    const findings: SecurityFinding[] = [];
    let totalServers = 0;
    let totalTools = 0;

    for (const config of configs) {
      for (const [serverName, server] of Object.entries(config.mcpServers)) {
        totalServers++;

        // 1. Evaluate Server-level rules
        for (const rule of ALL_RULES) {
          if (rule.checkServer) {
            findings.push(...rule.checkServer(serverName, server));
          }
        }

        // 2. Evaluate Tool-level rules if tools are specified or mockable
        if (server.tools && Array.isArray(server.tools)) {
          for (const tool of server.tools) {
            totalTools++;
            for (const rule of ALL_RULES) {
              if (rule.checkTool) {
                findings.push(...rule.checkTool(serverName, tool, server));
              }
            }
          }
        } else {
          // Infer built-in tool risks based on args or commands if tools array isn't statically exported
          const argsStr = (server.args || []).join(' ').toLowerCase();
          if (argsStr.includes('filesystem') || argsStr.includes('@modelcontextprotocol/server-filesystem')) {
            totalTools += 2;
            findings.push({
              id: 'SEC03',
              title: `Filesystem Server Mounts Without Granular Restriction`,
              severity: 'HIGH',
              serverName,
              description: `Filesystem MCP server launched via '${argsStr}'. Check if authorized directories are tightly scoped.`,
              impact: 'Broad directory access gives coding agents the ability to read non-project assets.',
              remediation: 'Ensure server arguments specify only the current project workspace directory, not root or home.',
              evidence: `args: ${argsStr}`,
            });
          }
        }
      }
    }

    // Calculate score
    const severityCounts: Record<Severity, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0,
    };

    for (const f of findings) {
      severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1;
    }

    // Deduction weights: Critical (-25), High (-15), Medium (-8), Low (-3)
    let deductions =
      severityCounts.CRITICAL * 25 +
      severityCounts.HIGH * 15 +
      severityCounts.MEDIUM * 8 +
      severityCounts.LOW * 3;

    let score = Math.max(0, 100 - deductions);

    let rating: AuditReport['rating'] = 'SECURE';
    if (score < 40 || severityCounts.CRITICAL > 0) {
      rating = 'CRITICAL';
    } else if (score < 70 || severityCounts.HIGH > 0) {
      rating = 'VULNERABLE';
    } else if (score < 90) {
      rating = 'ADEQUATE';
    }

    return {
      timestamp: new Date().toISOString(),
      totalServers,
      totalTools,
      score,
      rating,
      severityCounts,
      findings,
      analyzedConfigs: configs,
    };
  }
}
