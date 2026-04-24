import { useState } from 'react'
import { Minus, Plus, ScanSearch } from 'lucide-react'
import { TreeNodeView } from './TreeNodeView'
import { type MinimaxNode } from '../game/types'

interface MinimaxTreeProps {
  tree: MinimaxNode
  highlightedPath: string[]
}

interface PositionedNode {
  node: MinimaxNode
  x: number
  y: number
}

interface Edge {
  from: string
  to: string
}

const NODE_WIDTH = 72
const NODE_HEIGHT = 72
const HORIZONTAL_GAP = 44
const VERTICAL_GAP = 74
const PADDING = 28
const ZOOM_STEPS = [0.6, 0.8, 1, 1.2, 1.5] as const

function layoutTree(tree: MinimaxNode) {
  const positioned = new Map<string, PositionedNode>()
  const edges: Edge[] = []
  let leafIndex = 0
  let maxDepth = 0

  const visit = (node: MinimaxNode, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth)
    const childCenters = node.children.map((child) => {
      edges.push({ from: node.id, to: child.id })
      return visit(child, depth + 1)
    })

    const centerX =
      childCenters.length > 0
        ? childCenters.reduce((sum, value) => sum + value, 0) / childCenters.length
        : leafIndex++ * (NODE_WIDTH + HORIZONTAL_GAP)

    positioned.set(node.id, {
      node,
      x: centerX,
      y: depth * (NODE_HEIGHT + VERTICAL_GAP),
    })

    return centerX
  }

  visit(tree, 0)

  const canvasWidth = Math.max(1, leafIndex) * (NODE_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP + PADDING * 2
  const canvasHeight = (maxDepth + 1) * NODE_HEIGHT + maxDepth * VERTICAL_GAP + PADDING * 2

  return {
    nodes: Array.from(positioned.values()),
    edges,
    width: canvasWidth,
    height: canvasHeight,
  }
}

const buildEdgePath = (from: PositionedNode, to: PositionedNode) => {
  const startX = from.x + NODE_WIDTH / 2 + PADDING
  const startY = from.y + NODE_HEIGHT + PADDING
  const endX = to.x + NODE_WIDTH / 2 + PADDING
  const endY = to.y + PADDING
  const midY = startY + (endY - startY) / 2

  return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
}

export function MinimaxTree({ tree, highlightedPath }: MinimaxTreeProps) {
  const [zoomIndex, setZoomIndex] = useState(2)
  const highlighted = new Set(highlightedPath)
  const { nodes, edges, width, height } = layoutTree(tree)
  const nodeLookup = new Map(nodes.map((entry) => [entry.node.id, entry]))
  const zoom = ZOOM_STEPS[zoomIndex]

  return (
    <div className="tree-wrapper">
      <div className="tree-toolbar">
        <div className="tree-toolbar-group">
          <button
            type="button"
            className="tree-zoom-button"
            onClick={() => setZoomIndex((current) => Math.max(0, current - 1))}
            disabled={zoomIndex === 0}
            aria-label="Diminuir zoom"
          >
            <Minus size={16} />
          </button>
          <span className="tree-zoom-level">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="tree-zoom-button"
            onClick={() => setZoomIndex((current) => Math.min(ZOOM_STEPS.length - 1, current + 1))}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            aria-label="Aumentar zoom"
          >
            <Plus size={16} />
          </button>
        </div>
        <button type="button" className="tree-zoom-button" onClick={() => setZoomIndex(2)} aria-label="Resetar zoom">
          <ScanSearch size={16} />
        </button>
      </div>

      <div className="tree-stage">
        <div className="tree-canvas" style={{ width: width * zoom, height: height * zoom }}>
          <div className="tree-zoom-layer" style={{ width, height, transform: `scale(${zoom})` }}>
        <svg className="tree-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          {edges.map((edge) => {
            const from = nodeLookup.get(edge.from)
            const to = nodeLookup.get(edge.to)

            if (!from || !to) {
              return null
            }

            const edgeHighlighted = highlighted.has(edge.from) && highlighted.has(edge.to)

            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={buildEdgePath(from, to)}
                className={clsxEdge(edgeHighlighted, to.node.pruned)}
              />
            )
          })}
        </svg>

            {nodes.map(({ node, x, y }) => (
              <div
                key={node.id}
                className="tree-node-slot"
                style={{ width: NODE_WIDTH, transform: `translate(${x + PADDING}px, ${y + PADDING}px)` }}
              >
                <TreeNodeView node={node} isHighlighted={highlighted.has(node.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function clsxEdge(isHighlighted: boolean, isPruned: boolean) {
  if (isPruned) {
    return 'tree-edge pruned'
  }

  return isHighlighted ? 'tree-edge highlighted' : 'tree-edge'
}
