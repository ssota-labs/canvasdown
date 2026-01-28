import type { CanvasdownCore } from '@ssota-labs/canvasdown';
import type { Edge, Node, NodeTypes } from '@xyflow/react';
import { toReactFlowGraph } from './adapter/to-react-flow';
import type { ExtractNodeType } from './types';

export interface ParseCanvasdownOptions<
  TNodeTypes extends NodeTypes = NodeTypes
> {
  /** Canvasdown core instance */
  core: CanvasdownCore;
  /** Layout direction (overrides DSL direction if provided) */
  direction?: 'LR' | 'RL' | 'TB' | 'BT';
  /** React Flow node types for type safety */
  nodeTypes?: TNodeTypes;
}

export interface ParseCanvasdownResult<
  TNodeTypes extends NodeTypes = NodeTypes
> {
  /** React Flow nodes */
  nodes: Node<Record<string, unknown>, ExtractNodeType<TNodeTypes>>[];
  /** React Flow edges */
  edges: Edge[];
  /** Parse error message, if any */
  error: string | null;
}

/**
 * Parse Canvasdown DSL and convert to React Flow nodes/edges synchronously
 *
 * This is a pure function that doesn't depend on React render cycles.
 * Use this when you need direct control over when parsing happens,
 * or when working outside of React components.
 *
 * @example
 * ```typescript
 * const nodeTypes = {
 *   shape: ShapeBlock,
 *   markdown: MarkdownBlock,
 * } as const;
 *
 * const { nodes, edges, error } = parseCanvasdown(dsl, {
 *   core,
 *   nodeTypes, // nodes의 type이 'shape' | 'markdown'으로 제한됨
 * });
 *
 * if (error) {
 *   console.error('Parse error:', error);
 * } else {
 *   setNodes(nodes);
 *   setEdges(edges);
 * }
 * ```
 */
export function parseCanvasdown<TNodeTypes extends NodeTypes = NodeTypes>(
  dsl: string,
  options: ParseCanvasdownOptions<TNodeTypes>
): ParseCanvasdownResult<TNodeTypes> {
  try {
    const result = options.core.parseAndLayout(dsl);
    const direction = options.direction || result.metadata.direction || 'LR';
    const { nodes, edges } = toReactFlowGraph<TNodeTypes>(
      result.nodes,
      result.edges,
      direction
    );

    return {
      nodes,
      edges,
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
}
