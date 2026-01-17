import type { Edge, Node } from '@xyflow/react';

/**
 * Canvas State Manager
 * Manages and queries the current React Flow canvas state
 */
export class CanvasStateManager {
  /**
   * Get all node IDs from current nodes
   */
  getNodeIds(nodes: Node[]): string[] {
    return nodes.map(node => node.id);
  }

  /**
   * Get all edge IDs from current edges
   */
  getEdgeIds(edges: Edge[]): string[] {
    return edges.map(edge => edge.id);
  }

  /**
   * Find a node by ID
   */
  findNodeById(nodes: Node[], id: string): Node | undefined {
    return nodes.find(node => node.id === id);
  }

  /**
   * Find an edge by ID
   */
  findEdgeById(edges: Edge[], id: string): Edge | undefined {
    return edges.find(edge => edge.id === id);
  }

  /**
   * Find edges by source node ID
   */
  findEdgesBySource(edges: Edge[], sourceId: string): Edge[] {
    return edges.filter(edge => edge.source === sourceId);
  }

  /**
   * Find edges by target node ID
   */
  findEdgesByTarget(edges: Edge[], targetId: string): Edge[] {
    return edges.filter(edge => edge.target === targetId);
  }

  /**
   * Find an edge between two nodes
   */
  findEdgeBetween(
    edges: Edge[],
    sourceId: string,
    targetId: string
  ): Edge | undefined {
    return edges.find(
      edge => edge.source === sourceId && edge.target === targetId
    );
  }

  /**
   * Check if a node exists
   */
  hasNode(nodes: Node[], id: string): boolean {
    return this.findNodeById(nodes, id) !== undefined;
  }

  /**
   * Check if an edge exists
   */
  hasEdge(edges: Edge[], sourceId: string, targetId: string): boolean {
    return this.findEdgeBetween(edges, sourceId, targetId) !== undefined;
  }

  /**
   * Create a snapshot of current state
   */
  createSnapshot(
    nodes: Node[],
    edges: Edge[]
  ): {
    nodes: Node[];
    edges: Edge[];
  } {
    // Deep clone to create a snapshot
    return {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
  }
}
