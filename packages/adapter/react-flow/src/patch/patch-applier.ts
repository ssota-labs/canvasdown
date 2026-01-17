import type {
  AddOperation,
  CanvasdownCore,
  ConnectOperation,
  DeleteOperation,
  DisconnectOperation,
  MoveOperation,
  PatchOperationUnion,
  ResizeOperation,
  UpdateOperation,
} from '@canvasdown/core';
import type { Edge, Node } from '@xyflow/react';
import { CanvasStateManager } from '../adapter/state-manager';

/**
 * Options for applying patch operations
 */
export interface ApplyPatchOptions {
  /** Preserve node positions (don't override with @move unless explicitly specified) */
  preservePositions: boolean;
  /** Core instance for building new nodes */
  core: CanvasdownCore;
  /** Layout direction for new edges */
  direction?: 'LR' | 'RL' | 'TB' | 'BT';
}

/**
 * Apply patch operations to current React Flow state
 */
export function applyPatch(
  operations: PatchOperationUnion[],
  currentNodes: Node[],
  currentEdges: Edge[],
  options: ApplyPatchOptions
): { nodes: Node[]; edges: Edge[] } {
  const stateManager = new CanvasStateManager();
  let nodes = [...currentNodes];
  let edges = [...currentEdges];

  for (const operation of operations) {
    switch (operation.type) {
      case 'update':
        nodes = applyUpdateOperation(operation, nodes, stateManager, options);
        break;

      case 'delete': {
        const result = applyDeleteOperation(
          operation,
          nodes,
          edges,
          stateManager
        );
        nodes = result.nodes;
        edges = result.edges;
        break;
      }

      case 'add':
        nodes = applyAddOperation(operation, nodes, stateManager, options);
        break;

      case 'connect':
        edges = applyConnectOperation(
          operation,
          edges,
          nodes,
          stateManager,
          options
        );
        break;

      case 'disconnect':
        edges = applyDisconnectOperation(operation, edges, stateManager);
        break;

      case 'move':
        nodes = applyMoveOperation(operation, nodes, stateManager, options);
        break;

      case 'resize':
        nodes = applyResizeOperation(operation, nodes, stateManager);
        break;
    }
  }

  return { nodes, edges };
}

/**
 * Apply @update operation
 */
function applyUpdateOperation(
  operation: UpdateOperation,
  nodes: Node[],
  stateManager: CanvasStateManager,
  _options: ApplyPatchOptions
): Node[] {
  const node = stateManager.findNodeById(nodes, operation.targetId);
  if (!node) {
    throw new Error(`Node "${operation.targetId}" not found for update`);
  }

  // Update properties
  if (operation.properties) {
    node.data = {
      ...node.data,
      ...operation.properties,
    };
  }

  // Update custom properties (if supported)
  // Note: Custom properties are typically stored in node.data
  if (operation.customProperties) {
    for (const customProp of operation.customProperties) {
      // Store custom property in data
      // Convert from { key, value } to { schemaId, value } format
      if (!node.data.customProperties) {
        node.data.customProperties = [];
      }
      const existingIndex = (
        node.data.customProperties as Array<{
          schemaId: string;
          value: unknown;
        }>
      ).findIndex(cp => cp.schemaId === customProp.key);
      if (existingIndex >= 0) {
        (node.data.customProperties as any[])[existingIndex] = {
          schemaId: customProp.key,
          value: customProp.value,
        };
      } else {
        (node.data.customProperties as any[]).push({
          schemaId: customProp.key,
          value: customProp.value,
        });
      }
    }
  }

  return nodes.map(n => (n.id === operation.targetId ? node : n));
}

/**
 * Apply @delete operation
 */
function applyDeleteOperation(
  operation: DeleteOperation,
  nodes: Node[],
  edges: Edge[],
  stateManager: CanvasStateManager
): { nodes: Node[]; edges: Edge[] } {
  // Remove all edges connected to this node
  const connectedEdges = [
    ...stateManager.findEdgesBySource(edges, operation.targetId),
    ...stateManager.findEdgesByTarget(edges, operation.targetId),
  ];
  const edgeIdsToRemove = new Set(connectedEdges.map(e => e.id));

  return {
    nodes: nodes.filter(n => n.id !== operation.targetId),
    edges: edges.filter(e => !edgeIdsToRemove.has(e.id)),
  };
}

/**
 * Apply @add operation
 */
