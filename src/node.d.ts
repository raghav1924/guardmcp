declare namespace NodeJS {
  interface Process {
    argv: string[];
    version: string;
    cwd(): string;
    exit(code?: number): never;
    env: Record<string, string | undefined>;
    platform: string;
  }
}

declare const process: NodeJS.Process;

declare module 'node:path' {
  export function join(...paths: string[]): string;
  export function dirname(p: string): string;
  export function resolve(...paths: string[]): string;
  export function basename(p: string, ext?: string): string;
  export function extname(p: string): string;
}

declare module 'node:fs' {
  export function existsSync(p: string): boolean;
  export function readFileSync(p: string, encoding: string): string;
  export function writeFileSync(p: string, data: string, encoding: string): void;
  export function mkdirSync(p: string, options?: { recursive?: boolean }): string | undefined;
  export function readdirSync(p: string, options?: { withFileTypes?: boolean }): any[];
  export function statSync(p: string): { isDirectory(): boolean; isFile(): boolean };
}

declare module 'node:http' {
  export interface IncomingMessage {
    url?: string;
    method?: string;
  }
  export interface ServerResponse {
    writeHead(statusCode: number, headers?: Record<string, string>): void;
    end(data?: string): void;
  }
  export interface Server {
    listen(port: number, callback?: () => void): this;
    close(callback?: () => void): this;
  }
  export function createServer(handler: (req: IncomingMessage, res: ServerResponse) => void): Server;
}

declare module 'node:os' {
  export function homedir(): string;
  export function tmpdir(): string;
}

declare module 'node:test' {
  export default function test(name: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert' {
  export function ok(value: unknown, message?: string): void;
  export function strictEqual(actual: unknown, expected: unknown, message?: string): void;
}
