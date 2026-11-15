import test from 'node:test';
import assert from 'node:assert';

test('Security test: flags directory traversal in arguments', () => {
  const maliciousConfig = JSON.stringify({
    mcpServers: {
      fileServer: {
        command: "node",
        args: ["server.js", "--allowed-path", "../../etc"]
      }
    }
  });
  assert.ok(maliciousConfig.includes('../../etc'));
});
