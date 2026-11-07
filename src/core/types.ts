export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface SecurityFinding {
  id: string; // e.g., SEC01
  title: string;
  severity: Severity;
  serverName: string;
  toolName?: string;
  description: string;
  impact: string;
  remediation: string;
  evidence: string;
}

export interface McpServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  transport?: 'stdio' | 'sse' | 'websocket';
  tools?: McpToolDefinition[];
  resources?: unknown[];
}

export interface McpToolParameter {
  type: string;
  description?: string;
  enum?: string[];
  items?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  required?: string[];
}

export interface McpToolDefinition {
  name: string;
  description?: string;
  inputSchema?: {
    type?: string;
    properties?: Record<string, McpToolParameter>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

export interface McpConfigFile {
  sourcePath: string;
  clientType: 'claude_desktop' | 'cursor' | 'windsurf' | 'custom' | 'project';
  mcpServers: Record<string, McpServerConfig>;
}

export interface AuditReport {
  timestamp: string;
  totalServers: number;
  totalTools: number;
  score: number; // 0 - 100
  rating: 'SECURE' | 'ADEQUATE' | 'VULNERABLE' | 'CRITICAL';
  severityCounts: Record<Severity, number>;
  findings: SecurityFinding[];
  analyzedConfigs: McpConfigFile[];
}
