/**
 * Patch operation types for modifying existing canvas state.
 * These operations allow incremental updates to the canvas via DSL commands.
 */

export type PatchOperationType =
  | 'add'
  | 'update'
  | 'delete'
  | 'connect'
  | 'disconnect'
  | 'move'
  | 'resize';

/**
 * Base interface for all patch operations
 */
export interface PatchOperation {
  type: PatchOperationType;
  targetId: string;
}

/**
 * Add a new node to the canvas
 */
export interface AddOperation extends PatchOperation {
  type: 'add';
  nodeType: string;
  label: string;
  properties?: Record<string, unknown>;
  customProperties?: Array<{
    key: string;
    value: unknown;
  }>;
}

/**
 * Update properties of an existing node
 */
export interface UpdateOperation extends PatchOperation {
  type: 'update';
  properties?: Record<string, unknown>;
  customProperties?: Array<{
    key: string;
    value: unknown;
  }>;
}

/**
 * Delete a node from the canvas
 */
export interface DeleteOperation extends PatchOperation {
  type: 'delete';
}

/**
 * Connect two nodes with an edge
 */
export interface ConnectOperation extends PatchOperation {
  type: 'connect';
  targetId: string; // source node ID
  to: string; // target node ID
  label?: string;
  startLabel?: string;
  endLabel?: string;
  edgeType?: string;
  edgeData?: Record<string, unknown>;
}

/**
 * Disconnect two nodes (remove edge)
 */
export interface DisconnectOperation extends PatchOperation {
  type: 'disconnect';
  targetId: string; // source node ID
  from?: string; // if not specified, removes all edges from targetId
  to?: string; // target node ID (required if from is specified)
}

/**
 * Move a node to a new position
 */
export interface MoveOperation extends PatchOperation {
  type: 'move';
  position: { x: number; y: number };
}

/**
 * Resize a node
 */
export interface ResizeOperation extends PatchOperation {
  type: 'resize';
  size: { width: number; height: number };
}

/**
 * Union type of all patch operations
 */
export type PatchOperationUnion =
  | AddOperation
  | UpdateOperation
  | DeleteOperation
  | ConnectOperation
  | DisconnectOperation
  | MoveOperation
  | ResizeOperation;

/**
 * Validation result for patch operations
 */
export interface PatchValidationResult {
  valid: boolean;
  errors: Array<{
    operation: PatchOperation;
    message: string;
  }>;
}
