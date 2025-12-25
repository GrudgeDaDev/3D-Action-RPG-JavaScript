/**
 * AuthManager.js
 * Handles authentication and user role management
 * Integrates with Puter.js for future auth implementation
 */

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null; // 'client' or 'admin'
        this.isAuthenticated = false;
        this.puterAvailable = false;
        
        // Check if Puter.js is available
        this.checkPuterAvailability();
    }

    /**
     * Check if Puter.js SDK is available
     */
    checkPuterAvailability() {
        this.puterAvailable = typeof window.puter !== 'undefined';
        if (this.puterAvailable) {
            console.log('✅ Puter.js SDK detected');
        } else {
            console.log('⚠️ Puter.js SDK not available - using local auth');
        }
    }

    /**
     * Login as Client (regular player)
     */
    async loginAsClient(username = 'Player') {
        console.log('🎮 Logging in as Client...');
        
        this.currentUser = {
            username: username,
            role: 'client',
            loginTime: new Date().toISOString(),
            permissions: {
                playGame: true,
                accessScenes: ['archipelago', 'outdoor', 'night', 'day', 'room', 'town', 'inn'],
                accessAdmin: false,
                accessEditor: false
            }
        };
        
        this.userRole = 'client';
        this.isAuthenticated = true;
        
        // Save to localStorage
        this.saveSession();
        
        console.log('✅ Logged in as Client:', this.currentUser.username);
        return this.currentUser;
    }

    /**
     * Login as Admin
     */
    async loginAsAdmin(username = 'Admin') {
        console.log('🔧 Logging in as Admin...');
        
        this.currentUser = {
            username: username,
            role: 'admin',
            loginTime: new Date().toISOString(),
            permissions: {
                playGame: true,
                accessScenes: ['lobby', 'archipelago', 'archipelagoEditor', 'outdoor', 'night', 'day', 'room', 'town', 'inn', 'underground', 'builder'],
                accessAdmin: true,
                accessEditor: true,
                modifyConfig: true,
                manageUsers: true,
                debugMode: true
            }
        };
        
        this.userRole = 'admin';
        this.isAuthenticated = true;
        
        // Save to localStorage
        this.saveSession();
        
        console.log('✅ Logged in as Admin:', this.currentUser.username);
        return this.currentUser;
    }

    /**
     * Login with Puter.js (future implementation)
     */
    async loginWithPuter() {
        if (!this.puterAvailable) {
            console.warn('⚠️ Puter.js not available');
            return null;
        }

        try {
            console.log('🔐 Authenticating with Puter.js...');
            
            // Check if already signed in
            if (window.puter.auth.isSignedIn()) {
                const user = await window.puter.auth.getUser();
                console.log('✅ Already signed in:', user.username);
                
                // Determine role (could be from Puter user metadata)
                const role = user.metadata?.role || 'client';
                
                if (role === 'admin') {
                    return await this.loginAsAdmin(user.username);
                } else {
                    return await this.loginAsClient(user.username);
                }
            }
            
            // Sign in with Puter
            await window.puter.auth.signIn();
            const user = await window.puter.auth.getUser();
            
            // Determine role
            const role = user.metadata?.role || 'client';
            
            if (role === 'admin') {
                return await this.loginAsAdmin(user.username);
            } else {
                return await this.loginAsClient(user.username);
            }
            
        } catch (error) {
            console.error('❌ Puter auth error:', error);
            return null;
        }
    }

    /**
     * Logout
     */
    logout() {
        console.log('👋 Logging out...');
        
        this.currentUser = null;
        this.userRole = null;
        this.isAuthenticated = false;
        
        // Clear localStorage
        localStorage.removeItem('grudge_auth_session');
        
        // Puter logout if available
        if (this.puterAvailable && window.puter.auth.isSignedIn()) {
            window.puter.auth.signOut();
        }
        
        console.log('✅ Logged out');
    }

    /**
     * Check if user has permission
     */
    hasPermission(permission) {
        if (!this.isAuthenticated || !this.currentUser) return false;
        return this.currentUser.permissions[permission] === true;
    }

    /**
     * Check if user can access scene
     */
    canAccessScene(sceneName) {
        if (!this.isAuthenticated || !this.currentUser) return false;
        return this.currentUser.permissions.accessScenes.includes(sceneName);
    }

    /**
     * Save session to localStorage
     */
    saveSession() {
        const session = {
            user: this.currentUser,
            role: this.userRole,
            timestamp: Date.now()
        };
        localStorage.setItem('grudge_auth_session', JSON.stringify(session));
    }

    /**
     * Restore session from localStorage
     */
    restoreSession() {
        const saved = localStorage.getItem('grudge_auth_session');
        if (!saved) return false;

        try {
            const session = JSON.parse(saved);
            
            // Check if session is less than 24 hours old
            const age = Date.now() - session.timestamp;
            if (age > 24 * 60 * 60 * 1000) {
                console.log('⚠️ Session expired');
                this.logout();
                return false;
            }

            this.currentUser = session.user;
            this.userRole = session.role;
            this.isAuthenticated = true;

            console.log('✅ Session restored:', this.currentUser.username, `(${this.userRole})`);
            return true;
        } catch (error) {
            console.error('❌ Failed to restore session:', error);
            return false;
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get user role
     */
    getUserRole() {
        return this.userRole;
    }

    /**
     * Is authenticated
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Singleton instance
let authManagerInstance = null;

export function getAuthManager() {
    if (!authManagerInstance) {
        authManagerInstance = new AuthManager();
    }
    return authManagerInstance;
}

