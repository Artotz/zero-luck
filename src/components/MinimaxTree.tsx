import { TreeNodeView } from './TreeNodeView'
import { type MinimaxNode } from '../game/types'

interface MinimaxTreeProps {
  tree: MinimaxNode
  highlightedPath: string[]
}

export function MinimaxTree({ tree, highlightedPath }: MinimaxTreeProps) {
  return (
    <div className="tree-wrapper">
      <TreeNodeView node={tree} highlightedPath={new Set(highlightedPath)} hasParent={false} />
    </div>
  )
}
