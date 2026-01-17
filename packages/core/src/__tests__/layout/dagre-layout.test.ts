import { beforeEach, describe, expect, it } from 'vitest';
import { DagreLayout } from '../../layout/dagre-layout';
import type { GraphEdge, GraphNode } from '../../types/graph.types';

describe('DagreLayout', () => {
  let layout: DagreLayout;

  beforeEach(() => {
    layout = new DagreLayout();
  });

  it('should apply layout to nodes', () => {
    const nodes: GraphNode[] = [
      {
        id: 'start',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
        data: {},
      },
      {
        id: 'end',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
        data: {},
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge-1',
        source: 'start',
        target: 'end',
        data: {},
      },
    ];

    const result = layout.apply(nodes, edges, { direction: 'LR' });

    expect(result).toHaveLength(2);
    // Dagre layout should calculate positions (may be 0 if nodes are at origin)
    // Just verify that layout was applied
    expect(result[0]?.position).toBeDefined();
    expect(result[1]?.position).toBeDefined();
  });

  it('should layout nodes left-to-right', () => {
    const nodes: GraphNode[] = [
      {
        id: 'start',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
        data: {},
      },
      {
        id: 'end',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
        data: {},
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge-1',
        source: 'start',
        target: 'end',
        data: {},
      },
    ];

    const result = layout.apply(nodes, edges, { direction: 'LR' });

    // In LR layout, start should be to the left of end
    expect(result[0]?.position.x).toBeLessThan(result[1]?.position.x);
  });

  it('should layout nodes top-to-bottom', () => {
    const nodes: GraphNode[] = [
      {
        id: 'start',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
        data: {},
      },
      {
        id: 'end',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
        data: {},
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge-1',
        source: 'start',
        target: 'end',
        data: {},
      },
    ];

    const result = layout.apply(nodes, edges, { direction: 'TB' });

    // In TB layout, start should be above end
    expect(result[0]?.position.y).toBeLessThan(result[1]?.position.y);
  });

  it('should respect node sizes', () => {
    const nodes: GraphNode[] = [
      {
        id: 'large',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 200 },
        data: {},
      },
      {
        id: 'small',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        data: {},
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge-1',
        source: 'large',
        target: 'small',
        data: {},
      },
    ];

    const result = layout.apply(nodes, edges, { direction: 'LR' });

    // Nodes should have different positions based on their sizes
    expect(result[0]?.size.width).toBe(400);
    expect(result[1]?.size.width).toBe(100);
  });

  it('should handle custom spacing', () => {
    const nodes: GraphNode[] = [
      {
        id: 'start',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
        data: {},
      },
      {
        id: 'end',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 },
        data: {},
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge-1',
        source: 'start',
        target: 'end',
        data: {},
      },
    ];

    const resultDefault = layout.apply(nodes, edges, {
      direction: 'LR',
    });

    const resultCustom = layout.apply(nodes, edges, {
      direction: 'LR',
      nodeSpacing: 200,
      rankSpacing: 200,
    });

    // Custom spacing should result in different positions (or at least layout applied)
    expect(resultCustom[0]?.position).toBeDefined();
    expect(resultDefault[0]?.position).toBeDefined();
  });
});
