/**
 * AST (Abstract Syntax Tree) types for canvasdown DSL.
 * These represent the parsed structure of the DSL before conversion to graph data.
 */
import type {
  CustomPropertySchema,
  CustomPropertyValue,
} from './custom-property.types';

/**
 * Direction hint for layout engine
 */
export type Direction = 'LR' | 'RL' | 'TB' | 'BT';

/**
 * A node in the AST representing a block definition
 */
export interface ASTNode {
  /** Unique identifier for the node */
  id: string;

  /** Block type name (must be registered) */
  type: string;

  /** Display label for the node */
  label: string;

  /** Properties defined in the DSL (will be merged with defaultProperties) */
  properties: Record<string, unknown>;

  /** Custom properties defined in the DSL (user-defined properties) */
  customProperties?: CustomPropertyValue[];
}

/**
 * An edge in the AST representing a connection between nodes
 */
export interface ASTEdge {
  /** Source node ID */
  source: string;

  /** Target node ID */
  target: string;

  /** Optional label for the edge (center position) */
  label?: string;

  /** Optional label at the start (source) position */
  startLabel?: string;

  /** Optional label at the end (target) position */
  endLabel?: string;

  /** Optional edge type name (must be registered) */
  edgeType?: string;

  /** Optional edge-specific data */
  edgeData?: Record<string, unknown>;
}

/**
 * Complete AST structure representing a parsed DSL
 */
export interface CanvasdownAST {
  /** Layout direction hint */
  direction: Direction;

  /** Custom property schemas defined in the DSL (@schema definitions) */
  schemas: CustomPropertySchema[];

  /** All nodes defined in the DSL */
  nodes: ASTNode[];

  /** All edges defined in the DSL */
  edges: ASTEdge[];
}
