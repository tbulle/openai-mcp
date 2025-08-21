# ⚠️ IMPORTANT: Server Address Configuration

## You MUST Replace These Values

Before deploying, you need to know YOUR server's address. This is NOT provided - you must use your own server.

### What You Need:

1. **Your Server's Address** - One of these:
   - IP Address: `192.168.1.100`, `10.0.0.5`, etc.
   - Domain Name: `myserver.com`, `vps.example.org`, etc.
   - Subdomain: `mcp.myserver.com`, `api.mydomain.net`, etc.

2. **Your Server's SSH Access**:
   - Username (often `root`, `ubuntu`, or custom)
   - SSH port (usually 22)

### Examples of Real Addresses:

| Type | Example Command | Your Claude Code Config URL |
|------|----------------|---------------------------|
| Local Network IP | `ssh user@192.168.1.100` | `http://192.168.1.100:3456/sse` |
| Public IP | `ssh user@45.79.123.456` | `http://45.79.123.456:3456/sse` |
| Domain | `ssh user@myserver.com` | `http://myserver.com:3456/sse` |
| Subdomain | `ssh user@mcp.example.com` | `http://mcp.example.com:3456/sse` |

### Step-by-Step:

1. **Find Your Server Address**:
   ```bash
   # If you're already on the server:
   hostname -I  # Shows IP addresses
   hostname -f  # Shows full domain name
   ```

2. **Test SSH Access**:
   ```bash
   # Replace with YOUR actual values:
   ssh YOUR_USERNAME@YOUR_SERVER_ADDRESS
   ```

3. **Deploy the MCP Bridge**:
   ```bash
   # Once connected to YOUR server:
   git clone https://github.com/tbulle/openai-mcp.git
   cd openai-mcp
   ./docker-deploy.sh local
   ```

4. **Configure Claude Code**:
   Use YOUR server address in the URL:
   ```json
   {
     "mcpServers": {
       "openai": {
         "url": "http://YOUR_SERVER_ADDRESS:3456/sse",
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