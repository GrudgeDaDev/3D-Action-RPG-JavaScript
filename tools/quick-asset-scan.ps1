# Quick Asset Scan
# Scans assets and examples folders for file types

Write-Host "🔍 Scanning asset directories..." -ForegroundColor Cyan
Write-Host ""

# Scan assets folder
Write-Host "ASSETS FOLDER:" -ForegroundColor Yellow
$assetsFiles = Get-ChildItem -Path "assets" -Recurse -File -ErrorAction SilentlyContinue
$assetsGrouped = $assetsFiles | Group-Object Extension | Sort-Object Count -Descending

foreach ($group in $assetsGrouped) {
    $ext = if ($group.Name) { $group.Name } else { "(no extension)" }
    Write-Host "  $ext : $($group.Count)"
}

Write-Host ""
Write-Host "Total assets files: $($assetsFiles.Count)" -ForegroundColor Green
Write-Host ""

# Scan examples folder
Write-Host "EXAMPLES FOLDER:" -ForegroundColor Yellow
$examplesFiles = Get-ChildItem -Path "examples" -Recurse -File -ErrorAction SilentlyContinue
$examplesGrouped = $examplesFiles | Group-Object Extension | Sort-Object Count -Descending

foreach ($group in $examplesGrouped) {
    $ext = if ($group.Name) { $group.Name } else { "(no extension)" }
    Write-Host "  $ext : $($group.Count)"
}

Write-Host ""
Write-Host "Total examples files: $($examplesFiles.Count)" -ForegroundColor Green
Write-Host ""

# Find files that need conversion
Write-Host "FILES NEEDING CONVERSION:" -ForegroundColor Red
$needsConversion = @('.fbx', '.obj', '.dae', '.blend', '.bmp', '.tga', '.wav')
$convertFiles = $assetsFiles + $examplesFiles | Where-Object { $needsConversion -contains $_.Extension }

if ($convertFiles.Count -gt 0) {
    foreach ($file in $convertFiles | Select-Object -First 20) {
        Write-Host "  $($file.Extension) - $($file.FullName.Replace($PWD, '.'))"
    }
    if ($convertFiles.Count -gt 20) {
        Write-Host "  ... and $($convertFiles.Count - 20) more files"
    }
} else {
    Write-Host "  None found! ✅" -ForegroundColor Green
}

Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Cyan
Write-Host "  Total files scanned: $($assetsFiles.Count + $examplesFiles.Count)"
Write-Host "  Files needing conversion: $($convertFiles.Count)"
Write-Host ""

