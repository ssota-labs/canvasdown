import dagre from '@dagrejs/dagre';
import type { Direction } from '../types/ast.types';
import type { GraphEdge, GraphNode } from '../types/graph.types';

/**
 * Options for dagre layout
 */
export interface LayoutOptions {
  /** Layout direction */
  direction: Direction;

  /** Horizontal spacing between nodes (default: 50) */
  nodeSpacing?: number;

  /** Vertical spacing between ranks (default: 100) */
  rankSpacing?: number;
}

/**
 * Layout engine using dagre.
 * Calculates node positions based on graph structure and direction hint.
 */
export class DagreLayout {
  /**
   * Apply layout to graph nodes and edges
   */
  apply(
    nodes: GraphNode[],
    edges: GraphEdge[],
    options: LayoutOptions
  ): GraphNode[] {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));

    // Configure graph layout
    g.setGraph({
      rankdir: this.directionToRankDir(options.direction),
      nodesep: options.nodeSpacing ?? 50,
      ranksep: options.rankSpacing ?? 100,
      // Additional dagre options
      align: 'UL', // Align nodes to upper-left
      acyclicer: 'greedy', // Handle cycles
      ranker: 'network-simplex', // Layout algorithm
    });

    // Add nodes with their sizes
    for (const node of nodes) {
      g.setNode(node.id, {
        width: node.size.width,
        height: node.size.height,
      });
    }

    // Add edges
    for (const edge of edges) {
      g.setEdge(edge.source, edge.target, {
        // dagre edge options can go here if needed
      });
    }

    // Calculate layout
    dagre.layout(g);

    // Update node positions
    return nodes.map(node => {
      const dagreNode = g.node(node.id);
      if (!dagreNode) {
        // Node not found in dagre graph (shouldn't happen)
        return node;
      }

      // dagre returns center coordinates, convert to top-left
      return {
        ...node,
        position: {
          x: dagreNode.x - node.size.width / 2,
          y: dagreNode.y - node.size.height / 2,
        },
      };
    });
  }

  /**
   * Convert Canvasdown direction to dagre rankdir
   */
  private directionToRankDir(direction: Direction): 'LR' | 'RL' | 'TB' | 'BT' {
    // Canvasdown directions map directly to dagre rankdir
    return direction;
  }
}
