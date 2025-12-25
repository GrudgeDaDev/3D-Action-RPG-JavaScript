# GGE Warlords - Documentation Cleanup Script
# Moves system-specific documentation to /docs folder

Write-Host "Starting Documentation Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Define file mappings (source -> destination)
$fileMappings = @{
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

$movedCount = 0
$skippedCount = 0

foreach ($source in $fileMappings.Keys) {
    $destination = $fileMappings[$source]
    
    if (Test-Path $source) {
        try {
            Move-Item -Path $source -Destination $destination -Force
            Write-Host "[OK] Moved: $source -> $destination" -ForegroundColor Green
            $movedCount++
        }
        catch {
            Write-Host "[ERROR] Failed to move: $source" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "[SKIP] Not found: $source" -ForegroundColor Yellow
        $skippedCount++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Moved: $movedCount files" -ForegroundColor Green
Write-Host "   Skipped: $skippedCount files" -ForegroundColor Yellow
Write-Host ""
Write-Host "Documentation cleanup complete!" -ForegroundColor Green

