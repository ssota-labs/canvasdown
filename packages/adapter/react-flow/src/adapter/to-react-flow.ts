import type { GraphEdge, GraphNode } from '@ssota-labs/canvasdown';
import type { Edge, Node } from '@xyflow/react';

/**
 * Convert Canvasdown GraphNode to React Flow Node
 */
export function toReactFlowNodes(graphNodes: GraphNode[]): Node[] {
  return graphNodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node.data,
      title: node.data.title || node.id,
    },
    width: node.size.width,
    height: node.size.height,
  }));
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
  return graphEdges.map(edge => ({
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
  }));
}

/**
 * Convert Canvasdown output to React Flow graph
 */
export function toReactFlowGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  direction: 'LR' | 'RL' | 'TB' | 'BT' = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: toReactFlowNodes(nodes),
    edges: toReactFlowEdges(edges, direction),
  };
}
