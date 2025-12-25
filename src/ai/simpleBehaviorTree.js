/**
 * Simple Behavior Tree Implementation
 * No external dependencies - pure JavaScript
 * Perfect for enemy AI, NPC behaviors, and game logic
 */

// Behavior Tree Node States
export const NodeState = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  RUNNING: 'running'
};

/**
 * Base Node class
 */
export class BehaviorNode {
  constructor(name = 'Node') {
    this.name = name;
  }

  tick(context) {
    throw new Error('tick() must be implemented by subclass');
  }
}

/**
 * Action Node - Executes a function
 */
export class Action extends BehaviorNode {
  constructor(name, actionFn) {
    super(name);
    this.actionFn = actionFn;
  }

  tick(context) {
    return this.actionFn(context);
  }
}

/**
 * Condition Node - Checks a condition
 */
export class Condition extends BehaviorNode {
  constructor(name, conditionFn) {
    super(name);
    this.conditionFn = conditionFn;
  }

  tick(context) {
    return this.conditionFn(context) ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}

/**
 * Sequence Node - Runs children in order until one fails
 */
export class Sequence extends BehaviorNode {
  constructor(name, children = []) {
    super(name);
    this.children = children;
    this.currentIndex = 0;
  }

  tick(context) {
    while (this.currentIndex < this.children.length) {
      const child = this.children[this.currentIndex];
      const state = child.tick(context);

      if (state === NodeState.FAILURE) {
        this.currentIndex = 0;
        return NodeState.FAILURE;
      }

      if (state === NodeState.RUNNING) {
        return NodeState.RUNNING;
      }

      this.currentIndex++;
    }

    this.currentIndex = 0;
    return NodeState.SUCCESS;
  }
}

/**
 * Selector Node - Runs children until one succeeds
 */
export class Selector extends BehaviorNode {
  constructor(name, children = []) {
    super(name);
    this.children = children;
    this.currentIndex = 0;
  }

  tick(context) {
    while (this.currentIndex < this.children.length) {
      const child = this.children[this.currentIndex];
      const state = child.tick(context);

      if (state === NodeState.SUCCESS) {
        this.currentIndex = 0;
        return NodeState.SUCCESS;
      }

      if (state === NodeState.RUNNING) {
        return NodeState.RUNNING;
      }

      this.currentIndex++;
    }

    this.currentIndex = 0;
    return NodeState.FAILURE;
  }
}

/**
 * Inverter Node - Inverts the result of its child
 */
export class Inverter extends BehaviorNode {
  constructor(name, child) {
    super(name);
    this.child = child;
  }

  tick(context) {
    const state = this.child.tick(context);
    
    if (state === NodeState.SUCCESS) return NodeState.FAILURE;
    if (state === NodeState.FAILURE) return NodeState.SUCCESS;
    return state;
  }
}

/**
 * Repeater Node - Repeats its child N times or until failure
 */
export class Repeater extends BehaviorNode {
  constructor(name, child, maxRepeats = Infinity) {
    super(name);
    this.child = child;
    this.maxRepeats = maxRepeats;
    this.currentRepeats = 0;
  }

  tick(context) {
    while (this.currentRepeats < this.maxRepeats) {
      const state = this.child.tick(context);

      if (state === NodeState.FAILURE) {
        this.currentRepeats = 0;
        return NodeState.FAILURE;
      }

      if (state === NodeState.RUNNING) {
        return NodeState.RUNNING;
      }

      this.currentRepeats++;
    }

    this.currentRepeats = 0;
    return NodeState.SUCCESS;
  }
}

/**
 * Behavior Tree - Main tree controller
 */
export class BehaviorTree {
  constructor(rootNode) {
    this.rootNode = rootNode;
    this.context = {};
  }

  tick() {
    return this.rootNode.tick(this.context);
  }

  setContext(key, value) {
    this.context[key] = value;
  }

  getContext(key) {
    return this.context[key];
  }
}

