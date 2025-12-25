/**
 * Race Selection UI
 * Beautiful UI for selecting character race
 */

export class RaceSelectionUI {
    constructor(raceManager, onRaceSelected) {
        this.raceManager = raceManager;
        this.onRaceSelected = onRaceSelected;
        this.selectedRace = null;
        this.container = null;
        
        console.log('🎨 RaceSelectionUI initialized');
    }

    /**
     * Create and show race selection UI
     */
    async show() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'race-selection-panel';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 1200px;
            height: 80%;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
            border: 3px solid #8b5cf6;
            border-radius: 20px;
            padding: 30px;
            z-index: 3000;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 50px rgba(139, 92, 246, 0.5);
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            text-align: center;
            margin-bottom: 30px;
        `;
        header.innerHTML = `
            <h1 style="color: #8b5cf6; font-size: 48px; margin: 0; text-shadow: 0 0 20px rgba(139, 92, 246, 0.8);">
                🎭 Choose Your Race
            </h1>
            <p style="color: #aaa; font-size: 18px; margin-top: 10px;">
                Each race has unique bonuses and abilities
            </p>
        `;
        this.container.appendChild(header);

        // Create race grid
        const raceGrid = document.createElement('div');
        raceGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        `;

        // Get all races
        const races = this.raceManager.getAllRaces();

        // Create race cards
        races.forEach(race => {
            const card = this.createRaceCard(race);
            raceGrid.appendChild(card);
        });

        this.container.appendChild(raceGrid);

        // Create footer with confirm button
        const footer = document.createElement('div');
        footer.style.cssText = `
            margin-top: 20px;
            text-align: center;
        `;

        const confirmButton = document.createElement('button');
        confirmButton.textContent = '✅ Confirm Selection';
        confirmButton.style.cssText = `
            padding: 15px 40px;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
            transition: all 0.3s;
        `;

        confirmButton.addEventListener('mouseenter', () => {
            confirmButton.style.transform = 'scale(1.05)';
            confirmButton.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.6)';
        });

        confirmButton.addEventListener('mouseleave', () => {
            confirmButton.style.transform = 'scale(1)';
            confirmButton.style.boxShadow = '0 5px 15px rgba(139, 92, 246, 0.4)';
        });

        confirmButton.addEventListener('click', () => {
            if (this.selectedRace) {
                this.raceManager.setRace(this.selectedRace.id);
                this.raceManager.save();
                if (this.onRaceSelected) {
                    this.onRaceSelected(this.selectedRace);
                }
                this.hide();
            } else {
                alert('Please select a race first!');
            }
        });

        footer.appendChild(confirmButton);
        this.container.appendChild(footer);

        document.body.appendChild(this.container);
    }

    /**
     * Create race card
     */
    createRaceCard(race) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, rgba(30, 30, 50, 0.8), rgba(50, 50, 70, 0.8));
            border: 2px solid #444;
            border-radius: 15px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        `;

        // Race icon and name
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        `;
        header.innerHTML = `
            <div style="font-size: 48px;">${race.icon}</div>
            <div>
                <h2 style="color: #fff; margin: 0; font-size: 28px;">${race.name}</h2>
                <p style="color: #aaa; margin: 5px 0 0 0; font-size: 14px;">${race.description}</p>
            </div>
        `;
        card.appendChild(header);

        // Bonuses
        const bonusesDiv = document.createElement('div');
        bonusesDiv.style.cssText = `
            margin-top: 15px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
        `;

        let bonusesHTML = '<div style="color: #8b5cf6; font-weight: bold; margin-bottom: 8px;">📊 Stat Bonuses:</div>';
        bonusesHTML += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 14px;">';

        Object.entries(race.bonuses).forEach(([stat, value]) => {
            if (value !== 0) {
                const color = value > 0 ? '#10b981' : '#ef4444';
                const sign = value > 0 ? '+' : '';
                bonusesHTML += `
                    <div style="color: ${color};">
                        ${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${sign}${value}
                    </div>
                `;
            }
        });

        bonusesHTML += '</div>';
        bonusesDiv.innerHTML = bonusesHTML;
        card.appendChild(bonusesDiv);

        // Lore
        if (race.lore) {
            const loreDiv = document.createElement('div');
            loreDiv.style.cssText = `
                margin-top: 15px;
                padding: 10px;
                background: rgba(139, 92, 246, 0.1);
                border-left: 3px solid #8b5cf6;
                border-radius: 5px;
                color: #ccc;
                font-size: 13px;
                font-style: italic;
            `;
            loreDiv.textContent = race.lore;
            card.appendChild(loreDiv);
        }

        // Click handler
        card.addEventListener('click', () => {
            this.selectRace(race, card);
        });

        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.02)';
            card.style.borderColor = '#8b5cf6';
            card.style.boxShadow = '0 5px 20px rgba(139, 92, 246, 0.4)';
        });

        card.addEventListener('mouseleave', () => {
            if (this.selectedRace !== race) {
                card.style.transform = 'scale(1)';
                card.style.borderColor = '#444';
                card.style.boxShadow = 'none';
            }
        });

        // Mark default race
        if (race.isDefault) {
            this.selectRace(race, card);
        }

        return card;
    }

    /**
     * Select a race
     */
    selectRace(race, cardElement) {
        // Deselect previous
        const allCards = this.container.querySelectorAll('[data-race-card]');
        allCards.forEach(card => {
            card.style.borderColor = '#444';
            card.style.transform = 'scale(1)';
            card.style.boxShadow = 'none';
        });

        // Select new
        this.selectedRace = race;
        cardElement.setAttribute('data-race-card', 'selected');
        cardElement.style.borderColor = '#8b5cf6';
        cardElement.style.transform = 'scale(1.05)';
        cardElement.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.6)';

        console.log(`🎭 Selected race: ${race.name}`);
    }

    /**
     * Hide UI
     */
    hide() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

// Export creator function
export function createRaceSelectionUI(raceManager, onRaceSelected) {
    return new RaceSelectionUI(raceManager, onRaceSelected);
}

