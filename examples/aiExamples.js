/**
 * AI Examples for 3D Action RPG
 * Shows how to use behavior trees for enemy AI
 */

import {
  BehaviorTree,
  Sequence,
  Selector,
  Action,
  Condition,
  Inverter,
  NodeState
} from '../src/ai/simpleBehaviorTree.js';

/**
 * Example 1: Simple Enemy AI
 * Enemy patrols, chases player when in range, and attacks when close
 */
export function createSimpleEnemyAI(enemy, player) {
  const tree = new BehaviorTree(
    new Selector('Root', [
      // First priority: Attack if player is very close
      new Sequence('Attack Sequence', [
        new Condition('Is Player Very Close', (context) => {
          const distance = BABYLON.Vector3.Distance(
            enemy.position,
            player.position
          );
          context.distance = distance;
          return distance < 3;
        }),
        new Action('Attack Player', (context) => {
          console.log('Enemy attacking!');
          enemy.playAnimation('attack');
          // Add your attack logic here
          return NodeState.SUCCESS;
        })
      ]),

      // Second priority: Chase if player is in range
      new Sequence('Chase Sequence', [
        new Condition('Is Player In Range', (context) => {
          return context.distance < 15;
        }),
        new Action('Chase Player', (context) => {
          console.log('Enemy chasing!');
          const direction = player.position.subtract(enemy.position).normalize();
          enemy.position.addInPlace(direction.scale(0.1));
          enemy.lookAt(player.position);
          return NodeState.SUCCESS;
        })
      ]),

      // Default: Patrol
      new Action('Patrol', (context) => {
        console.log('Enemy patrolling...');
        // Add patrol logic here
        return NodeState.SUCCESS;
      })
    ])
  );

  return tree;
}

/**
 * Example 2: Boss AI with Multiple Phases
 */
export function createBossAI(boss, player) {
  const tree = new BehaviorTree(
    new Selector('Boss Root', [
      // Phase 1: Normal attacks (health > 50%)
      new Sequence('Phase 1', [
        new Condition('Health Above 50%', (context) => {
          return boss.health > boss.maxHealth * 0.5;
        }),
        new Selector('Phase 1 Attacks', [
          new Sequence('Melee Attack', [
            new Condition('Player Close', (context) => {
              const distance = BABYLON.Vector3.Distance(boss.position, player.position);
              return distance < 5;
            }),
            new Action('Melee Attack', () => {
              console.log('Boss melee attack!');
              boss.playAnimation('melee');
              return NodeState.SUCCESS;
            })
          ]),
          new Action('Ranged Attack', () => {
            console.log('Boss ranged attack!');
            boss.playAnimation('ranged');
            return NodeState.SUCCESS;
          })
        ])
      ]),

      // Phase 2: Enraged (health < 50%)
      new Sequence('Phase 2', [
        new Condition('Health Below 50%', (context) => {
          return boss.health <= boss.maxHealth * 0.5;
        }),
        new Action('Enrage', (context) => {
          if (!context.enraged) {
            console.log('Boss is enraged!');
            boss.playAnimation('enrage');
            boss.attackSpeed *= 1.5;
            context.enraged = true;
          }
          return NodeState.SUCCESS;
        }),
        new Action('Aggressive Attack', () => {
          console.log('Boss aggressive attack!');
          boss.playAnimation('aggressive');
          return NodeState.SUCCESS;
        })
      ])
    ])
  );

  return tree;
}

/**
 * Example 3: NPC Shopkeeper AI
 */
export function createShopkeeperAI(npc, player) {
  const tree = new BehaviorTree(
    new Selector('Shopkeeper Root', [
      // Greet player when they approach
      new Sequence('Greet Player', [
        new Condition('Player Nearby', (context) => {
          const distance = BABYLON.Vector3.Distance(npc.position, player.position);
          return distance < 5 && !context.hasGreeted;
        }),
        new Action('Say Greeting', (context) => {
          console.log('Shopkeeper: Welcome to my shop!');
          npc.playAnimation('wave');
          context.hasGreeted = true;
          return NodeState.SUCCESS;
        })
      ]),

      // Idle animation
      new Action('Idle', () => {
        npc.playAnimation('idle');
        return NodeState.SUCCESS;
      })
    ])
  );

  return tree;
}

/**
 * Example 4: Guard AI with Patrol and Investigation
 */
export function createGuardAI(guard, player, patrolPoints) {
  let currentPatrolIndex = 0;

  const tree = new BehaviorTree(
    new Selector('Guard Root', [
      // Investigate if player is spotted
      new Sequence('Investigate', [
        new Condition('Player Spotted', (context) => {
          const distance = BABYLON.Vector3.Distance(guard.position, player.position);
          const inRange = distance < 10;
          
          if (inRange) {
            context.lastKnownPosition = player.position.clone();
          }
          
          return inRange;
        }),
        new Action('Move to Last Known Position', (context) => {
          const direction = context.lastKnownPosition.subtract(guard.position).normalize();
          guard.position.addInPlace(direction.scale(0.15));
          guard.lookAt(context.lastKnownPosition);
          
          const distance = BABYLON.Vector3.Distance(guard.position, context.lastKnownPosition);
          return distance < 1 ? NodeState.SUCCESS : NodeState.RUNNING;
        })
      ]),

      // Patrol between points
      new Sequence('Patrol', [
        new Action('Move to Patrol Point', (context) => {
          const targetPoint = patrolPoints[currentPatrolIndex];
          const direction = targetPoint.subtract(guard.position).normalize();
          guard.position.addInPlace(direction.scale(0.05));
          guard.lookAt(targetPoint);
          
          const distance = BABYLON.Vector3.Distance(guard.position, targetPoint);
          
          if (distance < 1) {
            currentPatrolIndex = (currentPatrolIndex + 1) % patrolPoints.length;
            return NodeState.SUCCESS;
          }
          
          return NodeState.RUNNING;
        })
      ])
    ])
  );

  return tree;
}

/**
 * Example 5: Using AI in your game loop
 */
export function setupEnemyAI(scene, enemy, player) {
  // Create the AI
  const enemyAI = createSimpleEnemyAI(enemy, player);

  // Run AI every frame
  scene.onBeforeRenderObservable.add(() => {
    enemyAI.tick();
  });

  return enemyAI;
}

/**
 * Example 6: Multiple enemies with different behaviors
 */
export function setupMultipleEnemies(scene, enemies, player) {
  const aiTrees = [];

  enemies.forEach((enemy, index) => {
    let ai;
    
    // Different AI based on enemy type
    if (enemy.type === 'boss') {
      ai = createBossAI(enemy, player);
    } else if (enemy.type === 'guard') {
      ai = createGuardAI(enemy, player, enemy.patrolPoints);
    } else {
      ai = createSimpleEnemyAI(enemy, player);
    }

    aiTrees.push(ai);

    // Run each AI
    scene.onBeforeRenderObservable.add(() => {
      ai.tick();
    });
  });

  return aiTrees;
}

