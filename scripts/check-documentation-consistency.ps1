# GGE Warlords - Documentation Consistency Checker
# Ensures all markdown files are consistent and reference GRUDA GEAR/GRUDGE C# properly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Documentation Consistency Check       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define required terms that should be consistent
$requiredTerms = @{
    "GGE Warlords" = @()
    "GRUDA GEAR" = @()
    "GRUDGE" = @()
    "BabylonJS" = @()
    "Puter" = @()
    "Colyseus" = @()
}

# Define C# script references that should be documented
$csharpScripts = @(
    "MountSkillBar.cs"
    "MountSkills.cs"
    "UIMountSkillBar.cs"
)

# Check all markdown files in root
Write-Host "[1/4] Checking root markdown files..." -ForegroundColor Green
$rootMdFiles = Get-ChildItem -Path . -Filter "*.md" -File

$rootResults = @()
foreach ($file in $rootMdFiles) {
    $content = Get-Content $file.FullName -Raw
    $result = @{
        File = $file.Name
        HasGGEWarlords = $content -match "GGE Warlords"
        HasGRUDAGEAR = $content -match "GRUDA GEAR"
        HasGRUDGE = $content -match "GRUDGE"
        HasCSharpRef = $false
    }
    
    foreach ($script in $csharpScripts) {
        if ($content -match $script) {
            $result.HasCSharpRef = $true
            break
        }
    }
    
    $rootResults += New-Object PSObject -Property $result
}

# Check all markdown files in docs
Write-Host "[2/4] Checking docs/ markdown files..." -ForegroundColor Green
$docsMdFiles = Get-ChildItem -Path "docs" -Filter "*.md" -File -Recurse

$docsResults = @()
foreach ($file in $docsMdFiles) {
    $content = Get-Content $file.FullName -Raw
    $result = @{
        File = $file.Name
        Path = $file.DirectoryName
        HasGGEWarlords = $content -match "GGE Warlords"
        HasGRUDAGEAR = $content -match "GRUDA GEAR"
        HasGRUDGE = $content -match "GRUDGE"
        HasCSharpRef = $false
        LineCount = ($content -split "`n").Count
    }
    
    foreach ($script in $csharpScripts) {
        if ($content -match $script) {
            $result.HasCSharpRef = $true
            break
        }
    }
    
    $docsResults += New-Object PSObject -Property $result
}

# Check examples directory for GRUDA GEAR references
Write-Host "[3/4] Checking examples/ for GRUDA GEAR files..." -ForegroundColor Green
$grudaGearFiles = Get-ChildItem -Path "examples" -Filter "*GRUDA*" -File

Write-Host ""
Write-Host "GRUDA GEAR Files Found:" -ForegroundColor Yellow
foreach ($file in $grudaGearFiles) {
    Write-Host "  - $($file.Name)" -ForegroundColor White
}

# Check for C# scripts in examples
$csharpFiles = Get-ChildItem -Path "examples" -Filter "*.cs" -File

Write-Host ""
Write-Host "C# Script Files Found:" -ForegroundColor Yellow
foreach ($file in $csharpFiles) {
    Write-Host "  - $($file.Name)" -ForegroundColor White
}

# Generate report
Write-Host ""
Write-Host "[4/4] Generating consistency report..." -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         CONSISTENCY REPORT             " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Root Documentation Files:" -ForegroundColor Yellow
Write-Host "  Total files: $($rootMdFiles.Count)" -ForegroundColor White
Write-Host "  Files with 'GGE Warlords': $(($rootResults | Where-Object {$_.HasGGEWarlords}).Count)" -ForegroundColor White
Write-Host "  Files with 'GRUDA GEAR': $(($rootResults | Where-Object {$_.HasGRUDAGEAR}).Count)" -ForegroundColor White
Write-Host "  Files with C# references: $(($rootResults | Where-Object {$_.HasCSharpRef}).Count)" -ForegroundColor White
Write-Host ""

Write-Host "Docs/ Documentation Files:" -ForegroundColor Yellow
Write-Host "  Total files: $($docsMdFiles.Count)" -ForegroundColor White
Write-Host "  Files with 'GGE Warlords': $(($docsResults | Where-Object {$_.HasGGEWarlords}).Count)" -ForegroundColor White
Write-Host "  Files with 'GRUDA GEAR': $(($docsResults | Where-Object {$_.HasGRUDAGEAR}).Count)" -ForegroundColor White
Write-Host "  Files with C# references: $(($docsResults | Where-Object {$_.HasCSharpRef}).Count)" -ForegroundColor White
Write-Host ""

Write-Host "Examples Directory:" -ForegroundColor Yellow
Write-Host "  GRUDA GEAR files: $($grudaGearFiles.Count)" -ForegroundColor White
Write-Host "  C# script files: $($csharpFiles.Count)" -ForegroundColor White
Write-Host ""

# Check for files missing key references
Write-Host "Files Missing 'GGE Warlords' Reference:" -ForegroundColor Red
$missingGGE = $docsResults | Where-Object {-not $_.HasGGEWarlords}
if ($missingGGE.Count -eq 0) {
    Write-Host "  None - All files reference GGE Warlords!" -ForegroundColor Green
} else {
    foreach ($file in $missingGGE) {
        Write-Host "  - $($file.File)" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "Recommendations:" -ForegroundColor Cyan
Write-Host "  1. Ensure all docs reference 'GGE Warlords' in title/intro" -ForegroundColor White
Write-Host "  2. Document GRUDA GEAR integration in relevant files" -ForegroundColor White
Write-Host "  3. Reference C# scripts in mount/skill system docs" -ForegroundColor White
Write-Host "  4. Create GRUDA_GEAR_INTEGRATION.md if missing" -ForegroundColor White
Write-Host ""
Write-Host "Consistency check complete!" -ForegroundColor Green
Write-Host ""

