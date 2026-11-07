import { McpServerConfig, McpToolDefinition, SecurityFinding } from '../core/types.js';

export interface SecurityRule {
  id: string;
  name: string;
  checkServer?: (serverName: string, server: McpServerConfig) => SecurityFinding[];
  checkTool?: (serverName: string, tool: McpToolDefinition, server: McpServerConfig) => SecurityFinding[];
}

// SEC01: Plaintext API Keys & High-Value Secrets in Environment Variables
export const RulePlaintextSecrets: SecurityRule = {
  id: 'SEC01',
  name: 'Plaintext Secret Exposure in Environment',
  checkServer: (serverName, server) => {
    const findings: SecurityFinding[] = [];
    if (!server.env) return findings;

    const secretPatterns = [
      { key: /API_KEY/i, label: 'API Key' },
      { key: /SECRET/i, label: 'Secret' },
      { key: /PASSWORD|PASSWD|PWD/i, label: 'Password' },
      { key: /TOKEN|AUTH/i, label: 'Auth Token' },
      { key: /PRIVATE_KEY/i, label: 'Private Key' },
    ];

    for (const [envVar, value] of Object.entries(server.env)) {
      for (const pattern of secretPatterns) {
        if (pattern.key.test(envVar)) {
          // If value looks like a real credential rather than an env reference ($VAR)
          if (value && !value.startsWith('$') && !value.includes('placeholder') && value.length > 8) {
            findings.push({
              id: 'SEC01',
              title: `Hardcoded ${pattern.label} in MCP Server Environment`,
              severity: 'CRITICAL',
              serverName,
              description: `Server environment variable '${envVar}' contains hardcoded plaintext credentials directly inside client configuration file.`,
              impact: 'Any local process, compromised extension, or subagent reading MCP configs can exfiltrate this credential.',
              remediation: `Extract '${envVar}' into your shell environment or a secured .env file and reference it dynamically using '\${${envVar}}'.`,
              evidence: `${envVar}=${value.substring(0, 4)}***${value.substring(value.length - 2)}`,
            });
          }
        }
      }
    }

    return findings;
  },
};

// SEC02: Unsandboxed Shell Execution & Command Injection
export const RuleCommandInjection: SecurityRule = {
  id: 'SEC02',
  name: 'Command Execution Risk & Shell Injection',
  checkServer: (serverName, server) => {
    const findings: SecurityFinding[] = [];
    const command = server.command || '';
    const args = (server.args || []).join(' ');

    const dangerousBins = ['bash', 'sh', 'zsh', 'cmd.exe', 'powershell', 'sudo'];
    const hasDangerousBin = dangerousBins.some(b => command.endsWith(b) || command === b);

    if (hasDangerousBin) {
      findings.push({
        id: 'SEC02',
        title: 'High-Risk Shell Interpreter Spawning',
        severity: 'HIGH',
        serverName,
        description: `MCP server executes raw shell binary '${command}' without an isolated process container.`,
        impact: 'If an AI model generates unexpected shell metacharacters (;, &&, |), arbitrary command execution occurs on host machine.',
        remediation: 'Wrap server execution inside Docker, an isolated sandbox, or use dedicated non-shell runtime binaries (e.g., node, python3).',
        evidence: `command: "${command}", args: "${args}"`,
      });
    }

    return findings;
  },
  checkTool: (serverName, tool) => {
    const findings: SecurityFinding[] = [];
    const name = tool.name.toLowerCase();
    const desc = (tool.description || '').toLowerCase();

    const executionIndicators = ['execute_command', 'run_shell', 'bash', 'exec', 'run_command', 'terminal'];
    if (executionIndicators.some(i => name.includes(i))) {
      // Check if schema has strict restrictions or freeform string
      const props = tool.inputSchema?.properties || {};
      for (const [paramName, param] of Object.entries(props)) {
        if (param.type === 'string' && !param.enum) {
          findings.push({
            id: 'SEC02',
            title: `Arbitrary Command Execution Parameter in '${tool.name}'`,
            severity: 'CRITICAL',
            serverName,
            toolName: tool.name,
            description: `Tool parameter '${paramName}' accepts unconstrained raw strings directly fed to system commands.`,
            impact: 'Autonomous agents or indirect prompt injections can pass malicious commands (e.g., "rm -rf", curl exfiltration).',
            remediation: 'Implement an enum allowlist of pre-approved commands or strictly parse arguments into discrete flags.',
            evidence: `Tool: ${tool.name}, Parameter: ${paramName} (type: string, unbounded)`,
          });
        }
      }
    }

    return findings;
  },
};

