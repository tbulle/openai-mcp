# OpenAI MCP Bridge - Complete Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Deploy to Your Server

#### A. SSH into your server
```bash
ssh user@allpurpose.ddns.net
```

#### B. Clone and setup the project
```bash
# Create directory for MCP services
mkdir -p ~/services
cd ~/services

# Clone this repository
git clone https://github.com/tbulle/openai-mcp.git
cd openai-mcp

# Make scripts executable
chmod +x docker-deploy.sh deploy.sh
```

#### C. Deploy with Docker (Recommended)
```bash
# Generate a secure API key and deploy
./docker-deploy.sh local

# Or specify your own API key
./docker-deploy.sh local my-secret-api-key

# The script will output your configuration
```

### Step 2: Note Your Server Details

After deployment, you'll need these details:

| Setting | Value | Description |
|---------|-------|-------------|
| **Server Address** | `allpurpose.ddns.net` | MCP Bridge server |
| **Port** | `3456` | Default Docker port |
| **Bridge API Key** | Generated during setup | `a7b9c2d4e5f6...` (32 chars) |
| **OpenAI API Key** | Your OpenAI key | `sk-proj-abc123...` |

### Step 3: Configure Claude Code

#### Method 1: Global Configuration (Recommended)

Add to your Claude Code settings file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

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

#### Method 2: Project-Specific Configuration

Create `.claude/claude.json` in your project:
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

### Step 4: Test the Connection

#### From your local machine:
```bash
# Test if server is accessible
curl http://allpurpose.ddns.net:3456/health

# Should return:
{"status":"ok","service":"openai-mcp-bridge"}
```

#### From Claude Code:
Once configured, you can use commands like:
- "Use OpenAI to generate..."
- "Ask GPT-4 about..."
- "Create embeddings for..."

## 📋 Complete Example

Using the official server at `allpurpose.ddns.net`:

### 1. On the server:
```bash
ssh user@allpurpose.ddns.net
cd ~/services/openai-mcp
./docker-deploy.sh local
```

Output:
```
Configuration for Claude Code:
API_KEY: a7b9c2d4e5f6g8h9i0j1k2l3m4n5o6p7
Port: 3456
```

### 2. On your local machine:

Edit Claude Code config:
```json
{
  "mcpServers": {
    "openai": {
      "url": "http://allpurpose.ddns.net:3456/sse",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer a7b9c2d4e5f6g8h9i0j1k2l3m4n5o6p7"
      },
      "config": {
        "openaiApiKey": "sk-proj-YourActualOpenAIKey"
      }
    }
  }
}
```

### 3. Test:
```bash
curl http://allpurpose.ddns.net:3456/health
```

## 🔧 Available Tools in Claude Code

Once connected, these tools are available:

### 1. Chat Completion
```
Tool: chat_completion
Models: gpt-4, gpt-4-turbo, gpt-3.5-turbo
Example: "Use GPT-4 to explain quantum computing"
```

### 2. Embeddings
```
Tool: embeddings
Models: text-embedding-3-small, text-embedding-3-large
Example: "Generate embeddings for this text"
```

### 3. List Models
```
Tool: list_models
Example: "List all available OpenAI models"
```

## 🛠️ Troubleshooting

### Connection Issues

#### Cannot connect to server
```bash
# Check if container is running
docker ps | grep openai-mcp

# Check logs
docker logs openai-mcp-bridge

# Test locally on server
curl http://localhost:3456/health
```

#### Authentication failed
- Verify your Bridge API key matches exactly
- Check the Authorization header format: `Bearer YOUR_KEY`

#### OpenAI errors
- Verify your OpenAI API key is valid
- Check OpenAI API quota and billing

### Common Problems & Solutions

| Problem | Solution |
|---------|----------|
| Port 3456 already in use | Change port in docker-compose.yml |
| Container keeps restarting | Check logs: `docker logs openai-mcp-bridge` |
| SSL/HTTPS needed | Use nginx proxy or Cloudflare tunnel |
| Firewall blocking | Open port 3456: `sudo ufw allow 3456` |

## 🔒 Security Best Practices

1. **Use HTTPS in production**
   - Set up nginx with SSL certificates
   - Or use Cloudflare Tunnel for secure access

2. **Restrict access**
   ```bash
   # Firewall - allow only your IP
   sudo ufw allow from YOUR_IP to any port 3456
   ```

3. **Rotate API keys regularly**
   ```bash
   # Generate new key
   openssl rand -hex 32
   # Update .env and restart
   docker restart openai-mcp-bridge
   ```

4. **Monitor usage**
   ```bash
   # Check logs regularly
   docker logs openai-mcp-bridge --since 24h
   ```

## 📊 Monitoring

### Check Status
```bash
# Is it running?
docker ps | grep openai-mcp

# View recent logs
docker logs openai-mcp-bridge --tail 50

# Follow logs in real-time
docker logs -f openai-mcp-bridge
```

### Resource Usage
```bash
# Check memory and CPU
docker stats openai-mcp-bridge
```

## 🔄 Updating

```bash
# Pull latest changes
cd ~/services/openai-mcp
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## 📝 Environment Variables

Create `.env` file on server:
```bash
# Bridge authentication
API_KEY=your-secure-api-key

# Server port (optional, default 3000)
PORT=3000

# Node environment
NODE_ENV=production
```

## 🌐 Multiple Servers Setup

You can run multiple instances for different purposes:

```json
{
  "mcpServers": {
    "openai-dev": {
      "url": "http://dev.server.com:3456/sse",
      "config": {
        "openaiApiKey": "sk-dev-key"
      }
    },
    "openai-prod": {
      "url": "http://prod.server.com:3456/sse",
      "config": {
        "openaiApiKey": "sk-prod-key"
      }
    }
  }
}
```

## 📞 Support

- **Logs**: Always check `docker logs openai-mcp-bridge` first
- **Health**: Verify with `curl http://server:3456/health`
- **Restart**: Try `docker restart openai-mcp-bridge`
- **Rebuild**: If issues persist, rebuild with `docker-compose up -d --build`

## Example Test Commands

Once everything is set up, test in Claude Code:

1. "List available OpenAI models"
2. "Use GPT-4 to write a haiku about coding"
3. "Generate embeddings for 'machine learning'"

The bridge will handle all communication between Claude Code and OpenAI API!