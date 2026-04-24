import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GameBoard } from './components/GameBoard'
import { MinimaxTree } from './components/MinimaxTree'
import { decideAiMove } from './game/minimax'
import {
  CARD_TYPES,
  INITIAL_HAND_COUNT,
  type CardType,
  type GameState,
  type RoundRecord,
} from './game/types'
import { applyRoundToState, countRemainingCards, getMatchOutcome, getWinnerLabel } from './game/rules'
import './App.css'

const createInitialHand = () =>
  CARD_TYPES.reduce(
    (hand, card) => {
      hand[card] = INITIAL_HAND_COUNT
      return hand
    },
    {} as Record<CardType, number>,
  )

const createInitialState = (): GameState => ({
  playerHand: createInitialHand(),
  aiHand: createInitialHand(),
  playerScore: 0,
  aiScore: 0,
  round: 1,
  history: [],
})

function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState())
  const [lastRound, setLastRound] = useState<RoundRecord | null>(null)
  const [lastAiDecision, setLastAiDecision] = useState(() => decideAiMove(createInitialState()))

  const isGameOver = countRemainingCards(gameState.playerHand) === 0 && countRemainingCards(gameState.aiHand) === 0
  const winnerLabel = isGameOver ? getWinnerLabel(gameState.playerScore, gameState.aiScore) : null

  const handlePlayCard = (playerMove: CardType) => {
    if (isGameOver || gameState.playerHand[playerMove] === 0) {
      return
    }

    const aiDecision = decideAiMove(gameState, playerMove)
    if (!aiDecision.card) {
      return
    }

    const result = getMatchOutcome(playerMove, aiDecision.card)
    const nextState = applyRoundToState(gameState, playerMove, aiDecision.card)
    const roundRecord = nextState.history.at(-1) ?? null

    setLastAiDecision(aiDecision)
    setLastRound(
      roundRecord ?? {
        round: gameState.round,
        playerMove,
        aiMove: aiDecision.card,
        result,
      },
    )
    setGameState(nextState)
  }

  const handleReset = () => {
    const initialState = createInitialState()
    setGameState(initialState)
    setLastRound(null)
    setLastAiDecision(decideAiMove(initialState))
  }

  return (
    <main className="app-shell">
      <div className="layout-grid compact-layout">
        <GameBoard
          gameState={gameState}
          isGameOver={isGameOver}
          winnerLabel={winnerLabel}
          lastRound={lastRound}
          lastAiCard={lastRound?.aiMove ?? null}
          lastAiDecision={lastAiDecision}
          onPlayCard={handlePlayCard}
          onReset={handleReset}
        />

        <section className="panel tree-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={lastAiDecision.tree.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
            >
              <MinimaxTree tree={lastAiDecision.tree} highlightedPath={lastAiDecision.path} />
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  )
}

export default App
