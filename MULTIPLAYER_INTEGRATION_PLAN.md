# 🎮 GGE Warlords - Multiplayer Integration Plan

## 📋 Overview

This document outlines the integration of **Colyseus** multiplayer framework with **Puter Cloud** deployment for GGE Warlords.

**Architecture**: Puter-hosted clients → Colyseus server → Synchronized game state

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🌐 Puter Cloud (Frontend)                                  │
│     └─ https://gge-warlords.puter.site                      │
│        ├─ BabylonJS 3D Client                               │
│        ├─ Colyseus Client SDK                               │
│        ├─ GrudaChain Auth                                   │
│        └─ Puter.js Integration                              │
│                                                              │
│  🔌 WebSocket Connection                                    │
│     └─ wss://your-colyseus-server.com                       │
│                                                              │
│  🎮 Colyseus Server (Backend)                               │
│     └─ Deployed on: Railway / Render / Heroku              │
│        ├─ Game Room Management                              │
│        ├─ State Synchronization                             │
│        ├─ Player Management                                 │
│        └─ Combat & Interaction Logic                        │
│                                                              │
│  🗄️ Persistent Data (Puter KV)                              │
│     └─ Player profiles, inventory, quests                   │
│        (Non-realtime data)                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Why Colyseus?

### ✅ Perfect for GGE Warlords

1. **BabylonJS Integration**: Official BabylonJS support
2. **TypeScript**: Full TypeScript support (matches our stack)
3. **State Synchronization**: Automatic state sync between clients
4. **Room-Based**: Perfect for instanced dungeons/zones
5. **Scalable**: Handles 100+ concurrent players per room
6. **Open Source**: Free and customizable

### 🆚 Alternatives Considered

| Feature | Colyseus | Photon | PlayFab | Socket.io |
|---------|----------|--------|---------|-----------|
| BabylonJS Support | ✅ Official | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual |
| TypeScript | ✅ Native | ❌ No | ⚠️ Partial | ✅ Yes |
| State Sync | ✅ Auto | ✅ Auto | ⚠️ Manual | ❌ Manual |
| Cost | ✅ Free | ❌ Paid | ❌ Paid | ✅ Free |
| Learning Curve | ✅ Easy | ⚠️ Medium | ❌ Hard | ✅ Easy |

**Winner**: Colyseus ✅

---

## 📦 Implementation Plan

### Phase 1: Setup Colyseus Server

#### 1.1 Create Server Project

```bash
# Create server directory
mkdir gge-server
cd gge-server

# Initialize project
npm init -y

# Install dependencies
npm install colyseus @colyseus/monitor @colyseus/social express cors
npm install -D typescript @types/node ts-node-dev

# Initialize TypeScript
npx tsc --init
```

#### 1.2 Server Structure

```
gge-server/
├── src/
│   ├── rooms/
│   │   ├── GameRoom.ts          # Main game room
│   │   ├── DungeonRoom.ts       # Dungeon instances
│   │   └── PvPArenaRoom.ts      # PvP arena
│   ├── schema/
│   │   ├── GameState.ts         # Game state schema
│   │   ├── Player.ts            # Player schema
│   │   └── Entity.ts            # Entity schema
│   ├── logic/
│   │   ├── CombatSystem.ts      # Combat logic
│   │   ├── MovementSystem.ts    # Movement validation
│   │   └── LootSystem.ts        # Loot distribution
│   └── index.ts                 # Server entry point
├── package.json
└── tsconfig.json
```

#### 1.3 Basic Server Setup

File: `src/index.ts`

```typescript
import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { GameRoom } from "./rooms/GameRoom";

const app = express();
app.use(cors());
app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
  express: app,
});

// Define game rooms
gameServer.define("game_room", GameRoom);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", rooms: gameServer.rooms.size });
});

const PORT = process.env.PORT || 2567;
gameServer.listen(PORT);
console.log(`🎮 Colyseus server listening on port ${PORT}`);
```

---

### Phase 2: Define Game State Schema

#### 2.1 Player Schema

File: `src/schema/Player.ts`

