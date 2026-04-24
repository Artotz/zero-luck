import { type RoundResult } from '../game/types'

export const getOutcomeLabel = (result: RoundResult) => {
  if (result === 'DRAW') {
    return 'Empate'
  }

  return result === 'AI_WIN' ? 'IA venceu a rodada' : 'Humano venceu a rodada'
}
