// 🎮 GRUDGE NFT Island AI Worker - Puter Serverless Function
// Advanced AI-powered catalog assistant with Claude integration

// ============================================================================
// GRUDGE CATALOG AI WORKER - MAIN ROUTES
// ============================================================================

// Health check endpoint
router.get('/health', async () => {
    const response = {
        status: 'healthy',
        service: 'GRUDGE NFT Island AI Worker',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        capabilities: [
            'Item Analysis',
            'Crafting Recommendations',
            'Strategy Advice',
            'Catalog Search',
            'AI Chat Support'
        ]
    };

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
});

// ============================================================================
// AI CHAT ENDPOINT - Main AI interaction
// ============================================================================
router.post('/api/chat', async ({ request }) => {
    try {
        const { message, context, model = 'claude-sonnet-4' } = await request.json();
        
        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Enhanced system prompt for GRUDGE NFT Island
        const systemPrompt = `You are the GRUDGE NFT Island Catalog AI Assistant. You help players with:

🎮 GRUDGE NFT ISLAND CONTEXT:
- 590+ unique items across 13 categories
- 559+ crafting recipes with complex ingredient chains
- Fantasy RPG setting with multiple races (Human, Elf, Dwarf, Orc, Undead, Barbarian)
- Equipment system: weapons, armor, tools, mounts, allies
- Resource management and crafting optimization
- Strategic gameplay elements

🎯 YOUR CAPABILITIES:
- Analyze item stats and recommend optimal builds
- Suggest crafting paths and resource gathering strategies
- Provide lore and background information
- Help with inventory management
- Explain game mechanics and systems
- Offer strategic advice for different playstyles

📊 ITEM CATEGORIES:
1. Weapons (swords, bows, staves, etc.)
2. Armor (helmets, chest, pants, gloves, boots)
3. Tools (pickaxes, hatchets, fishing rods)
4. Resources (ores, gems, materials, ingredients)
5. Potions (health, mana, buffs, elemental)
6. Mounts (horses, drakes, exotic creatures)
7. Allies (companions, summons, mercenaries)
8. Structures (buildings, defenses, workstations)
9. Packs (storage, organization, upgrades)
10. Books (knowledge, spells, recipes)
11. Food (consumables, buffs, cooking ingredients)
12. Jewelry (rings, necklaces, magical accessories)
13. Miscellaneous (special items, quest objects)

🔮 RARITY SYSTEM:
- Common (Gray) - Basic items
- Uncommon (Green) - Improved stats
- Rare (Blue) - Significant bonuses
- Epic (Purple) - Powerful effects
- Legendary (Orange) - Exceptional abilities
- Mythic (Gold) - Ultimate tier items

Always provide helpful, detailed responses with specific item recommendations when possible.`;

        // Combine system prompt with user message
        const fullPrompt = `${systemPrompt}\n\nUser Context: ${context || 'General inquiry'}\n\nUser Message: ${message}`;

        // Call Claude AI through Puter
        const response = await me.puter.ai.chat(fullPrompt, { 
            model: model,
            max_tokens: 2000
        });

        return {
            success: true,
            response: response.message.content[0].text,
            model: model,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('AI Chat Error:', error);
        return new Response(JSON.stringify({ 
            error: 'AI service temporarily unavailable',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// STREAMING AI CHAT - For longer responses
// ============================================================================
router.post('/api/chat/stream', async ({ request }) => {
    try {
        const { message, context, model = 'claude-sonnet-4' } = await request.json();
        
        if (!message) {
            return new Response('Message is required', { status: 400 });
        }

        const systemPrompt = `You are the GRUDGE NFT Island Catalog AI Assistant specializing in detailed analysis and recommendations for the fantasy RPG catalog system with 590+ items and 559+ crafting recipes.`;
        const fullPrompt = `${systemPrompt}\n\nContext: ${context || 'General inquiry'}\n\nMessage: ${message}`;

        // Create streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const response = await me.puter.ai.chat(fullPrompt, { 
                        model: model,
                        stream: true
                    });

                    for await (const chunk of response) {
                        const data = JSON.stringify({ 
                            text: chunk?.text || '',
                            done: false 
                        });
                        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                    }

                    // Send completion signal
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// ITEM ANALYSIS ENDPOINT
// ============================================================================
router.post('/api/analyze-item', async ({ request }) => {
    try {
        const { itemName, itemData } = await request.json();
        
        if (!itemName) {
            return new Response(JSON.stringify({ error: 'Item name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const analysisPrompt = `Analyze this GRUDGE NFT Island item and provide detailed insights:

Item: ${itemName}
${itemData ? `Data: ${JSON.stringify(itemData, null, 2)}` : ''}

Please provide:
1. Item overview and primary use
2. Stat analysis and effectiveness rating
3. Best use cases and strategies
4. Synergies with other items
5. Crafting requirements (if applicable)
6. Rarity assessment and value
7. Recommended player types/builds

Format as a comprehensive analysis with specific recommendations.`;

        const response = await me.puter.ai.chat(analysisPrompt, { 
            model: 'claude-sonnet-4',
            max_tokens: 1500
        });

        return {
            success: true,
            itemName: itemName,
            analysis: response.message.content[0].text,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Analysis service unavailable',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// CRAFTING RECOMMENDATIONS ENDPOINT
// ============================================================================
router.post('/api/crafting-advice', async ({ request }) => {
    try {
        const { goal, availableResources, playerLevel } = await request.json();
        
        const craftingPrompt = `Provide crafting advice for GRUDGE NFT Island:

Goal: ${goal || 'General crafting optimization'}
Available Resources: ${availableResources || 'Not specified'}
Player Level: ${playerLevel || 'Not specified'}

Please provide:
1. Optimal crafting path to achieve the goal
2. Resource gathering priorities
3. Workstation requirements
4. Time and efficiency estimates
5. Alternative approaches
6. Tips for resource optimization

Focus on practical, actionable advice for the 559+ recipe crafting system.`;

        const response = await me.puter.ai.chat(craftingPrompt, { 
            model: 'claude-sonnet-4',
            max_tokens: 1500
        });

        return {
            success: true,
            advice: response.message.content[0].text,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Crafting advice service unavailable',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// CATALOG SEARCH ENDPOINT
// ============================================================================
router.post('/api/search', async ({ request }) => {
    try {
        const { query, category, rarity } = await request.json();
        
        const searchPrompt = `Help find items in the GRUDGE NFT Island catalog:

Search Query: ${query}
Category Filter: ${category || 'All categories'}
Rarity Filter: ${rarity || 'All rarities'}

From the 590+ items across 13 categories, suggest:
1. Exact matches for the query
2. Similar or related items
3. Alternative options
4. Category-specific recommendations
5. Rarity considerations

Provide specific item names and brief descriptions when possible.`;

        const response = await me.puter.ai.chat(searchPrompt, { 
            model: 'claude-sonnet-4',
            max_tokens: 1200
        });

        return {
            success: true,
            query: query,
            suggestions: response.message.content[0].text,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Search service unavailable',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// STORAGE ENDPOINTS - Save user preferences and data
// ============================================================================
router.post('/api/user/save-preferences', async ({ request }) => {
    try {
        const { userId, preferences } = await request.json();
        
        if (!userId || !preferences) {
            return new Response(JSON.stringify({ error: 'User ID and preferences required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await me.puter.kv.set(`grudge_prefs_${userId}`, preferences);
        
        return {
            success: true,
            message: 'Preferences saved successfully',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Failed to save preferences',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

router.get('/api/user/preferences/:userId', async ({ params }) => {
    try {
        const userId = params.userId;
        const preferences = await me.puter.kv.get(`grudge_prefs_${userId}`);
        
        if (!preferences) {
            return new Response(JSON.stringify({ error: 'Preferences not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return {
            success: true,
            preferences: preferences,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Failed to retrieve preferences',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// CORS and Error Handling
// ============================================================================
router.options('*', async () => {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
});

// Default route
router.get('/', async () => {
    return {
        service: 'GRUDGE NFT Island AI Worker',
        version: '1.0.0',
        status: 'active',
        endpoints: [
            'GET /health - Health check',
            'POST /api/chat - AI chat assistance',
            'POST /api/chat/stream - Streaming AI chat',
            'POST /api/analyze-item - Item analysis',
            'POST /api/crafting-advice - Crafting recommendations',
            'POST /api/search - Catalog search',
            'POST /api/user/save-preferences - Save user preferences',
            'GET /api/user/preferences/:userId - Get user preferences'
        ],
        documentation: 'Advanced AI worker for GRUDGE NFT Island catalog assistance'
    };
});