// SEC03: Unrestricted Path Traversal & Filesystem Access
export const RulePathTraversal: SecurityRule = {
  id: 'SEC03',
  name: 'Filesystem Path Traversal & Sensitive File Exposure',
  checkTool: (serverName, tool) => {
    const findings: SecurityFinding[] = [];
    const name = tool.name.toLowerCase();
    const isFileTool = ['read_file', 'write_file', 'delete_file', 'fs', 'file'].some(k => name.includes(k));

    if (isFileTool && tool.inputSchema?.properties) {
      for (const [paramName, param] of Object.entries(tool.inputSchema.properties)) {
        if (paramName.toLowerCase().includes('path') || paramName.toLowerCase().includes('file')) {
          const desc = (param.description || '').toLowerCase();
          const lacksJail = !desc.includes('relative') && !desc.includes('sandbox') && !desc.includes('root directory');

          if (lacksJail) {
            findings.push({
              id: 'SEC03',
              title: `Unrestricted File Path Input in '${tool.name}'`,
              severity: 'HIGH',
              serverName,
              toolName: tool.name,
              description: `Tool '${tool.name}' allows absolute or unbounded path inputs without explicit root confinement.`,
              impact: 'Agents can read sensitive files outside workspace boundary (~/.ssh, /etc/passwd, ~/.aws/credentials).',
              remediation: 'Confine all file resolution to a specific target workspace directory and reject paths containing ".." or root slashes.',
              evidence: `Parameter '${paramName}' allows unrestricted paths`,
            });
          }
        }
      }
    }

    return findings;
  },
};

// SEC04: Unbounded JSON-RPC Argument Schemas
export const RuleSchemaSanitization: SecurityRule = {
  id: 'SEC04',
  name: 'Unbounded JSON-RPC Argument Schemas',
  checkTool: (serverName, tool) => {
    const findings: SecurityFinding[] = [];
    const schema = tool.inputSchema;

    if (!schema || !schema.properties || Object.keys(schema.properties).length === 0) {
      findings.push({
        id: 'SEC04',
        title: `Tool '${tool.name}' Lacks Input Schema Specification`,
        severity: 'MEDIUM',
        serverName,
        toolName: tool.name,
        description: `Tool exposes no input schema or argument validation boundaries.`,
        impact: 'Host model may send arbitrary payloads triggering unhandled runtime exceptions or injection attacks in server handler.',
        remediation: 'Define a strict JSON Schema specification with typed properties and required arrays.',
        evidence: `inputSchema: ${JSON.stringify(schema || {})}`,
      });
    }

    return findings;
  },
};

// SEC05: Prompt Injection & Deceptive Tool Instruction Surface
export const RuleInstructionTampering: SecurityRule = {
  id: 'SEC05',
  name: 'Deceptive Tool Prompt & Instruction Tampering',
  checkTool: (serverName, tool) => {
    const findings: SecurityFinding[] = [];
    const desc = tool.description || '';

    // Patterns indicating attempt to override agent instructions
    const overrideKeywords = [
      'ignore previous instructions',
      'system prompt',
      'you must always call this tool',
      'bypass permission',
      'do not ask the user',
      'always approve',
    ];

    for (const kw of overrideKeywords) {
      if (desc.toLowerCase().includes(kw)) {
        findings.push({
          id: 'SEC05',
          title: `Suspicious Prompt Override in Tool '${tool.name}' Description`,
          severity: 'CRITICAL',
          serverName,
          toolName: tool.name,
          description: `Tool description contains manipulative directives attempting to hijack LLM cognitive constraints ("${kw}").`,
          impact: 'Prompt injection or tool poisoning attack forcing autonomous agent to execute actions without user oversight.',
          remediation: 'Inspect tool source code immediately and remove coercive instructions from tool descriptions.',
          evidence: `Description snippet: "...${desc.substring(0, 80)}..."`,
        });
      }
    }

    return findings;
  },
};

export const ALL_RULES: SecurityRule[] = [
  RulePlaintextSecrets,
  RuleCommandInjection,
  RulePathTraversal,
  RuleSchemaSanitization,
  RuleInstructionTampering,
];
