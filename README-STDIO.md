# OpenAI MCP Server (Stdio Version)

A stdio-based Model Context Protocol (MCP) server that enables Claude Code to interact with OpenAI's API directly.

## Features

- ✅ **Stdio-based communication** - Works with Claude Code's MCP implementation
- ✅ **Full OpenAI API support**:
  - Chat completions (GPT-4, GPT-3.5, etc.)
  - Embeddings generation
  - Image generation (DALL-E)
  - Content moderation
  - Model listing
- ✅ **Local installation** - No server deployment needed
- ✅ **Secure** - API key stored locally

## Installation

### Option 1: Global Installation (Recommended)

```bash
# Clone the repository
git clone https://github.com/tbulle/openai-mcp.git
cd openai-mcp

# Install dependencies
npm install

# Make it globally available
npm link
```

### Option 2: Local Project Installation

```bash
# In your project directory
npm install https://github.com/tbulle/openai-mcp.git
```

## Configuration

### 1. Set up your OpenAI API Key

Create a `.env` file in the installation directory:

```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

Or pass it through Claude Code configuration (see below).

### 2. Configure Claude Code

Add to your Claude Code settings (`claude_desktop_config.json`):

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "openai": {
      "command": "node",
      "args": ["C:/Projects/TB/openai-mcp/mcp-server.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-actual-openai-api-key-here"
      }
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "openai": {
      "command": "openai-mcp",
      "env": {
        "OPENAI_API_KEY": "sk-your-actual-openai-api-key-here"
      }
    }
  }
}
```

## Available Tools

### 1. Chat Completion
Generate text using GPT models.

```
Tool: chat_completion
Parameters:
- model: "gpt-4", "gpt-3.5-turbo", etc.
- messages: Array of {role, content}
- temperature: 0-2 (default: 0.7)
- max_tokens: Maximum tokens to generate
```

### 2. Embeddings
Generate text embeddings for semantic search, clustering, etc.

```
Tool: embeddings
Parameters:
- model: "text-embedding-3-small", "text-embedding-3-large"
- input: Text or array of texts
- dimensions: Output dimension (for v3 models)
```

### 3. Image Generation
Generate images using DALL-E.

```
Tool: image_generation
Parameters:
- prompt: Text description
- model: "dall-e-2", "dall-e-3"
- size: "1024x1024", "1792x1024", "1024x1792"
- quality: "standard", "hd"
- n: Number of images
```

### 4. Content Moderation
Check if content violates OpenAI usage policies.

```
Tool: moderation
Parameters:
- input: Text or array of texts
- model: "text-moderation-latest"
```

### 5. List Models
Get available OpenAI models.

```
Tool: list_models
Parameters: none
```

## Usage Examples

Once configured, you can use these commands in Claude Code:

### Example prompts:
- "Use OpenAI to generate a haiku about coding"
- "Create embeddings for this text using OpenAI"
- "Generate an image of a futuristic city using DALL-E"
- "List all available OpenAI models"
- "Check if this text violates content policies"

## Testing

Test the server directly:

```bash
# Test initialization
npm test

# Or manually
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"0.1.0"},"id":1}' | node mcp-server.js
```

## Troubleshooting

### Server not connecting
1. Check Claude Code logs: `Help > Show Logs`
2. Verify the path in your config is correct
3. Ensure Node.js version is 18+

### API Key issues
1. Verify your OpenAI API key is valid
2. Check you have available credits
3. Ensure the key has necessary permissions

### Tool not working
1. Restart Claude Code after config changes
2. Check error messages in Claude Code
3. Test the server manually using the test command

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test
```

## Security

- API keys are stored locally and never transmitted except to OpenAI
- Use environment variables or Claude Code config for API keys
- Never commit `.env` files to version control

## License

MIT