import type { Edge, Node } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import { CanvasStateManager } from '../../adapter/state-manager';

describe('CanvasStateManager', () => {
  const createNode = (id: string): Node => ({
    id,
    type: 'default',
    position: { x: 0, y: 0 },
    data: {},
  });

  const createEdge = (id: string, source: string, target: string): Edge => ({
    id,
    source,
    target,
  });

  describe('getNodeIds', () => {
    it('should return all node IDs', () => {
      const manager = new CanvasStateManager();
      const nodes = [
        createNode('node1'),
        createNode('node2'),
        createNode('node3'),
      ];

      const ids = manager.getNodeIds(nodes);

      expect(ids).toEqual(['node1', 'node2', 'node3']);
    });

    it('should return empty array for empty nodes', () => {
      const manager = new CanvasStateManager();
      const ids = manager.getNodeIds([]);
      expect(ids).toEqual([]);
    });
  });

  describe('getEdgeIds', () => {
    it('should return all edge IDs', () => {
      const manager = new CanvasStateManager();
      const edges = [
        createEdge('edge1', 'node1', 'node2'),
        createEdge('edge2', 'node2', 'node3'),
      ];

      const ids = manager.getEdgeIds(edges);

      expect(ids).toEqual(['edge1', 'edge2']);
    });
  });

  describe('findNodeById', () => {
    it('should find node by ID', () => {
      const manager = new CanvasStateManager();
      const nodes = [createNode('node1'), createNode('node2')];

      const node = manager.findNodeById(nodes, 'node1');

      expect(node?.id).toBe('node1');
    });

    it('should return undefined if node not found', () => {
      const manager = new CanvasStateManager();
      const nodes = [createNode('node1')];

      const node = manager.findNodeById(nodes, 'node2');

      expect(node).toBeUndefined();
    });
  });

  describe('findEdgeById', () => {
    it('should find edge by ID', () => {
      const manager = new CanvasStateManager();
      const edges = [createEdge('edge1', 'node1', 'node2')];

      const edge = manager.findEdgeById(edges, 'edge1');

      expect(edge?.id).toBe('edge1');
    });
  });

  describe('findEdgesBySource', () => {
    it('should find edges by source node ID', () => {
      const manager = new CanvasStateManager();
      const edges = [
        createEdge('edge1', 'node1', 'node2'),
        createEdge('edge2', 'node1', 'node3'),
        createEdge('edge3', 'node2', 'node3'),
      ];

      const found = manager.findEdgesBySource(edges, 'node1');

      expect(found).toHaveLength(2);
      expect(found.map(e => e.id)).toEqual(['edge1', 'edge2']);
    });
  });

  describe('findEdgesByTarget', () => {
    it('should find edges by target node ID', () => {
      const manager = new CanvasStateManager();
      const edges = [
        createEdge('edge1', 'node1', 'node2'),
        createEdge('edge2', 'node3', 'node2'),
        createEdge('edge3', 'node2', 'node3'),
      ];

      const found = manager.findEdgesByTarget(edges, 'node2');

      expect(found).toHaveLength(2);
      expect(found.map(e => e.id)).toEqual(['edge1', 'edge2']);
    });
  });

  describe('findEdgeBetween', () => {
    it('should find edge between two nodes', () => {
      const manager = new CanvasStateManager();
      const edges = [
        createEdge('edge1', 'node1', 'node2'),
        createEdge('edge2', 'node2', 'node3'),
      ];

      const edge = manager.findEdgeBetween(edges, 'node1', 'node2');

      expect(edge?.id).toBe('edge1');
    });

    it('should return undefined if edge not found', () => {
      const manager = new CanvasStateManager();
      const edges = [createEdge('edge1', 'node1', 'node2')];

      const edge = manager.findEdgeBetween(edges, 'node1', 'node3');

      expect(edge).toBeUndefined();
    });
  });

  describe('hasNode', () => {
    it('should return true if node exists', () => {
      const manager = new CanvasStateManager();
      const nodes = [createNode('node1')];

      expect(manager.hasNode(nodes, 'node1')).toBe(true);
    });

    it('should return false if node does not exist', () => {
      const manager = new CanvasStateManager();
      const nodes = [createNode('node1')];

      expect(manager.hasNode(nodes, 'node2')).toBe(false);
    });
  });

  describe('hasEdge', () => {
    it('should return true if edge exists', () => {
      const manager = new CanvasStateManager();
      const edges = [createEdge('edge1', 'node1', 'node2')];

      expect(manager.hasEdge(edges, 'node1', 'node2')).toBe(true);
    });

    it('should return false if edge does not exist', () => {
      const manager = new CanvasStateManager();
      const edges = [createEdge('edge1', 'node1', 'node2')];

      expect(manager.hasEdge(edges, 'node1', 'node3')).toBe(false);
    });
  });

  describe('createSnapshot', () => {
    it('should create a deep copy of nodes and edges', () => {
      const manager = new CanvasStateManager();
      const nodes = [createNode('node1')];
      const edges = [createEdge('edge1', 'node1', 'node2')];

      const snapshot = manager.createSnapshot(nodes, edges);

      expect(snapshot.nodes).toEqual(nodes);
      expect(snapshot.edges).toEqual(edges);
      expect(snapshot.nodes).not.toBe(nodes); // Different reference
      expect(snapshot.edges).not.toBe(edges); // Different reference
    });

    it('should create independent snapshot', () => {
      const manager = new CanvasStateManager();
      const node = createNode('node1');
      const nodes = [node];
      const edges: Edge[] = [];

      const snapshot = manager.createSnapshot(nodes, edges);

      // Modify original
      node.data.title = 'Modified';

      // Snapshot should not be affected
      expect(snapshot.nodes[0]?.data.title).toBeUndefined();
    });
  });
});
