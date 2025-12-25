/**
 * Gemini AI Integration for Grudge Warlords RPG
 * Provides AI-powered features using Google's Gemini API via Puter
 */

export class GeminiIntegration {
    constructor() {
        this.apiKey = null;
        this.model = 'gemini-2.0-flash-exp';
        this.initialized = false;
    }

    /**
     * Initialize Gemini AI with API key
     * @param {string} apiKey - Gemini API key (optional if using Puter)
     */
    async initialize(apiKey = null) {
        try {
            // Check if running on Puter
            if (typeof puter !== 'undefined') {
                console.log('Using Puter AI integration');
                this.usePuter = true;
                this.initialized = true;
                return true;
            }

            // Fallback to direct Gemini API
            if (apiKey) {
                this.apiKey = apiKey;
                this.initialized = true;
                return true;
            }

            console.warn('No API key provided and Puter not available');
            return false;
        } catch (error) {
            console.error('Failed to initialize Gemini:', error);
            return false;
        }
    }

    /**
     * Generate AI-powered NPC dialogue
     * @param {string} npcName - Name of the NPC
     * @param {string} context - Current game context
     * @returns {Promise<string>} Generated dialogue
     */
    async generateNPCDialogue(npcName, context) {
        if (!this.initialized) {
            return `Hello, traveler. I am ${npcName}.`;
        }

        const prompt = `You are ${npcName}, an NPC in a fantasy RPG game. 
Context: ${context}
Generate a short, immersive dialogue response (2-3 sentences max).`;

        try {
            if (this.usePuter) {
                const response = await puter.ai.chat(prompt, { model: this.model });
                return response.message.content;
            }
            
            // Fallback response
            return `Hello, traveler. I am ${npcName}. How may I assist you?`;
        } catch (error) {
            console.error('AI dialogue generation failed:', error);
            return `Hello, traveler. I am ${npcName}.`;
        }
    }

    /**
     * Generate quest suggestions based on player level and progress
     * @param {number} playerLevel - Current player level
     * @param {Array} completedQuests - List of completed quest IDs
     * @returns {Promise<Object>} Quest suggestion
     */
    async generateQuestSuggestion(playerLevel, completedQuests = []) {
        if (!this.initialized) {
            return this.getDefaultQuest(playerLevel);
        }

        const prompt = `Generate a fantasy RPG quest for a level ${playerLevel} player.
Completed quests: ${completedQuests.join(', ') || 'None'}
Return JSON with: title, description, objectives (array), rewards (xp, gold)
Keep it concise and appropriate for the level.`;

        try {
            if (this.usePuter) {
                const response = await puter.ai.chat(prompt, { 
                    model: this.model,
                    temperature: 0.8 
                });
                
                // Parse JSON from response
                const content = response.message.content;
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
            
            return this.getDefaultQuest(playerLevel);
        } catch (error) {
            console.error('Quest generation failed:', error);
            return this.getDefaultQuest(playerLevel);
        }
    }

    /**
     * Analyze player build and provide suggestions
     * @param {Object} attributes - Player attributes
     * @param {string} className - Player class
     * @returns {Promise<string>} Build analysis
     */
    async analyzeBuild(attributes, className) {
        if (!this.initialized) {
            return 'Your build looks balanced. Keep allocating points based on your playstyle!';
        }

        const prompt = `Analyze this ${className} build in an RPG:
Attributes: ${JSON.stringify(attributes)}
Provide brief advice (2-3 sentences) on strengths and improvement suggestions.`;

        try {
            if (this.usePuter) {
                const response = await puter.ai.chat(prompt, { model: this.model });
                return response.message.content;
            }
            
            return 'Your build looks balanced. Keep allocating points based on your playstyle!';
        } catch (error) {
            console.error('Build analysis failed:', error);
            return 'Your build looks balanced. Keep allocating points based on your playstyle!';
        }
    }

    /**
     * Get default quest for fallback
     */
    getDefaultQuest(level) {
        const quests = {
            1: { title: 'First Steps', description: 'Defeat 5 enemies', objectives: ['Defeat 5 enemies'], rewards: { xp: 100, gold: 50 } },
            5: { title: 'Growing Power', description: 'Defeat 10 enemies', objectives: ['Defeat 10 enemies'], rewards: { xp: 500, gold: 200 } },
            10: { title: 'Veteran Warrior', description: 'Defeat a boss', objectives: ['Defeat boss enemy'], rewards: { xp: 1000, gold: 500 } }
        };
        
        const nearestLevel = [1, 5, 10].reduce((prev, curr) => 
            Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
        );
        
        return quests[nearestLevel];
    }
}

