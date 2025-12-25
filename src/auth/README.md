# 🔐 Authentication System

## Overview

The authentication system provides role-based access control (RBAC) for the GRUDGE WARLORDS game, separating **Client** (player) and **Admin** (developer) experiences.

## Architecture

```
src/auth/
├── AuthManager.js      # Core authentication logic
├── LoginScreen.js      # Pre-lobby login UI
└── README.md          # This file
```

## Features

### ✅ Implemented

1. **Role-Based Access Control**
   - Client role: Limited to gameplay scenes
   - Admin role: Full access to all scenes + editor + admin panel

2. **Session Management**
   - LocalStorage-based session persistence
   - Auto-restore on page reload
   - Logout functionality

3. **Scene Access Control**
   - Permission checking before scene switches
   - Automatic redirection for unauthorized access
   - URL parameter validation

4. **Beautiful Login UI**
   - Animated gradient background
   - Particle effects
   - Responsive design
   - Clear role selection

### 🚧 Future Enhancements

1. **Puter.js Integration**
   - Real authentication via Puter.js
   - Cloud-based user accounts
   - OAuth support

2. **Advanced Permissions**
   - Granular scene permissions
   - Feature flags
   - Time-based access

## Usage

### Basic Usage

```javascript
import { getAuthManager } from './src/auth/AuthManager.js';

const authManager = getAuthManager();

// Check current user
const user = authManager.getCurrentUser();
console.log(user.username, user.role);

// Check permissions
if (authManager.canAccessScene('archipelagoEditor')) {
    // Load editor scene
}

// Logout
authManager.logout();
```

### Integration in game.js

```javascript
import { LoginScreen } from './src/auth/LoginScreen.js';
import { getAuthManager } from './src/auth/AuthManager.js';

// Show login screen
const loginScreen = new LoginScreen(async (userRole) => {
    console.log(`Logged in as: ${userRole}`);
    await initializeGame(config, userRole);
});
loginScreen.show();
```

## User Roles

### 🎮 Client (Player)

**Access:**
- Archipelago scene (main game)
- Character panel (Tab key)
- Game menu (ESC key)

**Restrictions:**
- No editor access
- No admin panel
- No debug tools
- No lobby scene

**Starting Scene:** `archipelago`

### 🔧 Admin (Developer)

**Access:**
- All scenes (lobby, archipelago, editor, etc.)
- Admin panel (`/admin/index.html`)
- Editor scene (`archipelagoEditor`)
- Debug tools (Performance Monitor, Scene Navigator)
- All client features

**Starting Scene:** `lobby`

**Additional Features:**
- Performance monitoring (Press "P")
- Scene navigator (Ctrl+1-9)
- FPS counter
- Enhanced logging

## Scene Permissions

Defined in `config/scenes.json`:

```json
{
  "scenes": {
    "lobby": {
      "enabled": true,
      "showInLobby": true,
      "permissions": ["admin"]
    },
    "archipelago": {
      "enabled": true,
      "showInLobby": true,
      "permissions": ["client", "admin"]
    },
    "archipelagoEditor": {
      "enabled": true,
      "showInLobby": false,
      "permissions": ["admin"]
    }
  }
}
```

## Session Storage

Sessions are stored in `localStorage`:

```javascript
{
  "grudge_auth_session": {
    "user": {
      "id": "client_1234567890",
      "username": "Player",
      "role": "client"
    },
    "timestamp": 1234567890123
  }
}
```

## API Reference

### AuthManager

#### Methods

- `loginAsClient()` - Login as client/player
- `loginAsAdmin()` - Login as admin/developer
- `logout()` - Clear session and reload page
- `getCurrentUser()` - Get current user object
- `getUserRole()` - Get current user role
- `isAuthenticated()` - Check if user is logged in
- `canAccessScene(sceneName)` - Check scene permissions
- `restoreSession()` - Restore session from localStorage

### LoginScreen

#### Constructor

```javascript
new LoginScreen(onLoginComplete)
```

**Parameters:**
- `onLoginComplete(userRole)` - Callback when login completes

#### Methods

- `show()` - Display login screen
- `hide()` - Hide login screen

## Testing

### Test as Client

1. Refresh page
2. Click "Login as Player"
3. Should start in Archipelago scene
4. Try accessing lobby → Should be denied

### Test as Admin

1. Refresh page
2. Click "Login as Admin"
3. Should start in Lobby scene
4. All scenes should be accessible
5. Debug tools should be visible

### Test Session Persistence

1. Login as any role
2. Refresh page
3. Should auto-login without showing login screen

## Troubleshooting

### Login screen doesn't appear

- Check console for errors
- Verify `LoginScreen.js` is imported in `game.js`
- Check if session exists in localStorage

### Can't access certain scenes

- Check `config/scenes.json` permissions
- Verify user role with `authManager.getUserRole()`
- Check console for permission denied messages

### Session not persisting

- Check browser localStorage is enabled
- Verify no errors in `AuthManager.saveSession()`
- Check browser console for storage errors

## Future: Puter.js Integration

When Puter.js is integrated:

1. Replace mock login with real Puter.js auth
2. Store user data in Puter.js cloud
3. Add OAuth providers (Google, GitHub, etc.)
4. Implement real user accounts
5. Add profile management

```javascript
// Future implementation
import puter from 'puter';

async loginWithPuter() {
    const user = await puter.auth.signIn();
    // Store user data
}
```

## Security Notes

⚠️ **Current Implementation:**
- Client-side only (no server validation)
- LocalStorage-based (can be manipulated)
- For development/demo purposes

🔒 **Production Requirements:**
- Server-side authentication
- JWT tokens
- Secure session management
- Rate limiting
- HTTPS only

