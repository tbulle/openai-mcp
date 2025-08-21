# OpenAI MCP Bridge

A self-hosted Model Context Protocol (MCP) server that bridges Claude Code to OpenAI's API, allowing you to use GPT models directly within Claude Code.

## Features

- **Self-hosted**: Deploy on your own SSH server for complete control
- **Docker Support**: Run in container for easy deployment and isolation
- **Secure**: API key authentication + OpenAI key passed from client
- **Simple**: No OAuth, no complex setup
- **Persistent**: Runs as systemd service or Docker container
- **HTTPS Ready**: Nginx configuration included for SSL/TLS

## Quick Start

### Option 1: Docker Deployment (Recommended)

Deploy the MCP bridge as a Docker container on your SSH server:

```bash
# SSH to the server
ssh user@allpurpose.ddns.net

# Clone this repository
git clone https://github.com/tbulle/openai-mcp.git
cd openai-mcp

# Deploy with Docker
chmod +x docker-deploy.sh
./docker-deploy.sh local

# Or use docker-compose
docker-compose up -d
```

The container will:
- Run on port 3456 (configurable)
- Auto-restart on failure
- Generate secure API key
- Provide health checks

### Option 2: System Service Deployment

### 1. Deploy to Your Server

```bash
# SSH to the server
ssh user@allpurpose.ddns.net

# Clone this repository
git clone https://github.com/tbulle/openai-mcp.git
cd openai-mcp

# Deploy
./deploy.sh allpurpose.ddns.net
```

The script will:
- Install the MCP bridge on your server
- Set up systemd service for auto-start
- Configure nginx for HTTPS (if available)
- Generate a secure API key
- Provide Claude Code configuration

### 2. Configure Claude Code

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "openai": {
      "url": "http://allpurpose.ddns.net:3456/sse",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer YOUR_BRIDGE_API_KEY"
      },
      "config": {
        "openaiApiKey": "sk-YOUR_OPENAI_API_KEY"
      }
    }
  }
}
```

### 3. Use in Claude Code

Once configured, you can use OpenAI tools:

- `chat_completion` - Chat with GPT models
- `embeddings` - Generate text embeddings
- `list_models` - List available models

## Security

- **Bridge API Key**: Authenticates requests to your MCP server
- **OpenAI API Key**: Passed from Claude Code, never stored on server
- **HTTPS**: Use nginx + Let's Encrypt for encrypted connections

## Manual Installation

If you prefer manual setup:

```bash
# On your server
cd /opt
sudo git clone <your-repo> openai-mcp
cd openai-mcp

# Install dependencies
sudo npm install --production

# Create .env file
sudo cp .env.example .env
sudo nano .env  # Add your bridge API key

# Install systemd service
sudo cp openai-mcp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable openai-mcp
sudo systemctl start openai-mcp

# Check status
sudo systemctl status openai-mcp
```

## Configuration

### Environment Variables (.env)

- `PORT` - Server port (default: 3000)
- `API_KEY` - Your bridge authentication key

### OpenAI API Key

The OpenAI API key is provided by Claude Code in the MCP configuration, not stored on the server.

## Monitoring

```bash
# Check service status
sudo systemctl status openai-mcp

# View logs
sudo journalctl -u openai-mcp -f

# Test health endpoint
curl http://localhost:3000/health
```

## Docker Commands

### Managing the Container

```bash
# View logs
docker logs -f openai-mcp-bridge

# Stop container
docker stop openai-mcp-bridge

# Start container
docker start openai-mcp-bridge

# Restart container
docker restart openai-mcp-bridge

# Check status
docker ps | grep openai-mcp

# Remove container
docker rm -f openai-mcp-bridge

# Update and rebuild
git pull
docker-compose up -d --build
```

### Testing

```bash
# Test health endpoint
curl http://localhost:3456/health

# Test from remote
curl http://allpurpose.ddns.net:3456/health
```

## Updating

### Docker Update
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
# Or
./docker-deploy.sh local
```

### System Service Update
```bash
# Pull latest changes
cd /opt/openai-mcp
sudo git pull

# Restart service
sudo systemctl restart openai-mcp
```

## Troubleshooting

1. **Connection refused**: Check if service is running
2. **Unauthorized**: Verify your bridge API key
3. **OpenAI errors**: Check your OpenAI API key and quota
4. **SSL issues**: Ensure Let's Encrypt certificates are valid

## License

MIT