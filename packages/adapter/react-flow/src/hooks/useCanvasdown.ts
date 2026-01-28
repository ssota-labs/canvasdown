import { useMemo } from 'react';
import type { CanvasdownCore } from '@ssota-labs/canvasdown';
import type { Edge, Node, NodeTypes } from '@xyflow/react';
import { toReactFlowEdges, toReactFlowNodes } from '../adapter/to-react-flow';
import type { ExtractNodeType } from '../types';

export interface UseCanvasdownOptions<
  TNodeTypes extends NodeTypes = NodeTypes
> {
  /** Canvasdown core instance */
  core: CanvasdownCore;
  /** Layout direction */
  direction?: 'LR' | 'RL' | 'TB' | 'BT';
  /** React Flow node types for type safety */
  nodeTypes?: TNodeTypes;
}

export interface UseCanvasdownReturn<TNodeTypes extends NodeTypes = NodeTypes> {
  /** React Flow nodes */
  nodes: Node<Record<string, unknown>, ExtractNodeType<TNodeTypes>>[];
  /** React Flow edges */
  edges: Edge[];
  /** Parse error message, if any */
  error: string | null;
  /** Whether parsing is in progress (always false for synchronous parsing) */
  loading: boolean;
}

/**
 * Hook to parse Canvasdown DSL and convert to React Flow nodes/edges
 *
 * @example
 * ```typescript
 * const nodeTypes = {
 *   shape: ShapeBlock,
 *   markdown: MarkdownBlock,
 * } as const;
 *
 * const { nodes, edges } = useCanvasdown(dsl, {
 *   core,
 *   nodeTypes, // nodes의 type이 'shape' | 'markdown'으로 제한됨
 * });
 * ```
 */
export function useCanvasdown<TNodeTypes extends NodeTypes = NodeTypes>(
  dsl: string,
  options: UseCanvasdownOptions<TNodeTypes>
): UseCanvasdownReturn<TNodeTypes> {
  const { nodes, edges, error } = useMemo(() => {
    try {
      const result = options.core.parseAndLayout(dsl);
      const direction = options.direction || result.metadata.direction || 'LR';
      return {
        nodes: toReactFlowNodes<TNodeTypes>(result.nodes),
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
