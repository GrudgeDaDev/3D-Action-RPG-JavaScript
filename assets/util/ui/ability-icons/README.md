# Ability Icons

This directory contains 2D sprite icons for abilities used in the action bar.

## Icon Specifications

- **Size**: 64x64 pixels (recommended)
- **Format**: PNG with transparency
- **Style**: Consistent art style across all icons
- **Background**: Transparent or circular background

## Icon Files

| Ability | Icon File | Hotkey | Description |
|---------|-----------|--------|-------------|
| Slash | `slash-icon.png` | 1 | Basic melee slash attack |
| Charge Attack | `charge-icon.png` | 2 | Dash to target and attack |
| Fireball | `fireball-icon.png` | 3 | Ranged fire spell |
| Attack 2 | `attack2-icon.png` | 4 | Secondary attack |
| Combo | `combo-icon.png` | 5 | Combo attack sequence |
| Dash | `dash-icon.png` | E | Quick dash ability |

## Creating Icons

### Option 1: Use Emoji/Unicode (Temporary)
For quick prototyping, you can use emoji as icons:
- ⚔️ Slash
- 🏃⚔️ Charge Attack
- 🔥 Fireball
- ⚡ Attack 2
- 🌀 Combo
- ⚡ Dash

### Option 2: Generate with CSS
Create simple geometric icons with CSS/Canvas:
```javascript
// See icon-generator.js for examples
```

### Option 3: Use Icon Libraries
- Font Awesome
- Game Icons (game-icons.net)
- Custom sprite sheets

### Option 4: Create Custom Icons
Use tools like:
- GIMP (free)
- Photoshop
- Aseprite (pixel art)
- Inkscape (vector)

## Icon States

Each icon should support these states:
- **Normal**: Default appearance
- **Hover**: Highlighted when mouse over
- **Active**: Currently being used
- **Cooldown**: Grayed out with timer overlay
- **Disabled**: Not enough resources or out of range

## File Naming Convention

```
{ability-name}-icon.png          # Normal state
{ability-name}-icon-hover.png    # Hover state (optional)
{ability-name}-icon-active.png   # Active state (optional)
```

## Usage in Code

```javascript
const abilityIcon = {
    name: 'Slash',
    iconPath: './assets/util/ui/ability-icons/slash-icon.png',
    hotkey: '1',
    cooldown: 1000
};
```

## Placeholder Icons

Until custom icons are created, the system will use:
1. Emoji characters (rendered as text)
2. CSS-generated geometric shapes
3. Colored squares with letters

## Integration

Icons are loaded by the ActionBar system:
```javascript
import { ActionBar } from './src/ui/ActionBar.js';

const actionBar = new ActionBar();
actionBar.addAbility(slashAbility, './assets/util/ui/ability-icons/slash-icon.png', '1');
```

