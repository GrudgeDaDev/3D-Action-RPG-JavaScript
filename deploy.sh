#!/bin/bash

# Grudge Warlords RPG - Puter Deployment Script
# This script prepares and deploys the game to Puter.com

echo "🎮 Grudge Warlords RPG - Puter Deployment"
echo "=========================================="

# Check if Puter CLI is installed
if ! command -v puter &> /dev/null; then
    echo "❌ Puter CLI not found. Installing..."
    npm install -g @puter/cli
fi

# Check if logged in
echo "📝 Checking Puter authentication..."
puter whoami || {
    echo "🔐 Please login to Puter..."
    puter login
}

# Set environment variables
if [ -f .env ]; then
    echo "🔑 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
    
    # Set Puter secrets
    if [ ! -z "$GEMINI_API_KEY" ]; then
        echo "🤖 Setting Gemini API key as Puter secret..."
        puter secret set GEMINI_API_KEY "$GEMINI_API_KEY"
    fi
else
    echo "⚠️  No .env file found. Skipping environment setup."
fi

# Build check
echo "🔨 Running pre-deployment checks..."
npm run validate-config || echo "⚠️  Config validation skipped"

# Deploy to Puter
echo "🚀 Deploying to Puter..."
puter deploy

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your game is now live on Puter!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Visit your app on Puter"
    echo "  2. Test AI features"
    echo "  3. Share with players!"
else
    echo "❌ Deployment failed. Check the logs above."
    exit 1
fi

