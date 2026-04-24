import { CARD_TYPES, type CardType, type GameState, type Hand, type RoundRecord, type RoundResult } from './types'

const WIN_MAP: Record<CardType, CardType> = {
  Rock: 'Scissors',
  Paper: 'Rock',
  Scissors: 'Paper',
}

export const compareCards = (first: CardType, second: CardType): 1 | 0 | -1 => {
  if (first === second) {
    return 0
  }

  return WIN_MAP[first] === second ? 1 : -1
}

export const getMatchOutcome = (playerMove: CardType, aiMove: CardType): RoundResult => {
  const comparison = compareCards(playerMove, aiMove)

  if (comparison === 0) {
    return 'DRAW'
  }

  return comparison === 1 ? 'PLAYER_WIN' : 'AI_WIN'
}

export const cloneHand = (hand: Hand): Hand => ({ ...hand })

export const decrementCard = (hand: Hand, card: CardType): Hand => ({
  ...hand,
  [card]: Math.max(0, hand[card] - 1),
})

export const countRemainingCards = (hand: Hand) => CARD_TYPES.reduce((sum, card) => sum + hand[card], 0)

export const getAvailableMoves = (hand: Hand) => CARD_TYPES.filter((card) => hand[card] > 0)

export const isTerminalState = (state: GameState) =>
  countRemainingCards(state.playerHand) === 0 && countRemainingCards(state.aiHand) === 0

export const evaluateState = (state: GameState) => state.aiScore - state.playerScore

export const applyRoundToState = (state: GameState, playerMove: CardType, aiMove: CardType): GameState => {
  const result = getMatchOutcome(playerMove, aiMove)
  const record: RoundRecord = {
    round: state.round,
    playerMove,
    aiMove,
    result,
  }

  return {
    playerHand: decrementCard(state.playerHand, playerMove),
    aiHand: decrementCard(state.aiHand, aiMove),
    playerScore: state.playerScore + (result === 'PLAYER_WIN' ? 1 : 0),
    aiScore: state.aiScore + (result === 'AI_WIN' ? 1 : 0),
    round: state.round + 1,
    history: [...state.history, record],
  }
}

export const summarizeState = (state: GameState) => ({
  round: state.round,
  playerScore: state.playerScore,
  aiScore: state.aiScore,
  playerRemaining: countRemainingCards(state.playerHand),
  aiRemaining: countRemainingCards(state.aiHand),
})

export const getWinnerLabel = (playerScore: number, aiScore: number) => {
  if (playerScore === aiScore) {
    return 'Empate técnico'
  }

  return playerScore > aiScore ? 'Humano vence' : 'IA vence'
}
