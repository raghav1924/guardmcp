import fs from 'node:fs';
import path from 'node:path';
import { banner, log, colors } from './utils/logger.js';
import { ConfigDiscovery } from './core/discovery.js';
import { AuditEngine } from './core/engine.js';
import { TerminalReporter } from './ui/terminal.js';
import { WebInspector } from './ui/web.js';

export function runCli(argv: string[]): void {
  const args = argv.slice(2);
  const command = args[0] || 'scan';

  if (command === '--help' || command === '-h' || command === 'help') {
    banner();
    printHelp();
    return;
  }

  banner();

  if (command === 'scan' || command === 'audit') {
    const configPath = args[1] && !args[1].startsWith('--') ? args[1] : undefined;
    const isWeb = args.includes('--web');
    const isJson = args.includes('--json');
    const exportPath = getFlagValue(args, '--export');
    const minScore = parseInt(getFlagValue(args, '--min-score') || '0', 10);
    const failOn = getFlagValue(args, '--fail-on'); // 'critical', 'high'

    log.info(configPath ? `Inspecting configuration: ${colors.bold}${configPath}${colors.reset}` : `Auto-discovering MCP configurations across system & workspace...`);

    const configs = ConfigDiscovery.findStandardConfigs(configPath);

    if (configs.length === 0) {
      log.warn(`No active MCP configurations detected.`);
      console.log(`\n${colors.dim}Tips: Pass a specific path with 'guardmcp scan path/to/mcp.json' or run inside an MCP repository.${colors.reset}\n`);
      return;
    }

    const report = AuditEngine.audit(configs);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    // Render Terminal Report
    TerminalReporter.render(report);

    // Export HTML report if requested
    if (exportPath) {
      const html = WebInspector.exportHtml(report);
      fs.writeFileSync(path.resolve(process.cwd(), exportPath), html, 'utf-8');
      log.success(`Exported standalone security report to: ${colors.bold}${exportPath}${colors.reset}`);
    }

    // Web server if requested
    if (isWeb) {
      WebInspector.serve(report);
      return;
    }

    // CI/CD Failure threshold checks
    if (minScore > 0 && report.score < minScore) {
      log.error(`Security score (${report.score}) fell below minimum required threshold (${minScore}). Failing CI gate.`);
      process.exit(1);
    }

    if (failOn === 'critical' && report.severityCounts.CRITICAL > 0) {
      log.error(`Detected ${report.severityCounts.CRITICAL} CRITICAL vulnerability. Failing CI gate.`);
      process.exit(1);
    }

    if (failOn === 'high' && (report.severityCounts.CRITICAL > 0 || report.severityCounts.HIGH > 0)) {
      log.error(`Detected HIGH/CRITICAL vulnerabilities. Failing CI gate.`);
      process.exit(1);
    }

    return;
  }

  if (command === 'inspect') {
    const configs = ConfigDiscovery.findStandardConfigs();
    const report = AuditEngine.audit(configs);
    WebInspector.serve(report);
    return;
  }

  log.warn(`Unknown command '${command}'`);
  printHelp();
}

function getFlagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return undefined;
}

function printHelp(): void {
  console.log(`
${colors.bold}USAGE:${colors.reset}
  $ guardmcp <command> [file-path] [options]

${colors.bold}COMMANDS:${colors.reset}
  ${colors.cyan}scan, audit [path]${colors.reset}    Scan MCP configs (auto-discovers if path omitted)
  ${colors.cyan}inspect${colors.reset}               Launch visual browser security inspector immediately
  ${colors.cyan}help, --help${colors.reset}          Show this help documentation

${colors.bold}OPTIONS:${colors.reset}
  ${colors.yellow}--web${colors.reset}                 Start visual Web Inspector dashboard after scan
  ${colors.yellow}--export <file.html>${colors.reset}  Save static standalone HTML security report
  ${colors.yellow}--json${colors.reset}                Output machine-readable JSON for CI/CD pipelines
  ${colors.yellow}--min-score <number>${colors.reset} Fail process if score is below number (e.g., 80)
  ${colors.yellow}--fail-on <severity>${colors.reset} Exit with code 1 on 'critical' or 'high' findings

${colors.bold}EXAMPLES:${colors.reset}
  $ guardmcp scan
  $ guardmcp scan my-mcp-config.json --web
  $ guardmcp scan --fail-on critical --min-score 75
  $ guardmcp scan --export mcp-security-audit.html
`);
}