function applyAddOperation(
  operation: AddOperation,
  nodes: Node[],
  stateManager: CanvasStateManager,
  options: ApplyPatchOptions
): Node[] {
  // Check if node already exists
  if (stateManager.hasNode(nodes, operation.targetId)) {
    throw new Error(`Node "${operation.targetId}" already exists`);
  }

  // Use core's buildNodeFromAST to create the node
  // Convert customProperties from { key, value } to { schemaId, value } format
  const graphNode = options.core.buildNodeFromAST({
    id: operation.targetId,
    type: operation.nodeType,
    label: operation.label,
    properties: operation.properties,
    customProperties: operation.customProperties
      ? operation.customProperties.map(
          (cp: { key: string; value: unknown }) => ({
            schemaId: cp.key,
            value: cp.value,
          })
        )
      : undefined,
  });

  // Convert to React Flow node
  // Use a default position (can be adjusted later)
  const reactFlowNode: Node = {
    id: graphNode.id,
    type: graphNode.type,
    position: { x: 0, y: 0 }, // Default position, can be adjusted
    data: {
      ...graphNode.data,
      title: operation.label,
    },
    width: graphNode.size.width,
    height: graphNode.size.height,
  };

  return [...nodes, reactFlowNode];
}

/**
 * Apply @connect operation
 */
function applyConnectOperation(
  operation: ConnectOperation,
  edges: Edge[],
  nodes: Node[],
  stateManager: CanvasStateManager,
  options: ApplyPatchOptions
): Edge[] {
  // Check if edge already exists
  if (stateManager.hasEdge(edges, operation.targetId, operation.to)) {
    // Update existing edge
    return edges.map(edge => {
      if (edge.source === operation.targetId && edge.target === operation.to) {
        return {
          ...edge,
          ...(operation.label && { label: operation.label }),
          ...(operation.edgeData && {
            data: {
              ...edge.data,
              ...operation.edgeData,
            },
          }),
        };
      }
      return edge;
    });
  }

  // Create new edge
  const direction = options.direction || 'LR';
  const handleMap = {
    LR: { sourceHandle: 'right', targetHandle: 'left' },
    RL: { sourceHandle: 'left', targetHandle: 'right' },
    TB: { sourceHandle: 'bottom', targetHandle: 'top' },
    BT: { sourceHandle: 'top', targetHandle: 'bottom' },
  } as const;

  const handles = handleMap[direction];
  const edgeId = `${operation.targetId}-${operation.to}`;

  const newEdge: Edge = {
    id: edgeId,
    source: operation.targetId,
    target: operation.to,
    sourceHandle: handles.sourceHandle,
    targetHandle: handles.targetHandle,
    ...(operation.label && { label: operation.label }),
    type: 'default',
    data: {
      ...(operation.edgeData || {}),
    },
  };

  return [...edges, newEdge];
}

/**
 * Apply @disconnect operation
 */
function applyDisconnectOperation(
  operation: DisconnectOperation,
  edges: Edge[],
  _stateManager: CanvasStateManager
): Edge[] {
  if (operation.to) {
    // Remove specific edge
    return edges.filter(
      edge =>
        !(edge.source === operation.targetId && edge.target === operation.to)
    );
  } else {
    // Remove all edges from source node
    return edges.filter(edge => edge.source !== operation.targetId);
  }
}

/**
 * Apply @move operation
 */
function applyMoveOperation(
  operation: MoveOperation,
  nodes: Node[],
  stateManager: CanvasStateManager,
  _options: ApplyPatchOptions
): Node[] {
  const node = stateManager.findNodeById(nodes, operation.targetId);
  if (!node) {
    throw new Error(`Node "${operation.targetId}" not found for move`);
  }

  // Only update position if preservePositions is false or operation explicitly requests it
  // Since @move is explicit, we always apply it
  return nodes.map(n =>
    n.id === operation.targetId ? { ...n, position: operation.position } : n
  );
}

/**
 * Apply @resize operation
 */
function applyResizeOperation(
  operation: ResizeOperation,
  nodes: Node[],
  stateManager: CanvasStateManager
): Node[] {
  const node = stateManager.findNodeById(nodes, operation.targetId);
  if (!node) {
    throw new Error(`Node "${operation.targetId}" not found for resize`);
  }

  return nodes.map(n =>
    n.id === operation.targetId
      ? {
          ...n,
          width: operation.size.width,
          height: operation.size.height,
        }
      : n
  );
}
