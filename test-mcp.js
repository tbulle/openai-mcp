#!/usr/bin/env node

import { spawn } from 'child_process';

// Test messages
const messages = [
  // Initialize
  {
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      protocolVersion: "0.1.0",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    },
    id: 1
  },
  // List tools
  {
    jsonrpc: "2.0",
    method: "tools/list",
    params: {},
    id: 2
  },
  // Call chat_completion tool
  {
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "chat_completion",
      arguments: {
        messages: [
          {
            role: "user",
            content: "Say 'Hello from OpenAI!'"
          }
        ],
        temperature: 0.5,
        max_tokens: 50
      }
    },
    id: 3
  }
];

// Start the MCP server
const server = spawn('node', ['index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle server output
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      // Send next message based on response
      if (response.id === 1 && response.result) {
        console.log('✓ Server initialized successfully');
        console.log('Sending tools/list request...');
        server.stdin.write(JSON.stringify(messages[1]) + '\n');
      } else if (response.id === 2 && response.result) {
        console.log('✓ Tools listed successfully');
        console.log('Tools:', response.result.tools.map(t => t.name).join(', '));
        console.log('Calling chat_completion tool...');
        server.stdin.write(JSON.stringify(messages[2]) + '\n');
      } else if (response.id === 3) {
        if (response.result) {
          console.log('✓ Tool executed successfully');
          console.log('Response:', response.result.content[0].text);
        } else if (response.error) {
          console.error('✗ Tool execution failed:', response.error.message);
        }
        process.exit(0);
      }
    } catch (e) {
      // Not JSON, probably debug output
      if (!line.includes('Debugger') && !line.includes('For help')) {
        console.error('Server:', line);
      }
    }
  });
});

// Handle server errors
server.stderr.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    if (!line.includes('Debugger') && !line.includes('For help') && !line.includes('Waiting for')) {
      console.error('Error:', line);
    }
  });
});

// Start by sending initialize
console.log('Initializing MCP server...');
server.stdin.write(JSON.stringify(messages[0]) + '\n');

// Handle exit
setTimeout(() => {
  console.error('Test timeout - exiting');
  process.exit(1);
}, 10000);