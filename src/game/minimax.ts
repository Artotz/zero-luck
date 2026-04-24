import {
  CARD_TYPES,
  type AiDecision,
  type CardType,
  type GameState,
  type MinimaxNode,
} from "./types";
import {
  applyRoundToState,
  compareCards,
  evaluateState,
  getAvailableMoves,
  isTerminalState,
  summarizeState,
} from "./rules";

interface SearchResult {
  value: number;
  node: MinimaxNode;
  bestMove: CardType | null;
  path: string[];
  truncated: boolean;
}

const MAX_SEARCH_DEPTH = 3;
let nodeCounter = 0;

const createNodeId = () => {
  nodeCounter += 1;
  return `node-${nodeCounter}`;
};

const evaluateHeuristicState = (state: GameState) => {
  const scorePressure = evaluateState(state) * 100;
  let matchupPressure = 0;

  for (const aiCard of CARD_TYPES) {
    for (const playerCard of CARD_TYPES) {
      matchupPressure +=
        compareCards(aiCard, playerCard) *
        state.aiHand[aiCard] *
        state.playerHand[playerCard];
    }
  }

  return scorePressure + matchupPressure;
};

const buildPrunedNode = (
  depth: number,
  actor: "AI" | "PLAYER",
  state: GameState,
  move?: CardType,
): MinimaxNode => ({
  id: createNodeId(),
  depth,
  actor,
  move,
  value: evaluateState(state),
  alpha: Number.NaN,
  beta: Number.NaN,
  pruned: true,
  children: [],
  state: summarizeState(state),
});

const minimax = (
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  actor: "PLAYER" | "AI",
  forcedPlayerMove?: CardType,
  moveLabel?: CardType,
): SearchResult => {
  const node: MinimaxNode = {
    id: createNodeId(),
    depth,
    actor,
    move: moveLabel,
    value: actor === "AI" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    alpha,
    beta,
    pruned: false,
    children: [],
    state: summarizeState(state),
  };

  if (isTerminalState(state)) {
    node.actor = "TERMINAL";
    node.value = evaluateState(state);
    return {
      value: node.value,
      node,
      bestMove: null,
      path: [node.id],
      truncated: false,
    };
  }

  if (depth >= MAX_SEARCH_DEPTH) {
    node.value = evaluateHeuristicState(state);
    return {
      value: node.value,
      node,
      bestMove: null,
      path: [node.id],
      truncated: true,
    };
  }

  if (actor === "PLAYER") {
    const playerMoves = forcedPlayerMove
      ? [forcedPlayerMove]
      : getAvailableMoves(state.playerHand);

    if (playerMoves.length === 0) {
      node.actor = "TERMINAL";
      node.value = evaluateState(state);
      return {
        value: node.value,
        node,
        bestMove: null,
        path: [node.id],
        truncated: false,
      };
    }

    let bestValue = Number.POSITIVE_INFINITY;
    let bestPath = [node.id];
    let bestMove: CardType | null = null;
    const currentAlpha = alpha;
    let currentBeta = beta;
    let truncated = false;

    for (const playerMove of playerMoves) {
      const child = minimax(
        state,
        depth + 1,
        currentAlpha,
        currentBeta,
        "AI",
        undefined,
        playerMove,
      );
      node.children.push(child.node);
      truncated = truncated || child.truncated;

      if (child.value < bestValue) {
        bestValue = child.value;
        bestMove = playerMove;
        bestPath = [node.id, ...child.path];
      }

      currentBeta = Math.min(currentBeta, bestValue);

      if (currentBeta <= currentAlpha) {
        node.pruned = true;

        for (const remainingMove of playerMoves.slice(node.children.length)) {
          node.children.push(
            buildPrunedNode(depth + 1, "AI", state, remainingMove),
          );
        }
        break;
      }
    }

    node.value = bestValue;
    node.alpha = currentAlpha;
    node.beta = currentBeta;
    return { value: bestValue, node, bestMove, path: bestPath, truncated };
  }

  const aiMoves = getAvailableMoves(state.aiHand);

  if (aiMoves.length === 0) {
    node.actor = "TERMINAL";
    node.value = evaluateState(state);
    return {
      value: node.value,
      node,
      bestMove: null,
      path: [node.id],
      truncated: false,
    };
  }

  let bestValue = Number.NEGATIVE_INFINITY;
  let bestMove: CardType | null = null;
  let bestPath = [node.id];
  let currentAlpha = alpha;
  const currentBeta = beta;
  let truncated = false;

  for (const aiMove of aiMoves) {
    const nextState = applyRoundToState(state, moveLabel as CardType, aiMove);

    // Alpha-beta matters here because once MAX proves a branch is already
    // better than MIN would ever allow, the remaining sibling states are skipped.
    const child = minimax(
      nextState,
      depth + 1,
      currentAlpha,
      currentBeta,
      "PLAYER",
      undefined,
      aiMove,
    );
    node.children.push(child.node);
    truncated = truncated || child.truncated;

    if (child.value > bestValue) {
      bestValue = child.value;
      bestMove = aiMove;
      bestPath = [node.id, ...child.path];
    }

    currentAlpha = Math.max(currentAlpha, bestValue);

    if (currentAlpha >= currentBeta) {
      node.pruned = true;

      for (const remainingMove of aiMoves.slice(node.children.length)) {
        node.children.push(
          buildPrunedNode(depth + 1, "PLAYER", state, remainingMove),
        );
      }
      break;
    }
  }

  node.value = bestValue;
  node.alpha = currentAlpha;
  node.beta = currentBeta;
  return { value: bestValue, node, bestMove, path: bestPath, truncated };
};

export const decideAiMove = (
  state: GameState,
  forcedPlayerMove?: CardType,
): AiDecision => {
  nodeCounter = 0;

  const root = minimax(
    state,
    0,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    forcedPlayerMove ? "AI" : "PLAYER",
    forcedPlayerMove,
  );

  if (forcedPlayerMove) {
    return {
      card: root.bestMove,
      value: root.value,
      tree: root.node,
      path: root.path,
      exploredDepth: MAX_SEARCH_DEPTH,
      nodeCount: nodeCounter,
      truncated: root.truncated,
    };
  }

  const playerBranch = root.node.children[0];
  const selectedMove = playerBranch?.children.find(
    (child) => child.value === root.value,
  )?.move;

  return {
    card: selectedMove ?? null,
    value: root.value,
    tree: root.node,
    path: root.path,
    exploredDepth: MAX_SEARCH_DEPTH,
    nodeCount: nodeCounter,
    truncated: root.truncated,
  };
};
