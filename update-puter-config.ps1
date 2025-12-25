# Update puter.json with GGE configuration
$config = @{
    name = "gge"
    title = "GGE"
    appId = "app-fe416167-31c9-45a9-a552-7ab8b1cdef7a"
    indexUrl = "https://gge-warlords.puter.site"
    description = "GGE Warlords - 3D Action RPG with AI-powered gameplay, class selection, and character progression"
    version = "1.0.0"
    main = "index.html"
    icon = "assets/icon.png"
    category = "games"
    permissions = @("ai", "storage", "network", "kv")
    ai = @{
        enabled = $true
        models = @("gemini-2.0-flash-exp", "gpt-5-nano", "claude-sonnet-4")
        features = @("chat", "txt2img", "img2txt", "agents")
    }
    storage = @{
        enabled = $true
        quota = "100MB"
    }
    network = @{
        enabled = $true
        domains = @("*.puter.com", "*.puter.site", "cdn.babylonjs.com", "localhost:5500")
    }
    build = @{
        type = "static"
        outputDir = "."
        excludes = @("node_modules", ".git", ".venv", "*.md", "package-lock.json", "reference", "docs", "examples/UItools", "examples/TheForge-main")
    }
    scripts = @{
        start = "node server.js"
        dev = "node server.js"
        deploy = "puter deploy"
        "deploy:check" = "puter whoami && puter apps list"
    }
    env = @{
        GEMINI_API_KEY = "`${GEMINI_API_KEY}"
        NODE_ENV = "production"
        PUTER_APP_ID = "app-fe416167-31c9-45a9-a552-7ab8b1cdef7a"
    }
}

$config | ConvertTo-Json -Depth 10 | Set-Content -Path "puter.json" -Encoding UTF8
Write-Host "✅ puter.json updated with GGE configuration" -ForegroundColor Green

