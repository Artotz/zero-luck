import { motion } from 'framer-motion'
import { Bot, Trophy } from 'lucide-react'
import { getOutcomeLabel } from './helpers'
import { PlayerHand } from './PlayerHand'
import { ScorePanel } from './ScorePanel'
import { type CardType, type GameState, type RoundRecord } from '../game/types'

interface GameBoardProps {
  gameState: GameState
  isGameOver: boolean
  winnerLabel: string | null
  lastRound: RoundRecord | null
  lastAiCard: CardType | null
  onPlayCard: (card: CardType) => void
}

export function GameBoard({
  gameState,
  isGameOver,
  winnerLabel,
  lastRound,
  lastAiCard,
  onPlayCard,
}: GameBoardProps) {
  return (
    <section className="panel game-board">
      <div className="game-topbar">
        <div>
          <p className="panel-kicker">Match State</p>
          <h2>Human vs AI</h2>
        </div>
        <div className="round-pill">Rodada {Math.min(gameState.round, 9)}</div>
      </div>

      <div className="score-grid">
        <ScorePanel label="Humano" score={gameState.playerScore} remaining={gameState.playerHand} tone="neutral" />
        <ScorePanel label="IA MAX" score={gameState.aiScore} remaining={gameState.aiHand} tone="positive" />
      </div>

      <div className="divider" />

      <PlayerHand hand={gameState.playerHand} disabled={isGameOver} onPlayCard={onPlayCard} />

      <div className="divider" />

      <div className="last-round-grid">
        <div className="last-round-card">
          <small>Ultima rodada</small>
          {lastRound ? (
            <>
              <strong>
                {lastRound.playerMove} vs {lastRound.aiMove}
              </strong>
              <div className="last-result-badge">{getOutcomeLabel(lastRound.result)}</div>
            </>
          ) : (
            <p className="empty-state">Escolha uma carta para iniciar a simulacao.</p>
          )}
        </div>

        <motion.div
          className={`ai-reveal-card${lastAiCard ? '' : ' empty'}`}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <small>Escolha da IA</small>
          {lastAiCard ? (
            <div className="ai-reveal">
              <strong>{lastAiCard}</strong>
              <Bot size={22} />
            </div>
          ) : (
            <p className="empty-state">Aguardando sua jogada.</p>
          )}
        </motion.div>
      </div>

      <div className="divider" />

      <div className="game-footer">
        {winnerLabel ? (
          <div className="winner-pill">
            <Trophy size={16} />
            {winnerLabel}
          </div>
        ) : (
          <p className="empty-state">A partida termina quando as duas maos chegam a zero.</p>
        )}
      </div>
    </section>
  )
}
