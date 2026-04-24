export const CARD_TYPES = ['Rock', 'Paper', 'Scissors'] as const
export const INITIAL_HAND_COUNT = 3

export type CardType = (typeof CARD_TYPES)[number]
export type Actor = 'AI' | 'PLAYER' | 'TERMINAL'
export type RoundResult = 'PLAYER_WIN' | 'AI_WIN' | 'DRAW'

export type Hand = Record<CardType, number>

export interface RoundRecord {
  round: number
  playerMove: CardType
  aiMove: CardType
  result: RoundResult
}

export interface GameState {
  playerHand: Hand
  aiHand: Hand
  playerScore: number
  aiScore: number
  round: number
  history: RoundRecord[]
}

export interface TreeStateSummary {
  round: number
  playerScore: number
  aiScore: number
  playerRemaining: number
  aiRemaining: number
}

export interface MinimaxNode {
  id: string
  depth: number
  actor: Actor
  move?: CardType
  value: number
  alpha: number
  beta: number
  pruned: boolean
  children: MinimaxNode[]
  state: TreeStateSummary
}

export interface AiDecision {
  card: CardType | null
  value: number
  tree: MinimaxNode
  path: string[]
  exploredDepth: number
  nodeCount: number
  truncated: boolean
}
