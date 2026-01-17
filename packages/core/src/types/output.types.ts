import type { Direction } from './ast.types';
import type { GraphEdge, GraphNode } from './graph.types';

/**
 * Final output from canvasdown after parsing and layout calculation
 */
export interface CanvasdownOutput<
  TNodeData = Record<string, unknown>,
  TEdgeData = Record<string, unknown>
> {
  /** All nodes with calculated positions */
  nodes: GraphNode<TNodeData>[];

  /** All edges */
  edges: GraphEdge<TEdgeData>[];

  /** Metadata about the processing */
  metadata: {
    /** Layout direction used */
    direction: Direction;

    /** Layout engine used */
    layoutEngine: 'dagre' | 'elkjs';
  };
}
