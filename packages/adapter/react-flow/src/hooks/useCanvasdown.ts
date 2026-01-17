import { useMemo } from 'react';
import type { CanvasdownCore } from '@canvasdown/core';
import type { Edge, Node } from '@xyflow/react';
import { toReactFlowEdges, toReactFlowNodes } from '../adapter/to-react-flow';

export interface UseCanvasdownOptions {
  /** Canvasdown core instance */
  core: CanvasdownCore;
  /** Layout direction */
  direction?: 'LR' | 'RL' | 'TB' | 'BT';
}

export interface UseCanvasdownReturn {
  /** React Flow nodes */
  nodes: Node[];
  /** React Flow edges */
  edges: Edge[];
  /** Parse error message, if any */
  error: string | null;
  /** Whether parsing is in progress (always false for synchronous parsing) */
  loading: boolean;
}

/**
 * Hook to parse Canvasdown DSL and convert to React Flow nodes/edges
 */
export function useCanvasdown(
  dsl: string,
  options: UseCanvasdownOptions
): UseCanvasdownReturn {
  const { nodes, edges, error } = useMemo(() => {
    try {
      const result = options.core.parseAndLayout(dsl);
      const direction = options.direction || result.metadata.direction || 'LR';
      return {
        nodes: toReactFlowNodes(result.nodes),
        edges: toReactFlowEdges(result.edges, direction),
        error: null,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        nodes: [],
        edges: [],
        error: errorMessage,
      };
    }
  }, [dsl, options.core, options.direction]);

  return {
    nodes,
    edges,
    error,
    loading: false,
  };
}
