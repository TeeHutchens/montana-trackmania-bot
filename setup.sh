#!/bin/bash

# Montana Trackmania Bot - Initial Setup Script
# This script helps you set up the bot for the first time

echo "🏔️ Montana Trackmania Bot - Initial Setup"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   For Raspberry Pi: https://docs.docker.com/engine/install/debian/"
    exit 1
fi

# Check if Docker Compose is available (either as plugin or standalone)
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    echo "   Modern Docker installations include Compose as a plugin."
    exit 1
fi

echo "✅ Docker and Docker Compose are available."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Discord token and Ubisoft credentials:"
    echo "   nano .env"
    echo ""
    echo "Required values:"
    echo "  - DISCORD_TOKEN (from Discord Developer Portal)"
    echo "  - UBI_USERNAME (your Ubisoft username)"
    echo "  - UBI_PASSWORD (your Ubisoft password)"
    echo ""
    read -p "Press Enter when you've configured .env..."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p cache logs

# Set permissions for cache directory
chmod 755 cache logs

# Validate .env file
echo "🔍 Validating configuration..."
if grep -q "your_discord_token_here" .env; then
    echo "❌ Please configure your DISCORD_TOKEN in .env file"
    exit 1
fi

if grep -q "your_ubisoft_username" .env; then
    echo "❌ Please configure your UBI_USERNAME in .env file" 
    exit 1
fi

echo "✅ Configuration looks good!"

# Build the Docker image
echo "🔨 Building Docker image..."
docker compose build

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
else
    echo "❌ Failed to build Docker image. Please check the logs above."
    exit 1
fi

# Test run (optional)
echo ""
read -p "🧪 Would you like to test run the bot? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting test run..."
    docker compose up -d
    
    echo "📋 Showing logs for 30 seconds..."
    timeout 30 docker compose logs -f
    
    echo ""
    echo "🔍 Bot status:"
    docker compose ps
    
    echo ""
    read -p "Keep the bot running? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "🛑 Stopping test run..."
        docker compose down
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  ./bot-manager.sh start   # Start the bot"
echo "  ./bot-manager.sh logs    # View logs"
echo "  ./bot-manager.sh status  # Check status"
echo ""
echo "📖 See DOCKER_README.md for full documentation."
