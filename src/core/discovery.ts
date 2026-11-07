import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { McpConfigFile, McpServerConfig } from '../core/types.js';

export class ConfigDiscovery {
  public static findStandardConfigs(customPath?: string): McpConfigFile[] {
    const configs: McpConfigFile[] = [];
    const home = os.homedir();

    if (customPath) {
      const resolved = path.resolve(process.cwd(), customPath);
      if (fs.existsSync(resolved)) {
        const parsed = this.parseFile(resolved, 'custom');
        if (parsed) configs.push(parsed);
      }
      return configs;
    }

    // 1. Project local: .mcp.json, mcp.json, .cursor/mcp.json
    const projectCandidates = [
      path.join(process.cwd(), '.mcp.json'),
      path.join(process.cwd(), 'mcp.json'),
      path.join(process.cwd(), '.cursor', 'mcp.json'),
      path.join(process.cwd(), '.windsurf', 'mcp.json'),
      path.join(process.cwd(), 'apps', 'mcp-server', 'mcp.json'),
    ];

    for (const p of projectCandidates) {
      if (fs.existsSync(p)) {
        const parsed = this.parseFile(p, 'project');
        if (parsed) configs.push(parsed);
      }
    }

    // 2. Claude Desktop macOS / Linux / Windows
    const claudeDesktopMac = path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    const claudeDesktopWin = path.join(home, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');

    if (fs.existsSync(claudeDesktopMac)) {
      const parsed = this.parseFile(claudeDesktopMac, 'claude_desktop');
      if (parsed) configs.push(parsed);
    } else if (fs.existsSync(claudeDesktopWin)) {
      const parsed = this.parseFile(claudeDesktopWin, 'claude_desktop');
      if (parsed) configs.push(parsed);
    }

    // 3. Cursor global config
    const cursorGlobal = path.join(home, '.cursor', 'mcp.json');
    if (fs.existsSync(cursorGlobal)) {
      const parsed = this.parseFile(cursorGlobal, 'cursor');
      if (parsed) configs.push(parsed);
    }

    return configs;
  }

  public static parseFile(filePath: string, clientType: McpConfigFile['clientType']): McpConfigFile | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(content);

      const mcpServers: Record<string, McpServerConfig> = {};

      if (json.mcpServers && typeof json.mcpServers === 'object') {
        Object.assign(mcpServers, json.mcpServers);
      } else if (json.servers && typeof json.servers === 'object') {
        Object.assign(mcpServers, json.servers);
      } else if (json.command || json.url) {
        // Single server definition
        const name = path.basename(filePath, path.extname(filePath));
        mcpServers[name] = json as McpServerConfig;
      }

      return {
        sourcePath: filePath,
        clientType,
        mcpServers,
      };
    } catch {
      return null;
    }
  }
}
