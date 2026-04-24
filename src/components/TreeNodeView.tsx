import clsx from 'clsx'
import { motion } from 'framer-motion'
import { GitBranch, Scissors, ScrollText, Shield } from 'lucide-react'
import { type CardType, type MinimaxNode } from '../game/types'

interface TreeNodeViewProps {
  node: MinimaxNode
  isHighlighted: boolean
}

const iconMap: Record<CardType, typeof Shield> = {
  Rock: Shield,
  Paper: ScrollText,
  Scissors: Scissors,
}

const formatBound = (value: number) => (Number.isFinite(value) ? value.toString() : value > 0 ? '+inf' : '-inf')

const getTone = (value: number) => {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

export function TreeNodeView({ node, isHighlighted }: TreeNodeViewProps) {
  const Icon = node.move ? iconMap[node.move] : GitBranch
  const tone = getTone(node.value)

  return (
    <motion.article
      className={clsx('tree-node', tone, node.pruned && 'pruned', isHighlighted && 'highlighted')}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
    >
      <div className="tree-node-header">
        <div>
          <div className="node-actor">{node.actor}</div>
          <div className="node-move">{node.move ?? 'Root'}</div>
        </div>
        <Icon size={18} />
      </div>

      <div className="node-scoreline">
        <span>v(node)</span>
        <span className="node-value">{node.value}</span>
      </div>

      <div className="node-badges">
        <span className="node-badge">d={node.depth}</span>
        {node.pruned ? <span className="node-badge pruned">PRUNED</span> : null}
      </div>

      <div className="node-bounds">
        <span>a={formatBound(node.alpha)}</span>
        <span>b={formatBound(node.beta)}</span>
      </div>

      <p className="node-state">
        R{node.state.round} - P {node.state.playerScore} / AI {node.state.aiScore}
      </p>
      <p className="node-state">
        Rem {node.state.playerRemaining}:{node.state.aiRemaining}
      </p>
    </motion.article>
  )
}
