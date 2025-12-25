# AI Integration with Gemini & Puter

## Overview

This project integrates Google's Gemini AI via Puter.com to provide intelligent, dynamic gameplay features for the Grudge Warlords 3D Action RPG.

## Features

### 🤖 AI-Powered Gameplay

1. **Dynamic NPC Dialogue**
   - Context-aware conversations
   - Personality-driven responses
   - Quest-related interactions

2. **Procedural Quest Generation**
   - Level-appropriate challenges
   - Unique objectives and rewards
   - Story-driven narratives

3. **Build Analysis & Recommendations**
   - Character optimization suggestions
   - Synergy detection
   - Meta build identification

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@google/generative-ai` - Gemini AI SDK
- All other project dependencies

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### 3. Configure Environment

Create `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
NODE_ENV=development
```

**Important**: Never commit `.env` to version control!

## Usage

### Basic Integration

```javascript
import { GeminiIntegration } from './src/ai/GeminiIntegration.js';

// Initialize
const gemini = new GeminiIntegration();
await gemini.initialize(process.env.GEMINI_API_KEY);

// Generate NPC dialogue
const dialogue = await gemini.generateNPCDialogue(
    'Blacksmith',
    'Player enters forge with broken sword'
);
console.log(dialogue);
// "Ah, another warrior with a shattered blade! 
//  Bring it here, I'll forge you something worthy of legend."

// Generate quest
const quest = await gemini.generateQuestSuggestion(5, ['quest_1', 'quest_2']);
console.log(quest);
// {
//   title: "The Cursed Mines",
//   description: "Investigate strange noises from the abandoned mines",
//   objectives: ["Explore the mines", "Defeat the corrupted guardian"],
//   rewards: { xp: 500, gold: 200 }
// }

// Analyze build
const analysis = await gemini.analyzeBuild(
    { strength: 20, intellect: 5, vitality: 15 },
    'Warrior'
);
console.log(analysis);
// "Your Warrior build excels in physical combat with high Strength. 
//  Consider boosting Vitality for survivability in longer fights."
```

### Using Puter (Recommended for Deployment)

When deployed on Puter, the integration automatically uses Puter's AI:

```javascript
// No API key needed!
const gemini = new GeminiIntegration();
await gemini.initialize(); // Uses Puter AI automatically

// All methods work the same
const dialogue = await gemini.generateNPCDialogue('Merchant', 'Player browsing items');
```

## Puter Deployment

### Prerequisites

1. **Puter Account**: [Sign up](https://puter.com)
2. **Puter CLI**: `npm install -g @puter/cli`

### Deployment Steps

#### Option 1: Using Deployment Script (Recommended)

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Option 2: Manual Deployment

```bash
# 1. Login to Puter
puter login

# 2. Set secrets
puter secret set GEMINI_API_KEY your_key_here

# 3. Deploy
puter deploy
```

### Configuration

The `puter.json` file configures:

```json
{
  "permissions": ["ai", "storage", "network"],
  "ai": {
    "enabled": true,
    "models": ["gemini-2.0-flash-exp", "gpt-5-nano", "claude-sonnet-4"]
  }
}
```

## API Reference

### GeminiIntegration Class

#### `initialize(apiKey?)`
Initialize the AI integration.
- **apiKey** (optional): Gemini API key. Not needed when using Puter.
- **Returns**: `Promise<boolean>` - Success status

#### `generateNPCDialogue(npcName, context)`
Generate contextual NPC dialogue.
- **npcName**: Name of the NPC
- **context**: Current game situation
- **Returns**: `Promise<string>` - Generated dialogue

#### `generateQuestSuggestion(playerLevel, completedQuests)`
Generate a level-appropriate quest.
- **playerLevel**: Current player level
- **completedQuests**: Array of completed quest IDs
- **Returns**: `Promise<Object>` - Quest data

#### `analyzeBuild(attributes, className)`
Analyze character build and provide suggestions.
- **attributes**: Object with attribute values
- **className**: Player's class
- **Returns**: `Promise<string>` - Build analysis

## Best Practices

### 1. Error Handling

Always handle AI failures gracefully:

```javascript
try {
    const dialogue = await gemini.generateNPCDialogue(npc, context);
} catch (error) {
    console.error('AI failed:', error);
    // Use fallback dialogue
    const dialogue = `Hello, traveler. I am ${npc}.`;
}
```

### 2. Rate Limiting

Implement caching to avoid excessive API calls:

```javascript
const dialogueCache = new Map();

async function getCachedDialogue(npc, context) {
    const key = `${npc}:${context}`;
    if (dialogueCache.has(key)) {
        return dialogueCache.get(key);
    }
    
    const dialogue = await gemini.generateNPCDialogue(npc, context);
    dialogueCache.set(key, dialogue);
    return dialogue;
}
```

### 3. User Privacy

- Never send personal data to AI
- Only send game-related context
- Follow Puter's privacy guidelines

## Troubleshooting

### "API key not found"
- Check `.env` file exists
- Verify `GEMINI_API_KEY` is set
- Ensure `.env` is loaded before initialization

### "Rate limit exceeded"
- Implement caching (see Best Practices)
- Use Puter's User Pays Model
- Reduce AI call frequency

### "Puter not defined"
- Ensure `<script src="https://js.puter.com/v2/"></script>` is loaded
- Check browser console for errors
- Verify Puter permissions in `puter.json`

## Resources

- [Puter AI Documentation](https://developer.puter.com/AI/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Puter Deployment Guide](./PUTER_DEPLOYMENT_GUIDE.md)
- [Character Progression System](./docs/CHARACTER_PROGRESSION_SYSTEM.md)

## License

MIT License - See LICENSE file for details

---

**Attribution**: Powered by [Puter](https://developer.puter.com)

