import { beforeEach, describe, expect, it } from 'vitest';
import { DagreLayout } from '../../layout/dagre-layout';
import { BlockTypeRegistry } from '../../registry/block-type-registry';
import type { GraphEdge, GraphNode } from '../../types/graph.types';

describe('Zone Layout', () => {
  let layout: DagreLayout;
  let blockRegistry: BlockTypeRegistry;

  beforeEach(() => {
    blockRegistry = new BlockTypeRegistry();
    // Register zone type
    blockRegistry.register({
      name: 'zone',
      isGroup: true,
      defaultProperties: {
        direction: 'TB',
        color: 'gray',
        padding: 20,
      },
      defaultSize: { width: 400, height: 300 },
    });
    // Register shape type
    blockRegistry.register({
      name: 'shape',
      defaultProperties: {},
      defaultSize: { width: 100, height: 50 },
    });
    layout = new DagreLayout(blockRegistry);
  });

  it('should layout zones and children separately', () => {
    const nodes: GraphNode[] = [
      {
        id: 'zone1',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        data: { direction: 'TB', padding: 20 },
      },
      {
        id: 'child1',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        data: {},
      },
      {
        id: 'child2',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        data: {},
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge1',
        source: 'child1',
        target: 'child2',
        data: {},
      },
    ];

    const result = layout.apply(nodes, edges, { direction: 'TB' });

    const zone = result.find(n => n.id === 'zone1');
    const child1 = result.find(n => n.id === 'child1');
    const child2 = result.find(n => n.id === 'child2');

    expect(zone).toBeDefined();
    expect(child1).toBeDefined();
    expect(child2).toBeDefined();

    // Children should be positioned relative to zone
    expect(child1?.position.x).toBeGreaterThanOrEqual(zone!.position.x);
    expect(child1?.position.y).toBeGreaterThanOrEqual(zone!.position.y);
    expect(child2?.position.x).toBeGreaterThanOrEqual(zone!.position.x);
    expect(child2?.position.y).toBeGreaterThanOrEqual(zone!.position.y);

    // Zone should contain children
    expect(child1!.position.x + child1!.size.width).toBeLessThanOrEqual(
      zone!.position.x + zone!.size.width
    );
    expect(child1!.position.y + child1!.size.height).toBeLessThanOrEqual(
      zone!.position.y + zone!.size.height
    );
  });

  it('should adjust zone size to contain children', () => {
    const nodes: GraphNode[] = [
      {
        id: 'zone1',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 100 }, // Small initial size
        data: { direction: 'LR', padding: 20 },
      },
      {
        id: 'child1',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 0, y: 0 },
        size: { width: 150, height: 80 },
        data: {},
      },
      {
        id: 'child2',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 0, y: 0 },
        size: { width: 150, height: 80 },
        data: {},
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge1',
        source: 'child1',
        target: 'child2',
        data: {},
      },
    ];

    const result = layout.apply(nodes, edges, { direction: 'TB' });

    const zone = result.find(n => n.id === 'zone1');
    expect(zone).toBeDefined();
    // Zone size should be expanded to contain children + padding
    expect(zone!.size.width).toBeGreaterThan(200);
    expect(zone!.size.height).toBeGreaterThan(100);
  });

  it('should use zone direction for children layout', () => {
    const nodes: GraphNode[] = [
      {
        id: 'zone1',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        data: { direction: 'LR', padding: 20 }, // Zone uses LR
      },
      {
        id: 'child1',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        data: {},
      },
      {
        id: 'child2',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        data: {},
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge1',
        source: 'child1',
        target: 'child2',
        data: {},
      },
    ];

    const result = layout.apply(nodes, edges, { direction: 'TB' }); // Canvas uses TB

    const child1 = result.find(n => n.id === 'child1');
    const child2 = result.find(n => n.id === 'child2');

    // With LR direction, child2 should be to the right of child1
    expect(child2!.position.x).toBeGreaterThan(child1!.position.x);
  });

  it('should handle multiple zones at root level', () => {
    const nodes: GraphNode[] = [
      {
        id: 'zone1',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        data: { direction: 'TB', padding: 20 },
      },
      {
        id: 'child1',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        data: {},
      },
      {
        id: 'zone2',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        data: { direction: 'LR', padding: 20 },
      },
      {
        id: 'child2',
        type: 'shape',
        parentId: 'zone2',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        data: {},
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge1',
        source: 'zone1',
        target: 'zone2',
        data: {},
      },
    ];

    const result = layout.apply(nodes, edges, { direction: 'TB' });

    const zone1 = result.find(n => n.id === 'zone1');
    const zone2 = result.find(n => n.id === 'zone2');

    expect(zone1).toBeDefined();
    expect(zone2).toBeDefined();
    // Zones should be laid out according to canvas direction (TB)
    expect(zone2!.position.y).toBeGreaterThan(zone1!.position.y);
  });

  it('should handle empty zones', () => {
    const nodes: GraphNode[] = [
      {
        id: 'zone1',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        data: { direction: 'TB', padding: 20 },
      },
    ];

    const edges: GraphEdge[] = [];

    const result = layout.apply(nodes, edges, { direction: 'TB' });

    const zone = result.find(n => n.id === 'zone1');
    expect(zone).toBeDefined();
    // Empty zone should keep default size
    expect(zone!.size.width).toBe(400);
    expect(zone!.size.height).toBe(300);
  });
});
