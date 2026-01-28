import dagre from '@dagrejs/dagre';
import type { BlockTypeRegistry } from '../registry/block-type-registry';
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
  constructor(private blockRegistry?: BlockTypeRegistry) {}

  /**
   * Apply layout to graph nodes and edges
   * Supports zone-aware multi-pass layout for hierarchical structures
   */
  apply(
    nodes: GraphNode[],
    edges: GraphEdge[],
    options: LayoutOptions
  ): GraphNode[] {
    // Check if we have zones (nodes with parentId or group types)
    const hasZones = nodes.some(
      node =>
        node.parentId ||
        (this.blockRegistry && this.blockRegistry.get(node.type)?.isGroup)
    );

    if (hasZones) {
      return this.applyZoneAwareLayout(nodes, edges, options);
    } else {
      return this.applySimpleLayout(nodes, edges, options);
    }
  }

  /**
   * Apply simple layout (no zones)
   */
  private applySimpleLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    options: LayoutOptions
  ): GraphNode[] {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));

    const rankdir = this.directionToRankDir(options.direction);

    // Configure graph layout
    g.setGraph({
      rankdir,
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

    // If no edges, create a simple chain to enforce direction
    // This ensures dagre applies the direction correctly
    if (edges.length === 0 && nodes.length > 1) {
      // Create a simple chain: node1 -> node2 -> node3 -> ...
      for (let i = 0; i < nodes.length - 1; i++) {
        g.setEdge(nodes[i].id, nodes[i + 1].id, {});
      }
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
   * Apply zone-aware multi-pass layout
   */
  private applyZoneAwareLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    options: LayoutOptions
  ): GraphNode[] {
    // Separate zones, children, and root nodes
    const zones = nodes.filter(node => {
      const typeDef = this.blockRegistry?.get(node.type);
      return typeDef?.isGroup && !node.parentId;
    });
    const children = nodes.filter(node => node.parentId);
    const rootNodes = nodes.filter(node => {
      const typeDef = this.blockRegistry?.get(node.type);
      return !node.parentId && !typeDef?.isGroup;
    });

    // Pass 1: Layout zones and root nodes together
    const topLevelNodes = [...zones, ...rootNodes];
    const topLevelEdges = edges.filter(
      edge =>
        topLevelNodes.some(n => n.id === edge.source || n.id === edge.target) &&
        !children.some(c => c.id === edge.source || c.id === edge.target)
    );

    const laidOutTopLevel = this.applySimpleLayout(
      topLevelNodes,
      topLevelEdges,
      options
    );

    const laidOutZones = laidOutTopLevel.filter(node => {
      const typeDef = this.blockRegistry?.get(node.type);
      return typeDef?.isGroup;
    });
    const laidOutRootNodes = laidOutTopLevel.filter(node => {
      const typeDef = this.blockRegistry?.get(node.type);
      return !typeDef?.isGroup;
    });

    // Pass 2: Layout children within each zone
    const zoneMap = new Map<string, GraphNode>();
    for (const zone of laidOutZones) {
      zoneMap.set(zone.id, zone);
    }

    const laidOutChildren: GraphNode[] = [];
    for (const zone of laidOutZones) {
      const zoneChildren = children.filter(c => c.parentId === zone.id);
      if (zoneChildren.length === 0) {
        continue;
      }

      // Get zone direction from zone data, fallback to canvas direction
      const zoneDirection =
        (zone.data.direction as Direction | undefined) || options.direction;

      // Get zone padding
      const zonePadding = (zone.data.padding as number | undefined) || 20;

      // Get edges within this zone (edges between children in this zone)
      const zoneChildEdges = edges.filter(
        edge =>
          zoneChildren.some(c => c.id === edge.source) &&
          zoneChildren.some(c => c.id === edge.target)
      );

      // Layout children with zone's direction
      // First, reset children positions to (0,0) to ensure consistent layout
      const childrenForLayout = zoneChildren.map(child => ({
        ...child,
        position: { x: 0, y: 0 },
      }));

      const laidOutZoneChildren = this.applySimpleLayout(
        childrenForLayout,
        zoneChildEdges,
        { ...options, direction: zoneDirection }
      );

      // Calculate bounding box of children (relative to their layout origin)
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const child of laidOutZoneChildren) {
        minX = Math.min(minX, child.position.x);
        minY = Math.min(minY, child.position.y);
        maxX = Math.max(maxX, child.position.x + child.size.width);
        maxY = Math.max(maxY, child.position.y + child.size.height);
      }

      // Handle edge case: if no children or all at same position
      if (minX === Infinity || laidOutZoneChildren.length === 0) {
        // Keep zone at default size, no children to position
        continue;
      }

      // Pass 3: Adjust zone size to contain children + padding
      const zoneWidth = maxX - minX + zonePadding * 2;
      const zoneHeight = maxY - minY + zonePadding * 2;

      // Update zone size
      zone.size.width = Math.max(zone.size.width, zoneWidth);
      zone.size.height = Math.max(zone.size.height, zoneHeight);

      // Pass 4: Adjust child positions relative to zone
      // React Flow expects child positions to be relative to parent, not absolute
      // So we calculate position relative to zone's top-left corner
      const childOffsetX = zonePadding - minX;
      const childOffsetY = zonePadding - minY;

      for (const child of laidOutZoneChildren) {
        // Convert to parent-relative position for React Flow
        child.position.x += childOffsetX;
        child.position.y += childOffsetY;

        laidOutChildren.push(child);
      }
    }

    // Combine all nodes: zones, root nodes, and children
    return [...laidOutZones, ...laidOutRootNodes, ...laidOutChildren];
  }

  /**
   * Convert Canvasdown direction to dagre rankdir
   */
  private directionToRankDir(direction: Direction): 'LR' | 'RL' | 'TB' | 'BT' {
    // Canvasdown directions map directly to dagre rankdir
    return direction;
  }
}
