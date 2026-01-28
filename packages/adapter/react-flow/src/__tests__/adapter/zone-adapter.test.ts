import type { GraphNode } from '@ssota-labs/canvasdown';
import { describe, expect, it } from 'vitest';
import { toReactFlowNodes } from '../../adapter/to-react-flow';

describe('Zone Adapter', () => {
  it('should add parentId and extent to child nodes', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'zone1',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        data: { direction: 'TB' },
      },
      {
        id: 'child1',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 50, y: 50 },
        size: { width: 100, height: 50 },
        data: { extent: 'parent' }, // Explicit extent
      },
    ];

    const reactFlowNodes = toReactFlowNodes(graphNodes);

    const zoneNode = reactFlowNodes.find(n => n.id === 'zone1');
    const childNode = reactFlowNodes.find(n => n.id === 'child1');

    expect(zoneNode).toBeDefined();
    expect(childNode).toBeDefined();
    expect(childNode?.parentId).toBe('zone1');
    expect(childNode?.extent).toBe('parent');
    expect(zoneNode?.parentId).toBeUndefined();
    expect(zoneNode?.extent).toBeUndefined();
  });

  it('should handle nodes without parentId', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'root1',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        data: {},
      },
    ];

    const reactFlowNodes = toReactFlowNodes(graphNodes);

    const rootNode = reactFlowNodes.find(n => n.id === 'root1');
    expect(rootNode).toBeDefined();
    expect(rootNode?.parentId).toBeUndefined();
    expect(rootNode?.extent).toBeUndefined();
  });

  it('should handle nested zones', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'outer',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 500, height: 400 },
        data: { direction: 'TB' },
      },
      {
        id: 'inner',
        type: 'zone',
        parentId: 'outer',
        position: { x: 50, y: 50 },
        size: { width: 300, height: 200 },
        data: { direction: 'LR', extent: 'parent' }, // Explicit extent
      },
      {
        id: 'child',
        type: 'shape',
        parentId: 'inner',
        position: { x: 100, y: 100 },
        size: { width: 100, height: 50 },
        data: { extent: 'parent' }, // Explicit extent
      },
    ];

    const reactFlowNodes = toReactFlowNodes(graphNodes);

    const innerZone = reactFlowNodes.find(n => n.id === 'inner');
    const child = reactFlowNodes.find(n => n.id === 'child');

    expect(innerZone?.parentId).toBe('outer');
    expect(innerZone?.extent).toBe('parent');
    expect(child?.parentId).toBe('inner');
    expect(child?.extent).toBe('parent');
  });

  it('should allow nodes without extent (free movement)', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'zone1',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        data: { direction: 'TB' },
      },
      {
        id: 'child1',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 50, y: 50 },
        size: { width: 100, height: 50 },
        data: {}, // No extent - should be undefined
      },
    ];

    const reactFlowNodes = toReactFlowNodes(graphNodes);

    const childNode = reactFlowNodes.find(n => n.id === 'child1');

    expect(childNode?.parentId).toBe('zone1');
    expect(childNode?.extent).toBeUndefined(); // No extent = free movement
  });

  it('should preserve node data and properties', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'zone1',
        type: 'zone',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        data: {
          direction: 'TB',
          color: 'blue',
          padding: 20,
        },
      },
      {
        id: 'child1',
        type: 'shape',
        parentId: 'zone1',
        position: { x: 50, y: 50 },
        size: { width: 100, height: 50 },
        data: {
          shapeType: 'ellipse',
          color: 'green',
        },
      },
    ];

    const reactFlowNodes = toReactFlowNodes(graphNodes);

    const zoneNode = reactFlowNodes.find(n => n.id === 'zone1');
    const childNode = reactFlowNodes.find(n => n.id === 'child1');

    expect(zoneNode?.data.direction).toBe('TB');
    expect(zoneNode?.data.color).toBe('blue');
    expect(childNode?.data.shapeType).toBe('ellipse');
    expect(childNode?.data.color).toBe('green');
  });
});
