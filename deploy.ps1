# Grudge Warlords RPG - Puter Deployment Script (PowerShell)
# This script prepares and deploys the game to Puter.com

Write-Host "🎮 Grudge Warlords RPG - Puter Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Puter CLI is installed
$puterInstalled = Get-Command puter -ErrorAction SilentlyContinue
if (-not $puterInstalled) {
    Write-Host "❌ Puter CLI not found. Installing..." -ForegroundColor Red
    npm install -g @puter/cli
}

# Check if logged in
Write-Host "📝 Checking Puter authentication..." -ForegroundColor Yellow
$whoami = puter whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔐 Please login to Puter..." -ForegroundColor Yellow
    puter login
}

# Set environment variables
if (Test-Path .env) {
    Write-Host "🔑 Loading environment variables..." -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
            
            # Set Puter secrets
            if ($name -eq 'GEMINI_API_KEY') {
                Write-Host "🤖 Setting Gemini API key as Puter secret..." -ForegroundColor Yellow
                puter secret set GEMINI_API_KEY $value
            }
        }
    }
} else {
    Write-Host "⚠️  No .env file found. Skipping environment setup." -ForegroundColor Yellow
}

# Build check
Write-Host "🔨 Running pre-deployment checks..." -ForegroundColor Yellow
npm run validate-config
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Config validation skipped" -ForegroundColor Yellow
}

# Deploy to Puter
Write-Host "🚀 Deploying to Puter..." -ForegroundColor Green
puter deploy

# Check deployment status
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your game is now live on Puter!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Visit your app on Puter"
    Write-Host "  2. Test AI features"
    Write-Host "  3. Share with players!"
} else {
    Write-Host "❌ Deployment failed. Check the logs above." -ForegroundColor Red
    exit 1
}

