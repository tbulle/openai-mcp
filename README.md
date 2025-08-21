# OpenAI MCP Server

A stdio-based Model Context Protocol (MCP) server that bridges Claude Code to OpenAI's API, allowing you to use GPT models directly within Claude Code.

## Features

- **Local stdio-based server**: Works directly with Claude Code's MCP implementation
- **Full OpenAI API access**: Chat completions, embeddings, and model listing
- **Simple setup**: Just configure and run
- **Secure**: API key stored locally in environment variables

## Prerequisites

- Node.js v18 or higher
- OpenAI API key
- Claude Code (Claude Desktop app)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/tbulle/openai-mcp.git
cd openai-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up your OpenAI API key:
```bash
# Create .env file
echo "OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE" > .env
```

## Configuration for Claude Code

Add this server to your Claude Desktop configuration:

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openai": {
      "command": "node",
      "args": ["C:/path/to/openai-mcp/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-proj-YOUR_ACTUAL_OPENAI_API_KEY_HERE"
      }
    }
  }
}
```

### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openai": {
      "command": "node",
      "args": ["/path/to/openai-mcp/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-proj-YOUR_ACTUAL_OPENAI_API_KEY_HERE"
      }
    }
  }
}
```

### Linux
Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openai": {
      "command": "node",
      "args": ["/path/to/openai-mcp/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-proj-YOUR_ACTUAL_OPENAI_API_KEY_HERE"
      }
    }
  }
}
```

**Important**: 
- Replace `/path/to/openai-mcp/` with the actual path where you cloned this repository
- Replace the API key with your actual OpenAI API key
- Restart Claude Code after updating the configuration

## Available Tools

Once configured, the following tools will be available in Claude Code:

### 1. `chat_completion`
Create chat completions using OpenAI GPT models.

Parameters:
- `model` (string, optional): Model to use (default: "gpt-3.5-turbo")
- `messages` (array, required): Array of message objects with `role` and `content`
- `temperature` (number, optional): Sampling temperature 0-2 (default: 0.7)
- `max_tokens` (number, optional): Maximum tokens to generate

Example usage in Claude Code:
```
Use the chat_completion tool to ask GPT-4 to write a haiku about programming
```

### 2. `list_models`
List all available OpenAI models.

No parameters required.

Example usage in Claude Code:
```
Use the list_models tool to show me what OpenAI models are available
```

### 3. `embeddings`
Create text embeddings.

Parameters:
- `model` (string, optional): Model to use (default: "text-embedding-3-small")
- `input` (string, required): Text to create embeddings for

Example usage in Claude Code:
```
Use the embeddings tool to create embeddings for the text "Hello, world!"
```

## Testing the Server

You can test the MCP server directly:

```bash
# Run the test script
node test-mcp.js

# Or test manually with a single command
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"0.1.0","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}' | node index.js
```

## Troubleshooting

1. **Claude Code doesn't show the OpenAI tools**
   - Make sure you've restarted Claude Code after updating the configuration
   - Check that the path to index.js is correct in your configuration
   - Verify Node.js is installed and accessible from the command line

2. **"OPENAI_API_KEY environment variable is required" error**
   - Ensure you've set the API key in either the .env file or the Claude configuration
   - Check that the API key is valid and starts with `sk-proj-`

3. **OpenAI API errors**
   - Verify your API key has sufficient quota
   - Check that you're using a valid model name
   - Ensure your API key has access to the requested models

4. **Server initialization fails**
   - Make sure you're using Node.js v18 or higher
   - Check that all dependencies are installed (`npm install`)
   - Look for error messages in Claude Code's developer console

## Development

To run the server in development mode with auto-reload:

```bash
npm run dev
```

To run tests:

```bash
npm test
```

## Security Notes

- Your OpenAI API key is stored locally and never transmitted except to OpenAI's API
- The MCP server runs locally on your machine via stdio (standard input/output)
- No network ports are opened; communication happens through process pipes

## License

MIT