import type { GraphEdge, GraphNode } from '@ssota-labs/canvasdown';
import type { Edge, Node, NodeTypes } from '@xyflow/react';
import type { ExtractNodeType } from '../types';

/**
 * Convert Canvasdown GraphNode to React Flow Node
 *
 * @template TNodeTypes - NodeTypes object for type safety
 *
 * @example
 * ```typescript
 * const nodeTypes = {
 *   shape: ShapeBlock,
 *   markdown: MarkdownBlock,
 * } as const;
 *
 * const nodes = toReactFlowNodes<typeof nodeTypes>(graphNodes);
 * // nodes의 type 필드가 'shape' | 'markdown'으로 제한됨
 * ```
 */
export function toReactFlowNodes<TNodeTypes extends NodeTypes = NodeTypes>(
  graphNodes: GraphNode[]
): Node<Record<string, unknown>, ExtractNodeType<TNodeTypes>>[] {
  return graphNodes.map(node => {
    const reactFlowNode: Node<
      Record<string, unknown>,
      ExtractNodeType<TNodeTypes>
    > = {
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        title: node.data.title || node.id,
      },
      width: node.size.width,
      height: node.size.height,
    };

    // Add parentId for group nodes (children of zones)
    if (node.parentId) {
      reactFlowNode.parentId = node.parentId;
      // Use extent from data if provided
      // If extent is not set in data, leave it undefined (no constraint)
      // #region agent log
      fetch(
        'http://127.0.0.1:7246/ingest/cd0008d3-9a3e-45ef-93d5-cb4299cc3388',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'to-react-flow.ts:41',
            message: 'Converting node with parentId',
            data: {
              nodeId: node.id,
              parentId: node.parentId,
              position: node.position,
              dataExtent: (node.data as any)?.extent,
              dataKeys: Object.keys(node.data),
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'A',
          }),
        }
      ).catch(() => {});
      // #endregion
      const extent = (
        node.data as {
          extent?: 'parent' | [[number, number], [number, number]] | null;
        }
      )?.extent;
      // #region agent log
      fetch(
        'http://127.0.0.1:7246/ingest/cd0008d3-9a3e-45ef-93d5-cb4299cc3388',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'to-react-flow.ts:50',
            message: 'Extent value extracted',
            data: {
              nodeId: node.id,
              extent,
              extentType: typeof extent,
              isUndefined: extent === undefined,
              isNull: extent === null,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'A',
          }),
        }
      ).catch(() => {});
      // #endregion
      if (extent !== undefined && extent !== null) {
        reactFlowNode.extent = extent;
        // #region agent log
        fetch(
          'http://127.0.0.1:7246/ingest/cd0008d3-9a3e-45ef-93d5-cb4299cc3388',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'to-react-flow.ts:52',
              message: 'Extent set on React Flow node',
              data: { nodeId: node.id, extent: reactFlowNode.extent },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            }),
          }
        ).catch(() => {});
        // #endregion
      } else {
        // #region agent log
        fetch(
          'http://127.0.0.1:7246/ingest/cd0008d3-9a3e-45ef-93d5-cb4299cc3388',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'to-react-flow.ts:55',
              message: 'Extent NOT set on React Flow node',
              data: {
                nodeId: node.id,
                extent,
                hasParentId: !!reactFlowNode.parentId,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'B',
            }),
          }
        ).catch(() => {});
        // #endregion
      }
      // If extent is undefined/null, React Flow will not constrain the node
    }
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/cd0008d3-9a3e-45ef-93d5-cb4299cc3388', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'to-react-flow.ts:31',
        message: 'Final React Flow node',
        data: {
          nodeId: reactFlowNode.id,
          parentId: reactFlowNode.parentId,
          extent: reactFlowNode.extent,
          position: reactFlowNode.position,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion

    return reactFlowNode;
  });
}

/**
 * Handle position mapping based on layout direction
 */
const handleMap = {
  LR: { sourceHandle: 'right', targetHandle: 'left' },
  RL: { sourceHandle: 'left', targetHandle: 'right' },
  TB: { sourceHandle: 'bottom', targetHandle: 'top' },
  BT: { sourceHandle: 'top', targetHandle: 'bottom' },
} as const;

/**
 * Convert Canvasdown GraphEdge to React Flow Edge
 */
export function toReactFlowEdges(
  graphEdges: GraphEdge[],
  direction: 'LR' | 'RL' | 'TB' | 'BT' = 'LR'
): Edge[] {
  const handles = handleMap[direction];
  return graphEdges.map(edge => {
    const reactFlowEdge: Edge = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      label: edge.label,
      type: 'default',
      style: edge.style,
      data: {
        ...edge.data,
        startLabel: edge.startLabel,
        endLabel: edge.endLabel,
      },
    };

    // Add markers if they exist (React Flow accepts string or EdgeMarker)
    if (edge.markerEnd !== undefined) {
      reactFlowEdge.markerEnd = edge.markerEnd as any;
    }
    if (edge.markerStart !== undefined) {
      reactFlowEdge.markerStart = edge.markerStart as any;
    }

    return reactFlowEdge;
  });
}

/**
 * Convert Canvasdown output to React Flow graph
 */
export function toReactFlowGraph<TNodeTypes extends NodeTypes = NodeTypes>(
  nodes: GraphNode[],
  edges: GraphEdge[],
  direction: 'LR' | 'RL' | 'TB' | 'BT' = 'LR'
): {
  nodes: Node<Record<string, unknown>, ExtractNodeType<TNodeTypes>>[];
  edges: Edge[];
} {
  return {
    nodes: toReactFlowNodes<TNodeTypes>(nodes),
    edges: toReactFlowEdges(edges, direction),
  };
}
