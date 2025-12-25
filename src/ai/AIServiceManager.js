/**
 * AI Service Manager
 * Centralized AI service management with provider abstraction, caching, and error handling
 */

export class AIServiceManager {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
    this.rateLimiter = {
      gemini: { requests: 0, lastReset: Date.now() },
    };
  }

  /**
   * Initialize AI services
   */
  async initialize() {
    console.log("🤖 Initializing AI Service Manager...");

    // Check Puter availability
    this.puterAvailable = typeof puter !== "undefined" && puter.ai;

    // Check Gemini availability
    this.geminiAvailable = !!this.config.providers.gemini.apiKey;

    console.log(
      `✅ Puter AI: ${this.puterAvailable ? "Available" : "Not Available"}`
    );
    console.log(
      `✅ Gemini AI: ${this.geminiAvailable ? "Available" : "Not Available"}`
    );

    // Start cache cleanup interval
    if (this.config.caching.enabled) {
      this.startCacheCleanup();
    }
  }

  /**
   * Generate NPC dialogue
   */
  async generateNPCDialogue(npcName, context, playerMessage) {
    const cacheKey = `npc:${npcName}:${playerMessage}`;

    // Check cache first
    if (this.config.npc.dialogueCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log("📦 Using cached NPC dialogue");
        return cached;
      }
    }

    const prompt = `${this.config.npc.systemPrompt}\n\nNPC Name: ${npcName}\nContext: ${context}\nPlayer: ${playerMessage}\n\nRespond as ${npcName}:`;

    try {
      const response = await this.chat(prompt, {
        temperature: this.config.npc.temperature,
        maxTokens: this.config.npc.maxTokens,
      });

      // Cache the response
      if (this.config.npc.dialogueCache) {
        this.addToCache(cacheKey, response, this.config.npc.cacheExpiry);
      }

      return response;
    } catch (error) {
      console.error("❌ NPC dialogue generation failed:", error);
      return this.getFallbackDialogue(npcName);
    }
  }

  /**
   * Generate quest
   */
  async generateQuest(difficulty, playerLevel, context) {
    const prompt = `${this.config.quest.systemPrompt}\n\nDifficulty: ${difficulty}\nPlayer Level: ${playerLevel}\nContext: ${context}\n\nGenerate a quest with title, description, objectives, and rewards:`;

    try {
      const response = await this.chat(prompt, {
        temperature: this.config.quest.temperature,
        maxTokens: this.config.quest.maxTokens,
      });

      return this.parseQuestResponse(response);
    } catch (error) {
      console.error("❌ Quest generation failed:", error);
      return this.getFallbackQuest(difficulty, playerLevel);
    }
  }

  /**
   * Generic chat completion
   */
  async chat(prompt, options = {}) {
    // Try Puter AI first (free)
    if (this.puterAvailable && this.config.providers.puter.enabled) {
      try {
        const response = await puter.ai.chat(prompt, {
          model: options.model || this.config.providers.puter.models[0],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 150,
        });
        return response;
      } catch (error) {
        console.warn("⚠️ Puter AI failed, trying fallback...", error);
      }
    }

    // Fallback to Gemini
    if (this.geminiAvailable && this.config.providers.gemini.enabled) {
      return await this.chatWithGemini(prompt, options);
    }

    throw new Error("No AI providers available");
  }

  /**
   * Chat with Gemini
   */
  async chatWithGemini(prompt, options = {}) {
    // Check rate limit
    if (!this.checkRateLimit("gemini")) {
      throw new Error("Rate limit exceeded for Gemini");
    }

    const apiKey = this.config.providers.gemini.apiKey.replace(
      "${GEMINI_API_KEY}",
      process.env.GEMINI_API_KEY || ""
    );

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.providers.gemini.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 150,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    this.incrementRateLimit("gemini");

    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }
    this.cache.delete(key);
    return null;
  }

  addToCache(key, value, ttl) {
    if (this.cache.size >= this.config.caching.maxSize) {
      // LRU eviction
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (value.expiry <= now) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  /**
   * Rate limiting
   */
  checkRateLimit(provider) {
    const limiter = this.rateLimiter[provider];
    const now = Date.now();

    // Reset if minute has passed
    if (now - limiter.lastReset > 60000) {
      limiter.requests = 0;
      limiter.lastReset = now;
    }

    const limit = this.config.providers[provider].rateLimit.requestsPerMinute;
    return limiter.requests < limit;
  }

  incrementRateLimit(provider) {
    this.rateLimiter[provider].requests++;
  }

  /**
   * Fallback responses
   */
  getFallbackDialogue(npcName) {
    const fallbacks = [
      `Greetings, traveler. I am ${npcName}.`,
      `Welcome to our humble establishment.`,
      `What brings you here today?`,
      `I'm afraid I'm quite busy at the moment.`,
      `Perhaps we can speak another time.`,
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  getFallbackQuest(difficulty, playerLevel) {
    return {
      title: `${difficulty} Quest`,
      description: `A ${difficulty.toLowerCase()} quest suitable for level ${playerLevel} adventurers.`,
      objectives: [
        { id: 1, description: "Complete the objective", progress: 0, max: 1 },
      ],
      rewards: {
        experience: playerLevel * 100,
        gold: playerLevel * 50,
      },
    };
  }

  /**
   * Parse quest response from AI
   */
  parseQuestResponse(response) {
    try {
      // Try to parse as JSON first
      return JSON.parse(response);
    } catch {
      // Fallback: extract from text
      return {
        title: this.extractField(response, "Title:", "\n"),
        description: this.extractField(response, "Description:", "\n"),
        objectives: [
          {
            id: 1,
            description: this.extractField(response, "Objective:", "\n"),
            progress: 0,
            max: 1,
          },
        ],
        rewards: {
          experience: 100,
          gold: 50,
        },
      };
    }
  }

  extractField(text, start, end) {
    const startIndex = text.indexOf(start);
    if (startIndex === -1) return "";

    const valueStart = startIndex + start.length;
    const endIndex = text.indexOf(end, valueStart);

    return text
      .substring(valueStart, endIndex === -1 ? undefined : endIndex)
      .trim();
  }

  /**
   * Cleanup
   */
  destroy() {
    this.cache.clear();
    this.requestQueue = [];
  }
}

export default AIServiceManager;
