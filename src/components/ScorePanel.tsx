import { type Hand } from '../game/types'

interface ScorePanelProps {
  label: string
  score: number
  remaining: Hand
  tone: 'positive' | 'neutral'
}

export function ScorePanel({ label, score, remaining, tone }: ScorePanelProps) {
  return (
    <article className={`score-card ${tone}`}>
      <small>{label}</small>
      <strong>{score}</strong>
      <p className="node-state">
        Rock {remaining.Rock} · Paper {remaining.Paper} · Scissors {remaining.Scissors}
      </p>
    </article>
  )
}
