/**
 * Graph data types for canvasdown.
 * These represent the final graph structure with positions calculated by the layout engine.
 */

/**
 * A node in the graph with calculated position
 */
export interface GraphNode<TData = Record<string, unknown>> {
  /** Unique identifier for the node */
  id: string;

  /** Block type name */
  type: string;

  /** Calculated position from layout engine */
  position: { x: number; y: number };

  /** Size of the node */
  size: { width: number; height: number };

  /** Node data (merged defaultProperties + DSL properties) */
  data: TData;

  /** Optional parent zone/group ID if this node is contained within a zone */
  parentId?: string;
}

/**
 * An edge in the graph
 */
export interface GraphEdge<TEdgeData = Record<string, unknown>> {
  /** Unique identifier for the edge */
  id: string;

  /** Source node ID */
  source: string;

  /** Target node ID */
  target: string;

  /** Optional label for the edge (center position) */
  label?: string;

  /** Optional label at the start (source) position */
  startLabel?: string;

  /** Optional label at the end (target) position */
  endLabel?: string;

  /** Edge shape type */
  shape?: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier';

  /** Optional edge style */
  style?: {
    stroke: string;
    strokeWidth: number;
  };

  /** Edge data (merged defaultData + DSL edgeData) */
  data: TEdgeData;
}
