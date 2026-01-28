import { GraphBuilder } from './builder/graph-builder';
import { DagreLayout } from './layout/dagre-layout';
import {
  cstToAST,
  cstToPatchOperations,
  parseDSL,
  parsePatchDSL,
} from './parser/index';
import { BlockTypeRegistry } from './registry/block-type-registry';
import { EdgeTypeRegistry } from './registry/edge-type-registry';
import type {
  BlockTypeDefinition,
  CanvasdownOutput,
  EdgeTypeDefinition,
  PatchOperationUnion,
  PatchValidationResult,
  PropertySchema,
} from './types/index';

/**
 * Options for CanvasdownCore
 */
export interface CanvasdownCoreOptions {
  /**
   * Default extent for child nodes within zones/groups.
   * - 'parent': Constrain to parent bounds
   * - [[x1, y1], [x2, y2]]: Constrain to specific coordinate range
   * - undefined: No constraint - nodes can move freely (default)
   */
  defaultExtent?: 'parent' | [[number, number], [number, number]] | undefined;
}

/**
 * Main Canvasdown Core class.
 * Provides a unified interface for DSL parsing, type registration, and graph generation.
 */
export class CanvasdownCore {
  private blockRegistry = new BlockTypeRegistry();
  private edgeRegistry = new EdgeTypeRegistry();
  private layout = new DagreLayout(this.blockRegistry);
  private options: CanvasdownCoreOptions;

  constructor(options?: CanvasdownCoreOptions) {
    this.options = options || {};
  }

  /**
   * Register a block type definition
   */
  registerBlockType<T extends Record<string, unknown>>(
    definition: BlockTypeDefinition<T>
  ): void {
    this.blockRegistry.register(definition);
  }

  /**
   * Register an edge type definition
   */
  registerEdgeType<T extends Record<string, unknown>>(
    definition: EdgeTypeDefinition<T>
  ): void {
    this.edgeRegistry.register(definition);
  }

  /**
   * Get a block type definition
   */
  getBlockType(name: string): BlockTypeDefinition | undefined {
    return this.blockRegistry.get(name);
  }

  /**
   * Get property schema for a block type
   * Returns the propertySchema field from the block type definition
   */
  getBlockTypeSchema(name: string): Record<string, PropertySchema> | undefined {
    const typeDef = this.blockRegistry.get(name);
    return typeDef?.propertySchema;
  }

  /**
   * Get an edge type definition
   */
  getEdgeType(name: string): EdgeTypeDefinition | undefined {
    return this.edgeRegistry.get(name);
  }

  /**
   * Check if a block type is registered
   */
  hasBlockType(name: string): boolean {
    return this.blockRegistry.has(name);
  }

  /**
   * Check if an edge type is registered
   */
  hasEdgeType(name: string): boolean {
    return this.edgeRegistry.has(name);
  }

  /**
   * List all registered block types
   */
  listBlockTypes(): string[] {
    return this.blockRegistry.list();
  }

  /**
   * List all registered edge types
   */
  listEdgeTypes(): string[] {
    return this.edgeRegistry.list();
  }

  /**
   * Parse DSL text and apply layout to generate graph data
   */
  parseAndLayout(dsl: string): CanvasdownOutput {
    // Parse DSL to CST
    const { cst, errors } = parseDSL(dsl);

    if (errors.length > 0) {
      const errorMessages = errors
        .map(err => {
          const location =
            err.line !== undefined && err.column !== undefined
              ? ` at line ${err.line}, column ${err.column}`
              : '';
          return `${err.message}${location}`;
        })
        .join('; ');

      throw new Error(`Parse errors: ${errorMessages}`);
    }

    // Convert CST to AST
    const ast = cstToAST(cst);

    // Build graph data from AST
    const builder = new GraphBuilder(
      this.blockRegistry,
      this.edgeRegistry,
      this.options
    );
    const { nodes, edges } = builder.build(ast);

    // Apply layout
    const layoutedNodes = this.layout.apply(nodes, edges, {
      direction: ast.direction,
    });

    return {
      nodes: layoutedNodes,
      edges,
      metadata: {
        direction: ast.direction,
        layoutEngine: 'dagre',
      },
    };
  }

  /**
   * Parse DSL text only (without layout)
   * Useful for validation or when layout is not needed
   */
  parse(dsl: string): {
    nodes: Array<{
      id: string;
      type: string;
      label: string;
      properties: Record<string, unknown>;
    }>;
    edges: Array<{
      source: string;
      target: string;
      label?: string;
      edgeType?: string;
      edgeData?: Record<string, unknown>;
    }>;
    direction: 'LR' | 'RL' | 'TB' | 'BT';
  } {
    const { cst, errors } = parseDSL(dsl);

    if (errors.length > 0) {
      const errorMessages = errors
        .map(err => {
          const location =
            err.line !== undefined && err.column !== undefined
              ? ` at line ${err.line}, column ${err.column}`
              : '';
          return `${err.message}${location}`;
        })
        .join('; ');

      throw new Error(`Parse errors: ${errorMessages}`);
    }

    const ast = cstToAST(cst);

    return {
      nodes: ast.nodes.map(n => ({
        id: n.id,
        type: n.type,
        label: n.label,
        properties: n.properties,
      })),
      edges: ast.edges.map(e => ({
        source: e.source,
        target: e.target,
        ...(e.label && { label: e.label }),
        ...(e.edgeType && { edgeType: e.edgeType }),
        ...(e.edgeData && { edgeData: e.edgeData }),
      })),
      direction: ast.direction,
    };
  }

