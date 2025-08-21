#!/bin/bash

# OpenAI MCP Bridge Deployment Script
# Usage: ./deploy.sh [server-hostname] [api-key]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER=${1:-"your-server.com"}
API_KEY=${2:-$(openssl rand -hex 32)}
INSTALL_DIR="/opt/openai-mcp"

echo -e "${GREEN}OpenAI MCP Bridge - Deployment Script${NC}"
echo "======================================"
echo "Server: $SERVER"
echo "Install directory: $INSTALL_DIR"
echo ""

# Check if running locally or on server
if [ "$HOSTNAME" == "$SERVER" ] || [ "$1" == "local" ]; then
    echo -e "${YELLOW}Installing on local machine...${NC}"
    
    # Create installation directory
    sudo mkdir -p $INSTALL_DIR
    
    # Copy files
    sudo cp server.js package.json $INSTALL_DIR/
    sudo cp openai-mcp.service /etc/systemd/system/
    
    # Create .env file
    echo "PORT=3000" | sudo tee $INSTALL_DIR/.env > /dev/null
    echo "API_KEY=$API_KEY" | sudo tee -a $INSTALL_DIR/.env > /dev/null
    
    # Install dependencies
    cd $INSTALL_DIR
    sudo npm install --production
    
    # Set permissions
    sudo chown -R www-data:www-data $INSTALL_DIR
    
    # Setup systemd service
    sudo systemctl daemon-reload
    sudo systemctl enable openai-mcp
    sudo systemctl restart openai-mcp
    
    # Setup nginx if available
    if command -v nginx &> /dev/null; then
        echo -e "${GREEN}Setting up Nginx...${NC}"
        sudo cp nginx.conf /etc/nginx/sites-available/openai-mcp
        sudo sed -i "s/your-server.com/$SERVER/g" /etc/nginx/sites-available/openai-mcp
        sudo ln -sf /etc/nginx/sites-available/openai-mcp /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
    fi
    
    echo -e "${GREEN}✓ Installation complete!${NC}"
    
else
    echo -e "${YELLOW}Deploying to remote server: $SERVER${NC}"
    
    # Create deployment package
    tar czf openai-mcp.tar.gz server.js package.json openai-mcp.service nginx.conf deploy.sh .env.example
    
    # Copy to server
    echo "Copying files to server..."
    scp openai-mcp.tar.gz $SERVER:/tmp/
    
    # Execute installation on remote server
    echo "Installing on remote server..."
    ssh $SERVER << 'ENDSSH'
        set -e
        cd /tmp
        tar xzf openai-mcp.tar.gz
        chmod +x deploy.sh
        sudo ./deploy.sh local
ENDSSH
    
    # Cleanup
    rm openai-mcp.tar.gz
    
    echo -e "${GREEN}✓ Remote deployment complete!${NC}"
fi

# Display configuration for Claude Code
echo ""
echo "======================================"
echo -e "${GREEN}Configuration for Claude Code:${NC}"
echo ""
echo "Add this to your Claude Code settings (claude.json or MCP config):"
echo ""
cat << EOF
{
  "mcpServers": {
    "openai": {
      "url": "https://$SERVER/mcp/sse",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer $API_KEY"
      },
      "config": {
        "openaiApiKey": "YOUR_OPENAI_API_KEY_HERE"
      }
    }
  }
}
EOF
echo ""
echo -e "${YELLOW}Remember to replace YOUR_OPENAI_API_KEY_HERE with your actual OpenAI API key${NC}"
echo ""

# Check service status
if [ "$HOSTNAME" == "$SERVER" ] || [ "$1" == "local" ]; then
    echo "Service status:"
    sudo systemctl status openai-mcp --no-pager | head -n 10
    echo ""
    echo "Test the service:"
    echo "curl http://localhost:3000/health"
fi

echo -e "${GREEN}✓ Deployment complete!${NC}"