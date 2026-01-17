import { CanvasdownCore } from '@canvasdown/core';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCanvasdown } from '../../hooks/useCanvasdown';

describe('useCanvasdown', () => {
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

  it('should parse valid DSL and return nodes and edges', () => {
    const dsl = `canvas LR

@shape node1 "Node 1"
@shape node2 "Node 2"

node1 -> node2`;

    const { result } = renderHook(() =>
      useCanvasdown(dsl, { core, direction: 'LR' })
    );

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.edges).toHaveLength(1);
    expect(result.current.nodes[0]?.id).toBe('node1');
    expect(result.current.nodes[1]?.id).toBe('node2');
    expect(result.current.edges[0]?.source).toBe('node1');
    expect(result.current.edges[0]?.target).toBe('node2');
  });

  it('should return error for invalid DSL', () => {
    const dsl = '[invalid:node1] "Test"';

    const { result } = renderHook(() =>
      useCanvasdown(dsl, { core, direction: 'LR' })
    );

    expect(result.current.error).not.toBeNull();
    expect(result.current.nodes).toHaveLength(0);
    expect(result.current.edges).toHaveLength(0);
  });

  it('should use specified direction', () => {
    const dsl = `canvas LR

@shape node1 "Node 1"
@shape node2 "Node 2"

node1 -> node2`;

    const { result: lrResult } = renderHook(() =>
      useCanvasdown(dsl, { core, direction: 'LR' })
    );
    const { result: tbResult } = renderHook(() =>
      useCanvasdown(dsl, { core, direction: 'TB' })
    );

    expect(lrResult.current.error).toBeNull();
    expect(tbResult.current.error).toBeNull();
    expect(lrResult.current.edges[0]?.sourceHandle).toBe('right');
    expect(lrResult.current.edges[0]?.targetHandle).toBe('left');
    expect(tbResult.current.edges[0]?.sourceHandle).toBe('bottom');
    expect(tbResult.current.edges[0]?.targetHandle).toBe('top');
  });

  it('should update when DSL changes', () => {
    const { result, rerender } = renderHook(
      ({ dsl }: { dsl: string }) => useCanvasdown(dsl, { core }),
      {
        initialProps: {
          dsl: `canvas LR

@shape node1 "Node 1"`,
        },
      }
    );

    expect(result.current.error).toBeNull();
    expect(result.current.nodes).toHaveLength(1);

    rerender({
      dsl: `canvas LR

@shape node1 "Node 1"
@shape node2 "Node 2"`,
    });

    expect(result.current.error).toBeNull();
    expect(result.current.nodes).toHaveLength(2);
  });

  it('should handle empty DSL', () => {
    const { result } = renderHook(() => useCanvasdown('canvas LR', { core }));

    expect(result.current.error).toBeNull();
    expect(result.current.nodes).toHaveLength(0);
    expect(result.current.edges).toHaveLength(0);
  });
});
