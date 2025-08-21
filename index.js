#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client (will be set up during initialization)
let openaiClient = null;

// Create server instance
const server = new Server(
  {
    name: 'openai-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle initialization
server.setRequestHandler('initialize', async (request) => {
  // Get OpenAI API key from environment or initialization params
  const apiKey = process.env.OPENAI_API_KEY || request.params?.config?.openaiApiKey;
  
  if (!apiKey) {
    console.error('No OpenAI API key provided');
    throw new Error('OpenAI API key required. Set OPENAI_API_KEY env var or pass in config.');
  }
  
  // Initialize OpenAI client
  openaiClient = new OpenAI({ apiKey });
  console.error('OpenAI MCP server initialized');
  
  return {
    protocolVersion: '0.1.0',
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'openai-mcp',
      version: '1.0.0',
    },
  };
});

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'chat_completion',
        description: 'Create a chat completion using OpenAI GPT models',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'Model to use (e.g., gpt-4, gpt-3.5-turbo)',
              default: 'gpt-3.5-turbo',
            },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['system', 'user', 'assistant'],
                  },
                  content: {
                    type: 'string',
                  },
                },
                required: ['role', 'content'],
              },
            },
            temperature: {
              type: 'number',
              description: 'Sampling temperature (0-2)',
              default: 0.7,
            },
            max_tokens: {
              type: 'number',
              description: 'Maximum tokens to generate',
            },
          },
          required: ['messages'],
        },
      },
      {
        name: 'list_models',
        description: 'List available OpenAI models',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'embeddings',
        description: 'Create text embeddings',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'Model to use',
              default: 'text-embedding-3-small',
            },
            input: {
              type: 'string',
              description: 'Text to embed',
            },
          },
          required: ['input'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized');
  }

  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'chat_completion': {
        const { 
          model = 'gpt-3.5-turbo', 
          messages, 
          temperature = 0.7, 
          max_tokens 
        } = args;
        
        const completion = await openaiClient.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens,
        });

        return {
          content: [
            {
              type: 'text',
              text: completion.choices[0].message.content,
            },
          ],
        };
      }

      case 'list_models': {
        const models = await openaiClient.models.list();
        const modelNames = models.data
          .map(m => m.id)
          .sort()
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Available models:\n${modelNames}`,
            },
          ],
        };
      }

      case 'embeddings': {
        const { model = 'text-embedding-3-small', input } = args;
        
        const embedding = await openaiClient.embeddings.create({
          model,
          input,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(embedding.data[0].embedding),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('OpenAI MCP server running via stdio');
}

main().catch(error => {
  console.error('Server error:', error);
  process.exit(1);
});