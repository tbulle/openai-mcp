import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'default-api-key';

// Simple API key authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// MCP SSE endpoint
app.get('/sse', authenticate, async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const transport = new SSEServerTransport('/message', res);
  const server = new Server(
    {
      name: 'openai-bridge',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Store OpenAI client per session (will be initialized with API key from client)
  let openaiClient = null;

  server.setRequestHandler('initialize', async (request) => {
    // Get OpenAI API key from client initialization params
    const openaiApiKey = request.params?.config?.openaiApiKey;
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key must be provided in initialization config');
    }

    // Initialize OpenAI client with provided API key
    openaiClient = new OpenAI({ apiKey: openaiApiKey });

    return {
      protocolVersion: '0.1.0',
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: 'openai-bridge',
        version: '1.0.0',
      },
    };
  });

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
                default: 'gpt-4',
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
              stream: {
                type: 'boolean',
                description: 'Stream the response',
                default: false,
              },
            },
            required: ['messages'],
          },
        },
        {
          name: 'embeddings',
          description: 'Create embeddings using OpenAI models',
          inputSchema: {
            type: 'object',
            properties: {
              model: {
                type: 'string',
                description: 'Model to use (e.g., text-embedding-3-small)',
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
        {
          name: 'list_models',
          description: 'List available OpenAI models',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  server.setRequestHandler('tools/call', async (request) => {
    if (!openaiClient) {
      throw new Error('OpenAI client not initialized. Please provide API key during initialization.');
    }

    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'chat_completion': {
          const { model = 'gpt-4', messages, temperature = 0.7, max_tokens, stream = false } = args;
          
          if (stream) {
            // For streaming, we need to handle it differently
            const stream = await openaiClient.chat.completions.create({
              model,
              messages,
              temperature,
              max_tokens,
              stream: true,
            });

            let fullContent = '';
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              fullContent += content;
            }

            return {
              content: [
                {
                  type: 'text',
                  text: fullContent,
                },
              ],
            };
          } else {
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

        case 'list_models': {
          const models = await openaiClient.models.list();
          
          const modelNames = models.data
            .map(model => model.id)
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

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      console.error(`Error calling OpenAI API:`, error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  });

  await transport.start();
  await server.connect(transport);

  // Keep connection alive
  req.on('close', () => {
    transport.close();
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'openai-mcp-bridge' });
});

// MCP POST endpoint for message handling
app.post('/message', authenticate, express.json(), (req, res) => {
  // This endpoint is used by the SSE transport for sending messages back
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`OpenAI MCP Bridge running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP SSE endpoint: http://localhost:${PORT}/sse`);
});