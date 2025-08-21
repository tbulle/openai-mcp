#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Load environment variables
dotenv.config();

// Get API key from environment
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize OpenAI client
const openaiClient = new OpenAI({ apiKey });

// Create MCP server instance
const server = new Server(
  {
    name: 'openai-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Set up handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'chat_completion',
      description: 'Create a chat completion using OpenAI GPT models',
      inputSchema: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            default: 'gpt-3.5-turbo',
            description: 'Model to use (e.g., gpt-4, gpt-3.5-turbo)'
          },
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: {
                  type: 'string',
                  enum: ['system', 'user', 'assistant']
                },
                content: {
                  type: 'string'
                }
              },
              required: ['role', 'content']
            }
          },
          temperature: {
            type: 'number',
            default: 0.7,
            minimum: 0,
            maximum: 2,
            description: 'Sampling temperature (0-2)'
          },
          max_tokens: {
            type: 'number',
            description: 'Maximum tokens to generate'
          }
        },
        required: ['messages']
      }
    },
    {
      name: 'list_models',
      description: 'List available OpenAI models',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'embeddings',
      description: 'Create text embeddings',
      inputSchema: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            default: 'text-embedding-3-small',
            description: 'Model to use'
          },
          input: {
            type: 'string',
            description: 'Text to embed'
          }
        },
        required: ['input']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
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