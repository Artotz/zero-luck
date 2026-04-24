import { motion } from 'framer-motion'
import { Hand as HandIcon, RotateCcw, ScrollText, Swords, Trophy } from 'lucide-react'
import { type AiDecision, type CardType, type GameState, type Hand, type RoundRecord } from '../game/types'

interface GameBoardProps {
  gameState: GameState
  isGameOver: boolean
  winnerLabel: string | null
  lastRound: RoundRecord | null
  lastAiCard: CardType | null
  lastAiDecision: AiDecision
  onPlayCard: (card: CardType) => void
  onReset: () => void
}

const iconMap = {
  Rock: HandIcon,
  Paper: ScrollText,
  Scissors: Swords,
}

function HandStrip({
  hand,
  activeMove,
  disabled,
  interactive,
  onPlayCard,
}: {
  hand: Hand
  activeMove: CardType | null
  disabled: boolean
  interactive: boolean
  onPlayCard?: (card: CardType) => void
}) {
  return (
    <div className="hand-strip">
      <div className="hand-strip-buttons">
        {(Object.keys(hand) as CardType[]).map((card) => {
          const Icon = iconMap[card]
          const isDisabled = disabled || hand[card] === 0 || !interactive
          const isActive = activeMove === card

          return (
            <motion.button
              key={card}
              type="button"
              className={`compact-card${isActive ? ' active' : ''}${!interactive ? ' ghost' : ''}`}
              disabled={isDisabled}
              onClick={interactive && onPlayCard ? () => onPlayCard(card) : undefined}
              whileHover={!isDisabled ? { y: -2 } : undefined}
              whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            >
              <Icon size={20} />
              <span className="compact-card-badge">x{hand[card]}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export function GameBoard({
  gameState,
  isGameOver,
  winnerLabel,
  lastRound,
  lastAiCard,
  lastAiDecision,
  onPlayCard,
  onReset,
}: GameBoardProps) {
  return (
    <section className="panel game-board compact-board">
      <div className="match-line">
        <HandStrip
          hand={gameState.playerHand}
          activeMove={lastRound?.playerMove ?? null}
          disabled={isGameOver}
          interactive
          onPlayCard={onPlayCard}
        />

        <div className="round-center">
          <div className="round-center-line">
            <p className="round-center-label">Rodada {Math.min(gameState.round, 9)}</p>
            <span className="round-center-dot">•</span>
            <strong>Humano {gameState.playerScore}</strong>
            <span className="round-center-dot">•</span>
            <strong>IA {gameState.aiScore}</strong>
            <button type="button" className="reset-button icon-only center-reset" onClick={onReset} aria-label="Reiniciar partida">
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="round-center-status">
            {winnerLabel ? (
              <div className="winner-pill">
                <Trophy size={16} />
                {winnerLabel}
              </div>
            ) : null}
          </div>
        </div>

        <HandStrip hand={gameState.aiHand} activeMove={lastAiCard} disabled interactive={false} />
      </div>

      <div className="board-decision-line">
        <span>{lastAiDecision.card ?? 'Aguardando jogada'}</span>
        <span>{lastAiDecision.value >= 0 ? `+${lastAiDecision.value}` : lastAiDecision.value}</span>
        <span>Profundidade limite: {lastAiDecision.exploredDepth}</span>
        <span>Nos analisados: {lastAiDecision.nodeCount}</span>
        <span>{lastAiDecision.truncated ? 'Busca parcial com heuristica' : 'Busca terminal completa'}</span>
      </div>
    </section>
  )
}
