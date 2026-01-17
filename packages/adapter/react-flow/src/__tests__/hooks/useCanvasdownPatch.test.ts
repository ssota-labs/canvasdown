import React from 'react';
import { CanvasdownCore } from '@canvasdown/core';
import type { AddOperation } from '@canvasdown/core';
import { act, renderHook } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCanvasdownPatch } from '../../hooks/useCanvasdownPatch';

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
});
