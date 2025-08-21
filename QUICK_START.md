# 🚀 Quick Start - OpenAI MCP Bridge

## 5-Minute Setup

### 1️⃣ On Your Server
```bash
# SSH to your server (use YOUR actual server address)
# Example: ssh user@192.168.1.100 or ssh user@mcp.mydomain.com
ssh user@your-server.com

# Get the code
git clone https://github.com/tbulle/openai-mcp.git
cd openai-mcp

# Deploy (generates API key automatically)
chmod +x docker-deploy.sh
./docker-deploy.sh local
```

### 2️⃣ Copy the Output
The script will show:
```
==================================================
Configuration for Claude Code:

{
  "mcpServers": {
    "openai": {
      "url": "http://your-server.com:3456/sse",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer a7b9c2d4e5f6g8h9..."
      },
      "config": {
        "openaiApiKey": "sk-YOUR_OPENAI_API_KEY"
      }
    }
  }
}
```

### 3️⃣ Configure Claude Code

**Find your Claude Code config file:**

| OS | Location |
|----|----------|
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

**Add the configuration** (replace `sk-YOUR_OPENAI_API_KEY` with your actual key)

### 4️⃣ Test It
```bash
# From your local machine
curl http://your-server.com:3456/health

# Should return: {"status":"ok","service":"openai-mcp-bridge"}
```

### 5️⃣ Use in Claude Code
Now you can use OpenAI in any project:
- "Use GPT-4 to..."
- "Ask OpenAI to..."
- "Generate embeddings for..."

---

## 📋 Checklist

- [ ] Server deployed: `./docker-deploy.sh local`
- [ ] Got API key from output
- [ ] Added config to Claude Code settings
- [ ] Tested health endpoint
- [ ] Added your OpenAI API key

## 🆘 Quick Fixes

**Can't connect?**
```bash
# Check if running
docker ps | grep openai-mcp

# Check logs
docker logs openai-mcp-bridge
```

**Wrong API key?**
```bash
# Update .env file
echo "API_KEY=new-key-here" > .env
docker restart openai-mcp-bridge
```

**Need to stop/start?**
```bash
docker stop openai-mcp-bridge
docker start openai-mcp-bridge
```

That's it! Your OpenAI MCP bridge is ready to use from any project. 🎉