  /**
   * Parse patch DSL and return operations
   */
  parsePatch(patchDsl: string): PatchOperationUnion[] {
    const { cst, errors } = parsePatchDSL(patchDsl);

    if (errors.length > 0) {
      const errorMessages = errors
        .map(err => {
          const location =
            err.line !== undefined && err.column !== undefined
              ? ` at line ${err.line}, column ${err.column}`
              : '';
          return `${err.message}${location}`;
        })
        .join('; ');

      throw new Error(`Patch parse errors: ${errorMessages}`);
    }

    return cstToPatchOperations(cst);
  }

  /**
   * Validate patch operations against current state
   */
  validatePatch(
    operations: PatchOperationUnion[],
    currentNodeIds: string[]
  ): PatchValidationResult {
    const errors: Array<{ operation: PatchOperationUnion; message: string }> =
      [];

    // First pass: collect all node IDs that will be added by @add operations
    const nodesToBeAdded = new Set<string>();
    for (const operation of operations) {
      if (operation.type === 'add') {
        nodesToBeAdded.add(operation.targetId);
      }
    }

    // Create a combined set of existing and to-be-added node IDs
    const availableNodeIds = new Set([
      ...currentNodeIds,
      ...Array.from(nodesToBeAdded),
    ]);

    // Second pass: validate all operations
    for (const operation of operations) {
      // Validate update operation
      if (operation.type === 'update') {
        if (!availableNodeIds.has(operation.targetId)) {
          errors.push({
            operation,
            message: `Node "${operation.targetId}" does not exist`,
          });
        }
      }

      // Validate delete operation
      if (operation.type === 'delete') {
        if (!currentNodeIds.includes(operation.targetId)) {
          errors.push({
            operation,
            message: `Node "${operation.targetId}" does not exist`,
          });
        }
      }

      // Validate add operation - check if node type is registered
      if (operation.type === 'add') {
        if (!this.hasBlockType(operation.nodeType)) {
          errors.push({
            operation,
            message: `Block type "${operation.nodeType}" is not registered`,
          });
        }
        if (currentNodeIds.includes(operation.targetId)) {
          errors.push({
            operation,
            message: `Node "${operation.targetId}" already exists`,
          });
        }
      }

      // Validate connect operation
      if (operation.type === 'connect') {
        if (!availableNodeIds.has(operation.targetId)) {
          errors.push({
            operation,
            message: `Source node "${operation.targetId}" does not exist`,
          });
        }
        if (!availableNodeIds.has(operation.to)) {
          errors.push({
            operation,
            message: `Target node "${operation.to}" does not exist`,
          });
        }
      }

      // Validate disconnect operation
      if (operation.type === 'disconnect') {
        if (!currentNodeIds.includes(operation.targetId)) {
          errors.push({
            operation,
            message: `Source node "${operation.targetId}" does not exist`,
          });
        }
        if (operation.to && !currentNodeIds.includes(operation.to)) {
          errors.push({
            operation,
            message: `Target node "${operation.to}" does not exist`,
          });
        }
      }

      // Validate move operation
      if (operation.type === 'move') {
        if (!availableNodeIds.has(operation.targetId)) {
          errors.push({
            operation,
            message: `Node "${operation.targetId}" does not exist`,
          });
        }
      }

      // Validate resize operation
      if (operation.type === 'resize') {
        if (!availableNodeIds.has(operation.targetId)) {
          errors.push({
            operation,
            message: `Node "${operation.targetId}" does not exist`,
          });
        }
        if (operation.size.width <= 0 || operation.size.height <= 0) {
          errors.push({
            operation,
            message: `Size must be positive (got width: ${operation.size.width}, height: ${operation.size.height})`,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Build a single node from AST node (for patch operations)
   * This is used internally by patch applier
   */
  buildNodeFromAST(astNode: {
    id: string;
    type: string;
    label: string;
    properties?: Record<string, unknown>;
    customProperties?: Array<{
      schemaId: string;
      value: unknown;
    }>;
    parentId?: string;
  }): {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    data: Record<string, unknown>;
    parentId?: string;
  } {
    const builder = new GraphBuilder(
      this.blockRegistry,
      this.edgeRegistry,
      this.options
    );
    const tempAST = {
      direction: 'LR' as const,
      schemas: [],
      nodes: [
        {
          id: astNode.id,
          type: astNode.type,
          label: astNode.label,
          properties: astNode.properties || {},
          customProperties: astNode.customProperties,
          parentId: astNode.parentId,
        },
      ],
      edges: [],
    };
    const { nodes } = builder.build(tempAST);
    const graphNode = nodes[0];
    if (!graphNode) {
      throw new Error(
        `Failed to build node from AST for type '${astNode.type}'`
      );
    }
    return {
      id: graphNode.id,
      type: graphNode.type,
      position: graphNode.position,
      size: graphNode.size,
      data: graphNode.data,
      parentId: graphNode.parentId,
    };
  }
}
