import React from 'react';
import { CanvasdownCore } from '@ssota-labs/canvasdown';
import type { AddOperation } from '@ssota-labs/canvasdown';
import { act, renderHook } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useCanvasdownPatch,
  type PatchAppliedResult,
} from '../../hooks/useCanvasdownPatch';

// Wrapper component for ReactFlowProvider
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(ReactFlowProvider, null, children);

describe('useCanvasdownPatch', () => {
  let core: CanvasdownCore;

  beforeEach(() => {
    core = new CanvasdownCore();
    core.registerBlockType({
      name: 'shape',
      defaultProperties: {
        shapeType: 'rectangle',
      },
      defaultSize: { width: 200, height: 100 },
    });
  });

  it('should return patch functions', () => {
    const { result } = renderHook(() => useCanvasdownPatch(core), { wrapper });

    expect(result.current.applyPatch).toBeDefined();
    expect(result.current.applyPatchOperations).toBeDefined();
    expect(result.current.getNodeIds).toBeDefined();
    expect(result.current.getEdgeIds).toBeDefined();
  });

  it('should apply patch DSL', () => {
    const { result } = renderHook(() => useCanvasdownPatch(core), { wrapper });

    const patchDsl = '@add [shape:node1] "Node 1"';

    act(() => {
      expect(() => {
        result.current.applyPatch(patchDsl);
      }).not.toThrow();
    });
  });

  it('should apply patch operations', () => {
    const { result } = renderHook(() => useCanvasdownPatch(core), { wrapper });

    const operation: AddOperation = {
      type: 'add',
      targetId: 'node1',
      nodeType: 'shape',
      label: 'Node 1',
    };

    act(() => {
      expect(() => {
        result.current.applyPatchOperations([operation]);
      }).not.toThrow();
    });
  });

  it('should get node IDs', () => {
    const { result } = renderHook(() => useCanvasdownPatch(core), { wrapper });

    const nodeIds = result.current.getNodeIds();

    expect(Array.isArray(nodeIds)).toBe(true);
  });

  it('should get edge IDs', () => {
    const { result } = renderHook(() => useCanvasdownPatch(core), { wrapper });

    const edgeIds = result.current.getEdgeIds();

    expect(Array.isArray(edgeIds)).toBe(true);
  });

  it('should throw error for invalid patch DSL', () => {
    const { result } = renderHook(() => useCanvasdownPatch(core), { wrapper });

    const invalidPatch = '@invalid operation';

    // Suppress console.error for expected error
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    act(() => {
      expect(() => {
        result.current.applyPatch(invalidPatch);
      }).toThrow();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should use custom options', () => {
    const { result } = renderHook(
      () =>
        useCanvasdownPatch(core, {
          preservePositions: false,
          direction: 'TB',
        }),
      { wrapper }
    );

    expect(result.current.applyPatch).toBeDefined();
  });

  it('should call onPatchApplied after applyPatch(dsl) success', () => {
    const onPatchApplied = vi.fn<(result: PatchAppliedResult) => void>();

    const { result } = renderHook(
      () => useCanvasdownPatch(core, { onPatchApplied }),
      { wrapper }
    );

    const patchDsl = '@add [shape:node1] "Node 1"';

    act(() => {
      result.current.applyPatch(patchDsl);
    });

    expect(onPatchApplied).toHaveBeenCalledTimes(1);
    const arg = onPatchApplied.mock.calls[0][0] as {
      operations: unknown[];
      nodes: unknown[];
      edges: unknown[];
      patchDsl?: string;
    };
    expect(arg.operations).toHaveLength(1);
    expect(arg.operations[0]).toMatchObject({ type: 'add', targetId: 'node1' });
    expect(arg.nodes).toHaveLength(1);
    expect(arg.edges).toEqual([]);
    expect(arg.patchDsl).toBe(patchDsl);
  });

  it('should call onPatchApplied after applyPatchOperations(ops) success with patchDsl undefined', () => {
    const onPatchApplied = vi.fn<(result: PatchAppliedResult) => void>();

    const { result } = renderHook(
      () => useCanvasdownPatch(core, { onPatchApplied }),
      { wrapper }
    );

    const operation: AddOperation = {
      type: 'add',
      targetId: 'node1',
      nodeType: 'shape',
      label: 'Node 1',
    };

    act(() => {
      result.current.applyPatchOperations([operation]);
    });

    expect(onPatchApplied).toHaveBeenCalledTimes(1);
    const arg = onPatchApplied.mock.calls[0][0] as {
      operations: unknown[];
      patchDsl?: string;
    };
    expect(arg.operations).toHaveLength(1);
    expect(arg.patchDsl).toBeUndefined();
  });

  it('should call onPatchError when patch validation fails', () => {
    const onPatchError = vi.fn<(error: unknown) => void>();

    const { result } = renderHook(
      () => useCanvasdownPatch(core, { onPatchError }),
      { wrapper }
    );

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    act(() => {
      expect(() => {
        result.current.applyPatch('@invalid operation');
      }).toThrow();
    });

    expect(onPatchError).toHaveBeenCalledTimes(1);
    expect(onPatchError.mock.calls[0][0]).toBeInstanceOf(Error);

    consoleErrorSpy.mockRestore();
  });
});
