import { useEffect, useMemo, useRef, useState } from 'react'
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
const MIN_SCALE = 0.2
const MAX_SCALE = 2.4
const DEFAULT_SCALE = 0.7

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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function clsxEdge(isHighlighted: boolean, isPruned: boolean) {
  if (isPruned) {
    return 'tree-edge pruned'
  }

  return isHighlighted ? 'tree-edge highlighted' : 'tree-edge'
}

export function MinimaxTree({ tree, highlightedPath }: MinimaxTreeProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)
  const hasInitializedViewRef = useRef(false)
  const scaleRef = useRef(DEFAULT_SCALE)
  const highlighted = useMemo(() => new Set(highlightedPath), [highlightedPath])
  const { nodes, edges, width, height } = useMemo(() => layoutTree(tree), [tree])
  const nodeLookup = useMemo(() => new Map(nodes.map((entry) => [entry.node.id, entry])), [nodes])
  const [scale, setScale] = useState(DEFAULT_SCALE)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  useEffect(() => {
    const stage = stageRef.current

    if (!stage) {
      return
    }

    if (!hasInitializedViewRef.current) {
      const centeredX = (stage.clientWidth - width * DEFAULT_SCALE) / 2
      const centeredY = (stage.clientHeight - height * DEFAULT_SCALE) / 2

      setScale(DEFAULT_SCALE)
      setOffset({
        x: centeredX,
        y: centeredY,
      })
      hasInitializedViewRef.current = true
      return
    }

    setOffset((currentOffset) => ({
      x: (stage.clientWidth - width * scaleRef.current) / 2,
      y: currentOffset.y,
    }))
  }, [tree, width, height])

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()

    const stage = stageRef.current

    if (!stage) {
      return
    }

    const rect = stage.getBoundingClientRect()
    const pointerX = event.clientX - rect.left
    const pointerY = event.clientY - rect.top
    const zoomFactor = event.deltaY < 0 ? 1.12 : 0.88

    setScale((currentScale) => {
      const nextScale = clamp(currentScale * zoomFactor, MIN_SCALE, MAX_SCALE)

      if (nextScale === currentScale) {
        return currentScale
      }

      setOffset((currentOffset) => ({
        x: pointerX - ((pointerX - currentOffset.x) / currentScale) * nextScale,
        y: pointerY - ((pointerY - currentOffset.y) / currentScale) * nextScale,
      }))

      return nextScale
    })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    dragStateRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    }

    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current

    if (!dragState) {
      return
    }

    const deltaX = event.clientX - dragState.x
    const deltaY = event.clientY - dragState.y

    setOffset({
      x: dragState.offsetX + deltaX,
      y: dragState.offsetY + deltaY,
    })
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null
    setIsDragging(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <div
      ref={stageRef}
      className={`tree-wrapper interactive${isDragging ? ' dragging' : ''}`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="tree-stage">
        <div
          className="tree-canvas"
          style={{
            width,
            height,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
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
  )
}
