/**
 * GrudaChain Authentication System
 * Integrates Puter.js authentication with custom game profile management
 *
 * Features:
 * - Puter account integration
 * - Custom GrudaChain profiles
 * - KV-based data persistence
 * - Inventory, quests, achievements tracking
 * - Leaderboard integration
 */

export class GrudaChainAuth {
  constructor() {
    this.user = null;
    this.grudaProfile = null;
    this.isPuterAvailable = typeof puter !== "undefined";
  }

  /**
   * Initialize authentication system
   */
  async initialize() {
    if (!this.isPuterAvailable) {
      console.warn("⚠️ Puter not available - using local storage fallback");
      return this.initializeLocalFallback();
    }

    try {
      // Check if user is already signed in
      if (await puter.auth.isSignedIn()) {
        this.user = await puter.auth.getUser();
        await this.loadGrudaProfile();
        console.log(
          `✅ GrudaChain initialized for user: ${this.user.username}`
        );
      } else {
        console.log("ℹ️ No user signed in");
      }
    } catch (error) {
      console.error("❌ GrudaChain initialization error:", error);
      return this.initializeLocalFallback();
    }
  }

  /**
   * Sign in with Puter
   */
  async signIn() {
    if (!this.isPuterAvailable) {
      return this.signInLocalFallback();
    }

    try {
      // Puter handles the entire auth flow (popup/redirect)
      await puter.auth.signIn();
      this.user = await puter.auth.getUser();

      // Create or load GrudaChain profile
      await this.loadGrudaProfile();

      console.log(`✅ Signed in as: ${this.user.username}`);
      return this.grudaProfile;
    } catch (error) {
      console.error("❌ Sign-in error:", error);
      throw error;
    }
  }

  /**
   * Load or create GrudaChain profile
   */
  async loadGrudaProfile() {
    const key = `grudachain:profile:${this.user.uuid}`;

    try {
      const data = await puter.kv.get(key);

      if (data) {
        this.grudaProfile = JSON.parse(data);
        this.grudaProfile.lastLogin = Date.now();
        await this.saveGrudaProfile(this.grudaProfile);
        console.log("✅ GrudaChain profile loaded");
      } else {
        // First time user - create profile
        this.grudaProfile = await this.createGrudaProfile();
        console.log("✅ New GrudaChain profile created");
      }
    } catch (error) {
      console.error("❌ Error loading profile:", error);
      this.grudaProfile = await this.createGrudaProfile();
    }
  }

  /**
   * Create new GrudaChain profile
   */
  async createGrudaProfile() {
    const profile = {
      uuid: this.user.uuid,
      puterUsername: this.user.username,
      grudaUsername: null, // User will set this in-game
      class: null, // Must select before level 1
      level: 0,
      experience: 0,
      gold: 100, // Starting gold
      faction: null,
      reputation: 0,
      achievements: [],
      stats: {
        strength: 10,
        agility: 10,
        intelligence: 10,
        stamina: 10,
      },
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };

    await this.saveGrudaProfile(profile);
    return profile;
  }

  /**
   * Save GrudaChain profile
   */
  async saveGrudaProfile(profile) {
    const key = `grudachain:profile:${this.user.uuid}`;

    try {
      await puter.kv.set(key, JSON.stringify(profile));
      this.grudaProfile = profile;
      console.log("✅ Profile saved");
    } catch (error) {
      console.error("❌ Error saving profile:", error);
    }
  }

  /**
   * Save inventory
   */
  async saveInventory(inventory) {
    const key = `grudachain:inventory:${this.user.uuid}`;
    await puter.kv.set(key, JSON.stringify(inventory));
  }

  /**
   * Load inventory
   */
  async loadInventory() {
    const key = `grudachain:inventory:${this.user.uuid}`;
    const data = await puter.kv.get(key);
    return data ? JSON.parse(data) : { items: [], capacity: 32 };
  }

  /**
   * Save quests
   */
  async saveQuests(quests) {
    const key = `grudachain:quests:${this.user.uuid}`;
    await puter.kv.set(key, JSON.stringify(quests));
  }

  /**
   * Load quests
   */
  async loadQuests() {
    const key = `grudachain:quests:${this.user.uuid}`;
    const data = await puter.kv.get(key);
    return data ? JSON.parse(data) : { active: [], completed: [] };
  }

  /**
   * Update leaderboard score
   */
  async updateLeaderboard(score) {
    const key = `grudachain:leaderboard:${this.user.uuid}`;
    await puter.kv.incr(key, score);
  }

  /**
   * Get leaderboard position
   */
  async getLeaderboardPosition() {
    const key = `grudachain:leaderboard:${this.user.uuid}`;
    const score = await puter.kv.get(key);
    return parseInt(score) || 0;
  }

  /**
   * Sign out
   */
  async signOut() {
    if (this.isPuterAvailable) {
      await puter.auth.signOut();
    }
    this.user = null;
    this.grudaProfile = null;
    console.log("✅ Signed out");
  }

  /**
   * Local storage fallback (for development without Puter)
   */
  initializeLocalFallback() {
    const localUser = localStorage.getItem("grudachain:local:user");
    if (localUser) {
      this.user = JSON.parse(localUser);
      const localProfile = localStorage.getItem(
        `grudachain:local:profile:${this.user.uuid}`
      );
      this.grudaProfile = localProfile ? JSON.parse(localProfile) : null;
    }
  }

  signInLocalFallback() {
    // Create mock user for local development
    this.user = {
      uuid: "local-" + Date.now(),
      username: "LocalPlayer",
      email: "local@grudachain.local",
    };
    localStorage.setItem("grudachain:local:user", JSON.stringify(this.user));

    this.grudaProfile = {
      uuid: this.user.uuid,
      puterUsername: this.user.username,
      grudaUsername: "LocalWarrior",
      class: null,
      level: 0,
      experience: 0,
      gold: 100,
      faction: null,
      reputation: 0,
      achievements: [],
      stats: {
        strength: 10,
        agility: 10,
        intelligence: 10,
        stamina: 10,
      },
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };

    localStorage.setItem(
      `grudachain:local:profile:${this.user.uuid}`,
      JSON.stringify(this.grudaProfile)
    );

    return this.grudaProfile;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.user !== null && this.grudaProfile !== null;
  }

  /**
   * Get user display name
   */
  getDisplayName() {
    return this.grudaProfile?.grudaUsername || this.user?.username || "Guest";
  }
}

export default GrudaChainAuth;
