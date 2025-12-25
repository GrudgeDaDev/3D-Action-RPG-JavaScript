# PowerShell Script to Organize Ultimate RPG Items Bundle
# Copies GLB models from examples folder to proper asset directories

$sourceDir = "examples/Ultimate RPG Items Bundle-glb"
$baseDir = "assets"

# Create directory structure
$directories = @(
    "$baseDir/characters/weapons",
    "$baseDir/characters/armor",
    "$baseDir/items/consumables",
    "$baseDir/items/resources",
    "$baseDir/items/accessories",
    "$baseDir/items/currency",
    "$baseDir/items/keys",
    "$baseDir/env/props/containers",
    "$baseDir/env/props/decorative",
    "$baseDir/env/props/interactive"
)

Write-Host "Creating directory structure..." -ForegroundColor Cyan
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Green
    }
}

# Define file mappings (source -> destination)
$fileMappings = @{
    # Weapons
    "Axe Double.glb" = "$baseDir/characters/weapons/Axe Double.glb"
    "Axe Small.glb" = "$baseDir/characters/weapons/Axe Small.glb"
    "Claymore.glb" = "$baseDir/characters/weapons/Claymore.glb"
    "Knife.glb" = "$baseDir/characters/weapons/Knife.glb"
    "Scythe.glb" = "$baseDir/characters/weapons/Scythe.glb"
    "Spear.glb" = "$baseDir/characters/weapons/Spear.glb"
    "Sword.glb" = "$baseDir/characters/weapons/Sword.glb"
    "Sword-9lLmH8Et4K.glb" = "$baseDir/characters/weapons/Sword Variant.glb"
    "Arrow.glb" = "$baseDir/characters/weapons/Arrow.glb"
    
    # Shields (part of armor/defense)
    "Shield Celtic Golden.glb" = "$baseDir/characters/armor/Shield Celtic Golden.glb"
    "Shield Heater.glb" = "$baseDir/characters/armor/Shield Heater.glb"
    "Shield Heater-xoHSnOjsBG.glb" = "$baseDir/characters/armor/Shield Heater Variant.glb"
    "Shield Round.glb" = "$baseDir/characters/armor/Shield Round.glb"
    "Shield Round-lWajrVXcnA.glb" = "$baseDir/characters/armor/Shield Round Variant.glb"
    "Glove.glb" = "$baseDir/characters/armor/Glove.glb"
    
    # Consumables
    "Potion Bottle.glb" = "$baseDir/items/consumables/Potion Bottle.glb"
    "Potion Bottle-WJxYta4Z96.glb" = "$baseDir/items/consumables/Potion Bottle Variant.glb"
    
    # Resources
    "Mineral.glb" = "$baseDir/items/resources/Mineral.glb"
    "Gold Ingots.glb" = "$baseDir/items/resources/Gold Ingots.glb"
    "Bone.glb" = "$baseDir/items/resources/Bone.glb"
    "Fish Bone.glb" = "$baseDir/items/resources/Fish Bone.glb"
    "Skull.glb" = "$baseDir/items/resources/Skull.glb"
    "Skull-ExZmhOIjka.glb" = "$baseDir/items/resources/Skull Variant.glb"
    
    # Accessories
    "Crown.glb" = "$baseDir/items/accessories/Crown.glb"
    "Necklace.glb" = "$baseDir/items/accessories/Necklace.glb"
    "Necklace-Jvhs8DCNDZ.glb" = "$baseDir/items/accessories/Necklace Variant.glb"
    "Chalice.glb" = "$baseDir/items/accessories/Chalice.glb"
    
    # Currency
    "Coin.glb" = "$baseDir/items/currency/Coin.glb"
    "Coin Pouch.glb" = "$baseDir/items/currency/Coin Pouch.glb"
    "Skull Coin.glb" = "$baseDir/items/currency/Skull Coin.glb"
    "Star Coin.glb" = "$baseDir/items/currency/Star Coin.glb"
    
    # Keys
    "Key.glb" = "$baseDir/items/keys/Key.glb"
    "Key-MUl40QpEvv.glb" = "$baseDir/items/keys/Key Bronze.glb"
    "Key-bg6e1lfNsO.glb" = "$baseDir/items/keys/Key Silver.glb"
    "Key-h5nke04hRD.glb" = "$baseDir/items/keys/Key Gold.glb"
    
    # Containers
    "Chest.glb" = "$baseDir/env/props/containers/Chest.glb"
    "Backpack.glb" = "$baseDir/env/props/containers/Backpack.glb"
    "Bag.glb" = "$baseDir/env/props/containers/Bag.glb"
    
    # Interactive Props
    "Book.glb" = "$baseDir/env/props/interactive/Book.glb"
    "Book-LC0w7VI75u.glb" = "$baseDir/env/props/interactive/Book Red.glb"
    "Book-h3Wh4fxSQX.glb" = "$baseDir/env/props/interactive/Book Blue.glb"
    "Book Open.glb" = "$baseDir/env/props/interactive/Book Open.glb"
    "Open Book.glb" = "$baseDir/env/props/interactive/Open Book Alt.glb"
    "Open Book-1A07aI9j2d.glb" = "$baseDir/env/props/interactive/Open Book Variant 1.glb"
    "Open Book-JEDMpG0UIR.glb" = "$baseDir/env/props/interactive/Open Book Variant 2.glb"
    "Scroll.glb" = "$baseDir/env/props/interactive/Scroll.glb"
    "Parchment.glb" = "$baseDir/env/props/interactive/Parchment.glb"
    "Padlock.glb" = "$baseDir/env/props/interactive/Padlock.glb"
    
    # Decorative
    "Snowflake.glb" = "$baseDir/env/props/decorative/Snowflake.glb"
}

Write-Host "`nCopying files..." -ForegroundColor Cyan
$copiedCount = 0
$skippedCount = 0

foreach ($file in $fileMappings.Keys) {
    $source = Join-Path $sourceDir $file
    $dest = $fileMappings[$file]
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "  Copied: $file -> $dest" -ForegroundColor Green
        $copiedCount++
    } else {
        Write-Host "  Skipped: $file (not found)" -ForegroundColor Yellow
        $skippedCount++
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "  Files copied: $copiedCount" -ForegroundColor Green
Write-Host "  Files skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "`nOrganization complete!" -ForegroundColor Green

