import { useMemo } from 'react';
import type { Edge, Node, NodeTypes } from '@xyflow/react';
import {
  parseCanvasdown,
  type ParseCanvasdownOptions,
} from '../parseCanvasdown';
import type { ExtractNodeType } from '../types';

export type UseCanvasdownOptions<TNodeTypes extends NodeTypes = NodeTypes> =
  ParseCanvasdownOptions<TNodeTypes>;

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
    return parseCanvasdown(dsl, options);
  }, [dsl, options.core, options.direction]);

  return {
    nodes,
    edges,
    error,
    loading: false,
  };
}
