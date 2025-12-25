# GGE Warlords - Comprehensive Cleanup Script
# Organizes documentation, archives unused files, ensures consistency

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GGE Warlords - Comprehensive Cleanup  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create archive directory if it doesn't exist
$archiveDir = "archive"
if (-not (Test-Path $archiveDir)) {
    Write-Host "[1/6] Creating archive directory..." -ForegroundColor Green
    New-Item -ItemType Directory -Path $archiveDir | Out-Null
}
else {
    Write-Host "[1/6] Archive directory exists" -ForegroundColor Yellow
}

# Move system documentation from root to docs
Write-Host "[2/6] Moving system documentation to docs..." -ForegroundColor Green

$docMappings = @{
    "AI_INTEGRATION_README.md"            = "docs/AI_INTEGRATION.md"
    "AUTH_SYSTEM_IMPLEMENTATION.md"       = "docs/AUTH_SYSTEM.md"
    "CHARACTER_PROGRESSION_README.md"     = "docs/CHARACTER_PROGRESSION.md"
    "CRAFTING_IMPLEMENTATION_SUMMARY.md"  = "docs/CRAFTING_SYSTEM.md"
    "MOUNT_SYSTEM_SUMMARY.md"             = "docs/MOUNT_SYSTEM.md"
    "RACE_SYSTEM_SUMMARY.md"              = "docs/RACE_SYSTEM.md"
    "SKILL_TREE_CONSOLIDATION_SUMMARY.md" = "docs/SKILL_TREE_SYSTEM.md"
    "TILE_SYSTEM_SUMMARY.md"              = "docs/TILE_SYSTEM.md"
    "SCRIPTING_SETUP_SUMMARY.md"          = "docs/SCRIPTING_SYSTEM.md"
    "RPG_ITEMS_ORGANIZATION_SUMMARY.md"   = "docs/RPG_ITEMS_SYSTEM.md"
    "COMPLETE_SYSTEMS_SUMMARY.md"         = "docs/SYSTEMS_OVERVIEW.md"
}

$movedDocs = 0
foreach ($source in $docMappings.Keys) {
    if (Test-Path $source) {
        $dest = $docMappings[$source]
        if (-not (Test-Path $dest)) {
            Move-Item -Path $source -Destination $dest -Force
            Write-Host "  Moved: $source -> $dest" -ForegroundColor Green
            $movedDocs++
        }
        else {
            Write-Host "  Skipped (exists): $dest" -ForegroundColor Yellow
        }
    }
}

# Archive old deployment docs (keep only the master plan)
Write-Host "[3/6] Archiving old deployment documentation..." -ForegroundColor Green

$deploymentDocsToArchive = @(
    "PROJECT_CLEANUP_PLAN.md"
    "COMPLETE_DEPLOYMENT_ROADMAP.md"
)

$archivedDeploy = 0
foreach ($doc in $deploymentDocsToArchive) {
    if (Test-Path $doc) {
        Move-Item -Path $doc -Destination "$archiveDir/$doc" -Force
        Write-Host "  Archived: $doc" -ForegroundColor Green
        $archivedDeploy++
    }
}

# Clean up examples directory
Write-Host "[4/6] Cleaning up examples directory..." -ForegroundColor Green

$examplesArchive = "archive/examples"
if (-not (Test-Path $examplesArchive)) {
    New-Item -ItemType Directory -Path $examplesArchive -Force | Out-Null
}

# Archive unused ZIP files
$zipFiles = @(
    "examples/Dwarf worge.zip"
    "examples/Paladinsands.zip"
    "examples/PriestMage.zip"
    "examples/Universal Animation Library[Standard].zip"
    "examples/Universal Base Characters[Standard].zip"
    "examples/craftpix-891176-free-environment-props-3d-low-poly-models.zip"
    "examples/floating_town-hand_painted.zip"
    "examples/forest_house.zip"
    "examples/forest_house_inside.zip"
    "examples/game_ready_pirate_hunter__viking__medieval_man.zip"
    "examples/ranger.zip"
    "examples/red_Axe.zip"
    "examples/redwarrior.zip"
    "examples/truffle_man.zip"
    "examples/undead Stalker.zip"
    "examples/undead worge.zip"
    "examples/undeaddnecro.zip"
    "examples/warlassundead.zip"
)

$archivedZips = 0
foreach ($zip in $zipFiles) {
    if (Test-Path $zip) {
        $filename = Split-Path $zip -Leaf
        Move-Item -Path $zip -Destination "$examplesArchive/$filename" -Force
        Write-Host "  Archived: $zip" -ForegroundColor Green
        $archivedZips++
    }
}

# Archive old HTML examples
$htmlFiles = @(
    "examples/Grudge_Warlords_-_Ultimate_Character_Builder_v2.html",
    "examples/HIEREACHY PROFESIONS EXAMPLE.html",
    "examples/ai-character-advisor.html",
    "examples/character-progression-demo.html",
    "examples/crafting.html"
)

$archivedHtml = 0
foreach ($html in $htmlFiles) {
    if (Test-Path $html) {
        $filename = Split-Path $html -Leaf
        Move-Item -Path $html -Destination "$examplesArchive/$filename" -Force
        Write-Host "  Archived: $html" -ForegroundColor Green
        $archivedHtml++
    }
}

# Archive TheForge-main (external project)
if (Test-Path "examples/TheForge-main") {
    Move-Item -Path "examples/TheForge-main" -Destination "$examplesArchive/TheForge-main" -Force
    Write-Host "  Archived: examples/TheForge-main" -ForegroundColor Green
}

# Create documentation index
Write-Host "[5/6] Creating documentation index..." -ForegroundColor Green

# This will be created in the next step

# Generate summary report
Write-Host "[6/6] Generating cleanup report..." -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           CLEANUP SUMMARY              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  System docs moved: $movedDocs" -ForegroundColor Green
Write-Host "  Deployment docs archived: $archivedDeploy" -ForegroundColor Green
Write-Host "  ZIP files archived: $archivedZips" -ForegroundColor Green
Write-Host "  HTML files archived: $archivedHtml" -ForegroundColor Green
Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review docs/ directory" -ForegroundColor White
Write-Host "  2. Check archive/ directory" -ForegroundColor White
Write-Host "  3. Run consistency check script" -ForegroundColor White
Write-Host ""