```typescript
import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") sessionId: string;
  @type("string") userId: string;
  @type("string") username: string;
  @type("string") class: string;
  
  // Position
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  
  // Rotation
  @type("number") rotationY: number = 0;
  
  // Stats
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("number") mana: number = 100;
  @type("number") maxMana: number = 100;
  @type("number") level: number = 1;
  
  // State
  @type("string") state: string = "idle"; // idle, moving, attacking, dead
  @type("boolean") isAlive: boolean = true;
}
```

#### 2.2 Game State Schema

File: `src/schema/GameState.ts`

```typescript
import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") serverTime: number = 0;
}
```

---

### Phase 3: Implement Game Room

File: `src/rooms/GameRoom.ts`

```typescript
import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState";
import { Player } from "../schema/Player";

export class GameRoom extends Room<GameState> {
  maxClients = 50;

  onCreate(options: any) {
    this.setState(new GameState());
    
    // Update server time every second
    this.setSimulationInterval((deltaTime) => {
      this.state.serverTime += deltaTime;
    }, 1000);

    // Handle player movement
    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.z = data.z;
        player.rotationY = data.rotationY;
        player.state = "moving";
      }
    });

    // Handle player attack
    this.onMessage("attack", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.state = "attacking";
        // Broadcast attack to other players
        this.broadcast("player_attack", {
          playerId: client.sessionId,
          targetId: data.targetId
        }, { except: client });
      }
    });

    console.log("GameRoom created!");
  }

  onJoin(client: Client, options: any) {
    console.log(`${client.sessionId} joined!`);

    const player = new Player();
    player.sessionId = client.sessionId;
    player.userId = options.userId || "guest";
    player.username = options.username || "Player";
    player.class = options.class || "warrior";

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`${client.sessionId} left!`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("GameRoom disposed!");
  }
}
```

---

## 🔗 Phase 4: Client Integration

### 4.1 Install Colyseus Client

```bash
cd client
npm install colyseus.js
```

### 4.2 Create Multiplayer Manager

File: `src/multiplayer/MultiplayerManager.js`

```javascript
import * as Colyseus from "colyseus.js";

export class MultiplayerManager {
  constructor(serverUrl) {
    this.client = new Colyseus.Client(serverUrl);
    this.room = null;
    this.players = new Map();
  }

  async connect(userId, username, playerClass) {
    try {
      this.room = await this.client.joinOrCreate("game_room", {
        userId,
        username,
        class: playerClass
      });

      console.log("✅ Connected to multiplayer server!");
      this.setupListeners();
      return this.room;
    } catch (error) {
      console.error("❌ Failed to connect:", error);
      throw error;
    }
  }

  setupListeners() {
    // Listen for player additions
    this.room.state.players.onAdd((player, sessionId) => {
      console.log(`Player ${player.username} joined`);
      this.onPlayerAdded(player, sessionId);
    });

    // Listen for player removals
    this.room.state.players.onRemove((player, sessionId) => {
      console.log(`Player ${player.username} left`);
      this.onPlayerRemoved(sessionId);
    });

    // Listen for state changes
    this.room.onStateChange((state) => {
      // State updated
    });
  }

  sendMovement(x, y, z, rotationY) {
    if (this.room) {
      this.room.send("move", { x, y, z, rotationY });
    }
  }

  sendAttack(targetId) {
    if (this.room) {
      this.room.send("attack", { targetId });
    }
  }

  disconnect() {
    if (this.room) {
      this.room.leave();
    }
  }

  // Override these in your game
  onPlayerAdded(player, sessionId) {}
  onPlayerRemoved(sessionId) {}
}
```

---

## 🚀 Deployment Options

### Option 1: Railway (Recommended)

**Pros**: Free tier, easy deployment, auto-scaling
**Cost**: Free for hobby projects

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Option 2: Render

**Pros**: Free tier, simple setup
**Cost**: Free for basic usage

### Option 3: Heroku

**Pros**: Well-documented, reliable
**Cost**: $7/month minimum

---

## 📊 Data Flow

### Realtime Data (Colyseus)
- Player positions
- Combat actions
- Chat messages
- Loot drops

### Persistent Data (Puter KV)
- Player profiles
- Inventory
- Quests
- Achievements

---

**Next Steps**: Implement Phase 1 - Setup Colyseus Server

