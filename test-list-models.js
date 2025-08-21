#!/usr/bin/env node

import { spawn } from 'child_process';

// Test listing models
const messages = [
  {
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      protocolVersion: "0.1.0",
      capabilities: {},
      clientInfo: { name: "test-client", version: "1.0.0" }
    },
    id: 1
  },
  {
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "list_models",
      arguments: {}
    },
    id: 2
  }
];

const server = spawn('node', ['index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      if (response.id === 1 && response.result) {
        console.log('✓ Server initialized');
        server.stdin.write(JSON.stringify(messages[1]) + '\n');
      } else if (response.id === 2) {
        if (response.result) {
          console.log('✓ Models listed successfully:');
          console.log(response.result.content[0].text);
        } else if (response.error) {
          console.error('✗ Failed:', response.error.message);
        }
        process.exit(0);
      }
    } catch (e) {
      // Ignore non-JSON output
    }
  });
});

server.stdin.write(JSON.stringify(messages[0]) + '\n');

setTimeout(() => process.exit(1), 10000);