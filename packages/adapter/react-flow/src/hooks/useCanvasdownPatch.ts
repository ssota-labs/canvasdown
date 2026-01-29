import { useCallback } from 'react';
import type {
  CanvasdownCore,
  PatchOperation,
  PatchOperationUnion,
} from '@ssota-labs/canvasdown';
import { useReactFlow } from '@xyflow/react';
import { CanvasStateManager } from '../adapter/state-manager';
import {
  applyPatch,
  type ApplyPatchOptions,
  type TransformUpdateNode,
} from '../patch/patch-applier';

export interface UseCanvasdownPatchOptions {
  /** Preserve node positions when applying patches */
  preservePositions?: boolean;
  /** Layout direction for new edges */
  direction?: 'LR' | 'RL' | 'TB' | 'BT';
  /**
   * Customize how @update is applied (e.g. merge into data.properties,
   * transform content from markdown to TipTap JSON).
   */
  transformUpdateNode?: TransformUpdateNode;
}

export interface UseCanvasdownPatchReturn {
  /** Apply patch DSL to current canvas state */
  applyPatch: (patchDsl: string) => void;
  /** Apply patch operations directly */
  applyPatchOperations: (operations: PatchOperationUnion[]) => void;
  /** Get current node IDs */
  getNodeIds: () => string[];
  /** Get current edge IDs */
  getEdgeIds: () => string[];
}

/**
 * Hook for applying patch operations to React Flow canvas
 */
export function useCanvasdownPatch(
  core: CanvasdownCore,
  options: UseCanvasdownPatchOptions = {}
): UseCanvasdownPatchReturn {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const stateManager = new CanvasStateManager();

  const applyPatchDsl = useCallback(
    (patchDsl: string) => {
      try {
        // Parse patch DSL
        const operations = core.parsePatch(patchDsl);

        // Get current state
        const currentNodes = getNodes();
        const currentEdges = getEdges();

        // Validate operations
        const nodeIds = stateManager.getNodeIds(currentNodes);
        const validation = core.validatePatch(operations, nodeIds);

        if (!validation.valid) {
          const errorMessages = validation.errors
            .map(
              (err: { operation: PatchOperation; message: string }) =>
                `${err.operation.type}: ${err.message}`
            )
            .join('; ');
          throw new Error(`Patch validation failed: ${errorMessages}`);
        }

        // Apply patch
        const applyOptions: ApplyPatchOptions = {
          preservePositions: options.preservePositions ?? true,
          core,
          direction: options.direction || 'LR',
          transformUpdateNode: options.transformUpdateNode,
        };

        const { nodes, edges } = applyPatch(
          operations,
          currentNodes,
          currentEdges,
          applyOptions
        );

        // Update React Flow state
        setNodes(nodes);
        setEdges(edges);
      } catch (error: unknown) {
        console.error('Failed to apply patch:', error);
        throw error;
      }
    },
    [core, getNodes, getEdges, setNodes, setEdges, options]
  );

  const applyPatchOps = useCallback(
    (operations: PatchOperationUnion[]) => {
      try {
        // Get current state
        const currentNodes = getNodes();
        const currentEdges = getEdges();

        // Validate operations
        const nodeIds = stateManager.getNodeIds(currentNodes);
        const validation = core.validatePatch(operations, nodeIds);

        if (!validation.valid) {
          const errorMessages = validation.errors
            .map(
              (err: { operation: PatchOperation; message: string }) =>
                `${err.operation.type}: ${err.message}`
            )
            .join('; ');
          throw new Error(`Patch validation failed: ${errorMessages}`);
        }

        // Apply patch
        const applyOptions: ApplyPatchOptions = {
          preservePositions: options.preservePositions ?? true,
          core,
          direction: options.direction || 'LR',
          transformUpdateNode: options.transformUpdateNode,
        };

        const { nodes, edges } = applyPatch(
          operations,
          currentNodes,
          currentEdges,
          applyOptions
        );

        // Update React Flow state
        setNodes(nodes);
        setEdges(edges);
      } catch (error: unknown) {
        console.error('Failed to apply patch operations:', error);
        throw error;
      }
    },
    [core, getNodes, getEdges, setNodes, setEdges, options]
  );

  const getNodeIds = useCallback(() => {
    return stateManager.getNodeIds(getNodes());
  }, [getNodes, stateManager]);

  const getEdgeIds = useCallback(() => {
    return stateManager.getEdgeIds(getEdges());
  }, [getEdges, stateManager]);

  return {
    applyPatch: applyPatchDsl,
    applyPatchOperations: applyPatchOps,
    getNodeIds,
    getEdgeIds,
  };
}
