import { useCallback } from 'react';
import type {
  CanvasdownCore,
  PatchOperation,
  PatchOperationUnion,
} from '@ssota-labs/canvasdown';
import { useReactFlow } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import { CanvasStateManager } from '../adapter/state-manager';
import {
  applyPatch,
  type ApplyPatchOptions,
  type TransformUpdateNode,
} from '../patch/patch-applier';

/** Result passed to onPatchApplied after a patch is successfully applied */
export interface PatchAppliedResult {
  /** Operations that were just applied */
  operations: PatchOperationUnion[];
  /** Nodes after applying the patch */
  nodes: Node[];
  /** Edges after applying the patch */
  edges: Edge[];
  /** Present only when applied via applyPatch(dsl); undefined when via applyPatchOperations(ops) */
  patchDsl?: string;
}

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
  /**
   * Called after a patch is successfully applied (setNodes/setEdges done).
   * Use for server sync (e.g. filter update ops and call updateBlockContentByMountId).
   * Async callbacks are fire-and-forget; rejections are logged.
   */
  onPatchApplied?: (result: PatchAppliedResult) => void | Promise<void>;
  /** Called when validation or apply fails. Use for toasts/alerts. */
  onPatchError?: (error: unknown) => void;
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

        // Notify success (fire-and-forget for async)
        const result: PatchAppliedResult = {
          operations,
          nodes,
          edges,
          patchDsl,
        };
        if (options.onPatchApplied) {
          Promise.resolve(options.onPatchApplied(result)).catch(err =>
            console.error('[useCanvasdownPatch] onPatchApplied error:', err)
          );
        }
      } catch (error: unknown) {
        options.onPatchError?.(error);
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

        // Notify success (fire-and-forget for async)
        const result: PatchAppliedResult = {
          operations,
          nodes,
          edges,
        };
        if (options.onPatchApplied) {
          Promise.resolve(options.onPatchApplied(result)).catch(err =>
            console.error('[useCanvasdownPatch] onPatchApplied error:', err)
          );
        }
      } catch (error: unknown) {
        options.onPatchError?.(error);
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
