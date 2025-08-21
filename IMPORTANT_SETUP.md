# 🌐 Server Connection Information

## Official Server Address

The OpenAI MCP Bridge is hosted at:

### Server Details:

**DNS Address**: `allpurpose.ddns.net`

**SSH Access**:
```bash
ssh user@allpurpose.ddns.net
```

**MCP Bridge URL for Claude Code**:
```
http://allpurpose.ddns.net:3456/sse
```

### Examples of Real Addresses:

| Type | Example Command | Your Claude Code Config URL |
|------|----------------|---------------------------|
| Local Network IP | `ssh user@192.168.1.100` | `http://192.168.1.100:3456/sse` |
| Public IP | `ssh user@45.79.123.456` | `http://45.79.123.456:3456/sse` |
| Domain | `ssh user@myserver.com` | `http://myserver.com:3456/sse` |
| Subdomain | `ssh user@mcp.example.com` | `http://mcp.example.com:3456/sse` |

### Step-by-Step Setup:

1. **Connect to the Server**:
   ```bash
   ssh user@allpurpose.ddns.net
   ```

2. **Deploy the MCP Bridge** (on the server):
   ```bash
   git clone https://github.com/tbulle/openai-mcp.git
   cd openai-mcp
   ./docker-deploy.sh local
   ```

3. **Save the API Key** from the deployment output

4. **Configure Claude Code**:
   Add this to your Claude Code settings:
   ```json
   {
     "mcpServers": {
       "openai": {
         "url": "http://allpurpose.ddns.net:3456/sse",
         "transport": "sse",
         "headers": {
           "Authorization": "Bearer YOUR_API_KEY_FROM_DEPLOYMENT"
         },
         "config": {
           "openaiApiKey": "sk-YOUR_OPENAI_KEY"
         }
       }
     }
   }
   ```

5. **Test the Connection**:
   ```bash
   curl http://allpurpose.ddns.net:3456/health
   ```

## Common Server Providers

If you need a server, here are common options:

| Provider | Typical Address Format | Monthly Cost |
|----------|----------------------|--------------|
| DigitalOcean | `159.65.xxx.xxx` or custom domain | $4-6 |
| Linode | `45.79.xxx.xxx` or custom domain | $5+ |
| AWS EC2 | `ec2-xx-xx-xx-xx.compute.amazonaws.com` | Free tier available |
| Hetzner | `xx.xx.xx.xx` or custom domain | €3-5 |
| Home Server | `192.168.1.x` (local) or dynamic DNS | Free |
| Raspberry Pi | `raspberrypi.local` or IP | Hardware cost only |

## No Server? Options:

1. **Use a VPS** - Rent a small server ($5/month)
2. **Home Server** - Use an old PC or Raspberry Pi
3. **Free Tier** - AWS/Oracle/Google Cloud free tiers
4. **Local Testing** - Run on your computer (localhost:3456)

## Remember:

- ❌ `your-server.com` is a PLACEHOLDER
- ❌ `mcp.example.com` is an EXAMPLE
- ✅ Use YOUR actual server's IP or domain
- ✅ The server must be accessible from your computer