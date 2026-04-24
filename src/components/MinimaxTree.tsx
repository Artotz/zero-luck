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

const NODE_WIDTH = 220
const NODE_HEIGHT = 170
const HORIZONTAL_GAP = 52
const VERTICAL_GAP = 68
const PADDING = 28

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
  const highlighted = new Set(highlightedPath)
  const { nodes, edges, width, height } = layoutTree(tree)
  const nodeLookup = new Map(nodes.map((entry) => [entry.node.id, entry]))

  return (
    <div className="tree-wrapper">
      <div className="tree-canvas" style={{ width, height }}>
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
  )
}

function clsxEdge(isHighlighted: boolean, isPruned: boolean) {
  if (isPruned) {
    return 'tree-edge pruned'
  }

  return isHighlighted ? 'tree-edge highlighted' : 'tree-edge'
}
