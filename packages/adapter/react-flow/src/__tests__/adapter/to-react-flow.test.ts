import type { GraphEdge, GraphNode } from '@canvasdown/core';
import { describe, expect, it } from 'vitest';
import {
  toReactFlowEdges,
  toReactFlowGraph,
  toReactFlowNodes,
} from '../../adapter/to-react-flow';

describe('toReactFlowNodes', () => {
  it('should convert GraphNode to React Flow Node', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'node1',
        type: 'shape',
        position: { x: 100, y: 200 },
        size: { width: 150, height: 80 },
        data: { title: 'Test Node', color: 'blue' },
      },
    ];

    const nodes = toReactFlowNodes(graphNodes);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toEqual({
      id: 'node1',
      type: 'shape',
      position: { x: 100, y: 200 },
      width: 150,
      height: 80,
      data: {
        title: 'Test Node',
        color: 'blue',
      },
    });
  });

  it('should use node id as title if title is missing', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'node1',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        data: {},
      },
    ];

    const nodes = toReactFlowNodes(graphNodes);

    expect(nodes[0]?.data.title).toBe('node1');
  });

  it('should handle multiple nodes', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'node1',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        data: { title: 'Node 1' },
      },
      {
        id: 'node2',
        type: 'text',
        position: { x: 200, y: 200 },
        size: { width: 200, height: 150 },
        data: { title: 'Node 2' },
      },
    ];

    const nodes = toReactFlowNodes(graphNodes);

    expect(nodes).toHaveLength(2);
    expect(nodes[0]?.id).toBe('node1');
    expect(nodes[1]?.id).toBe('node2');
  });
});

describe('toReactFlowEdges', () => {
  const createEdge = (): GraphEdge => ({
    id: 'edge1',
    source: 'node1',
    target: 'node2',
    label: 'test',
    data: {},
  });

  it('should set correct handles for LR direction', () => {
    const edges = toReactFlowEdges([createEdge()], 'LR');
    expect(edges[0]?.sourceHandle).toBe('right');
    expect(edges[0]?.targetHandle).toBe('left');
  });

  it('should set correct handles for RL direction', () => {
    const edges = toReactFlowEdges([createEdge()], 'RL');
    expect(edges[0]?.sourceHandle).toBe('left');
    expect(edges[0]?.targetHandle).toBe('right');
  });

  it('should set correct handles for TB direction', () => {
    const edges = toReactFlowEdges([createEdge()], 'TB');
    expect(edges[0]?.sourceHandle).toBe('bottom');
    expect(edges[0]?.targetHandle).toBe('top');
  });

  it('should set correct handles for BT direction', () => {
    const edges = toReactFlowEdges([createEdge()], 'BT');
    expect(edges[0]?.sourceHandle).toBe('top');
    expect(edges[0]?.targetHandle).toBe('bottom');
  });

  it('should default to LR direction when not specified', () => {
    const edges = toReactFlowEdges([createEdge()]);
    expect(edges[0]?.sourceHandle).toBe('right');
    expect(edges[0]?.targetHandle).toBe('left');
  });

  it('should include edge labels and data', () => {
    const graphEdge: GraphEdge = {
      id: 'edge1',
      source: 'node1',
      target: 'node2',
      label: 'center label',
      startLabel: 'start',
      endLabel: 'end',
      style: { stroke: '#ff0000', strokeWidth: 2 },
      data: { custom: 'data' },
    };

    const edges = toReactFlowEdges([graphEdge], 'LR');

    expect(edges[0]).toBeDefined();
    const edge = edges[0]!;
    expect(edge.label).toBe('center label');
    expect(edge.data?.startLabel).toBe('start');
    expect(edge.data?.endLabel).toBe('end');
    expect(edge.style).toEqual({ stroke: '#ff0000', strokeWidth: 2 });
    expect(edge.data?.custom).toBe('data');
  });

  it('should set default edge type', () => {
    const edges = toReactFlowEdges([createEdge()]);
    expect(edges[0]?.type).toBe('default');
  });
});

describe('toReactFlowGraph', () => {
  it('should convert both nodes and edges', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'node1',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        data: { title: 'Node 1' },
      },
    ];

    const graphEdges: GraphEdge[] = [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        label: 'test',
        data: {},
      },
    ];

    const result = toReactFlowGraph(graphNodes, graphEdges, 'LR');

    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(1);
    expect(result.nodes[0]?.id).toBe('node1');
    expect(result.edges[0]?.id).toBe('edge1');
  });

  it('should use default direction when not specified', () => {
    const graphNodes: GraphNode[] = [
      {
        id: 'node1',
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        data: {},
      },
    ];

    const graphEdges: GraphEdge[] = [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        data: {},
      },
    ];

    const result = toReactFlowGraph(graphNodes, graphEdges);

    expect(result.edges[0]?.sourceHandle).toBe('right');
    expect(result.edges[0]?.targetHandle).toBe('left');
  });
});
