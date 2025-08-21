#!/bin/bash

# Docker Deployment Script for OpenAI MCP Bridge
# Usage: ./docker-deploy.sh [server-hostname] [api-key]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER=${1:-"localhost"}
API_KEY=${2:-$(openssl rand -hex 32)}
CONTAINER_NAME="openai-mcp-bridge"
IMAGE_NAME="openai-mcp-bridge:latest"
PORT=${3:-3456}

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     OpenAI MCP Bridge - Docker Deployment     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Configuration:${NC}"
echo "  Server: $SERVER"
echo "  Port: $PORT"
echo "  Container: $CONTAINER_NAME"
echo ""

# Function to deploy locally
deploy_local() {
    echo -e "${YELLOW}→ Building Docker image...${NC}"
    docker build -t $IMAGE_NAME .
    
    echo -e "${YELLOW}→ Stopping existing container (if any)...${NC}"
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    echo -e "${YELLOW}→ Starting container...${NC}"
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:3000 \
        -e API_KEY="$API_KEY" \
        -e NODE_ENV=production \
        $IMAGE_NAME
    
    echo -e "${GREEN}✓ Container started successfully!${NC}"
    
    # Wait for service to be ready
    echo -e "${YELLOW}→ Waiting for service to be ready...${NC}"
    sleep 3
    
    # Check health
    if curl -s http://localhost:$PORT/health > /dev/null; then
        echo -e "${GREEN}✓ Service is healthy!${NC}"
    else
        echo -e "${RED}✗ Service health check failed${NC}"
        echo "Checking container logs:"
        docker logs $CONTAINER_NAME --tail 20
    fi
}

# Function to deploy remotely
deploy_remote() {
    echo -e "${YELLOW}→ Preparing deployment package...${NC}"
    
    # Create a temporary env file
    echo "API_KEY=$API_KEY" > .env.deploy
    
    # Create deployment archive
    tar czf mcp-docker-deploy.tar.gz \
        Dockerfile \
        docker-compose.yml \
        nginx-docker.conf \
        server.js \
        package.json \
        package-lock.json \
        .env.deploy \
        docker-deploy.sh
    
    echo -e "${YELLOW}→ Copying files to server...${NC}"
    scp mcp-docker-deploy.tar.gz $SERVER:/tmp/
    
    echo -e "${YELLOW}→ Deploying on remote server...${NC}"
    ssh $SERVER << ENDSSH
        set -e
        cd /tmp
        rm -rf openai-mcp-deploy
        mkdir openai-mcp-deploy
        cd openai-mcp-deploy
        tar xzf ../mcp-docker-deploy.tar.gz
        
        # Build and run with docker-compose
        echo "API_KEY=$API_KEY" > .env
        docker-compose up -d --build
        
        # Check status
        sleep 5
        docker-compose ps
        docker-compose logs --tail=20
ENDSSH
    
    # Cleanup
    rm mcp-docker-deploy.tar.gz .env.deploy
    
    echo -e "${GREEN}✓ Remote deployment complete!${NC}"
}

# Quick start with docker-compose (alternative)
quick_start() {
    echo -e "${YELLOW}→ Quick start with docker-compose...${NC}"
    
    # Create .env file
    echo "API_KEY=$API_KEY" > .env
    echo "DOMAIN=$SERVER" >> .env
    
    # Start services
    docker-compose up -d --build
    
    echo -e "${GREEN}✓ Services started!${NC}"
    
    # Show status
    docker-compose ps
}

# Main deployment logic
if [ "$1" == "local" ] || [ -z "$1" ]; then
    deploy_local
elif [ "$1" == "compose" ]; then
    quick_start
elif [ "$1" == "stop" ]; then
    echo -e "${YELLOW}→ Stopping container...${NC}"
    docker stop $CONTAINER_NAME
    echo -e "${GREEN}✓ Container stopped${NC}"
elif [ "$1" == "logs" ]; then
    docker logs -f $CONTAINER_NAME
elif [ "$1" == "status" ]; then
    docker ps | grep $CONTAINER_NAME || echo "Container not running"
else
    deploy_remote
fi

# Display configuration
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}Configuration for Claude Code:${NC}"
echo ""
echo "Add this to your Claude Code settings:"
echo ""
cat << EOF
{
  "mcpServers": {
    "openai": {
      "url": "http://$SERVER:$PORT/sse",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer $API_KEY"
      },
      "config": {
        "openaiApiKey": "sk-YOUR_OPENAI_API_KEY"
      }
    }
  }
}
EOF
echo ""
echo -e "${YELLOW}Note: Replace sk-YOUR_OPENAI_API_KEY with your actual OpenAI API key${NC}"
echo ""

# Show useful commands
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:    docker logs -f $CONTAINER_NAME"
echo "  Stop:         docker stop $CONTAINER_NAME"
echo "  Start:        docker start $CONTAINER_NAME"
echo "  Restart:      docker restart $CONTAINER_NAME"
echo "  Status:       docker ps | grep $CONTAINER_NAME"
echo "  Health check: curl http://$SERVER:$PORT/health"
echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"