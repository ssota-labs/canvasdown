/**
 * Marker configuration for React Flow compatibility
 */
export type MarkerConfig = {
  type: string;
  color?: string;
  width?: number;
  height?: number;
};

/**
 * Property schema definition for edge properties (reused from block types)
 */
export interface EdgePropertySchema {
  /** Type of the property */
  type: 'string' | 'number' | 'boolean' | 'enum';

  /** Enum values (required when type is 'enum') */
  enum?: string[];

  /** Minimum value (for number type) */
  min?: number;

  /** Maximum value (for number type) */
  max?: number;

  /** Regex pattern (for string type) */
  pattern?: string;

  /** Description for template prompts */
  description?: string;
}

/**
 * Edge type definition for canvasdown.
 * Defines the structure and default properties for an edge type.
 */
export interface EdgeTypeDefinition<TData = Record<string, unknown>> {
  /** Unique name of the edge type (e.g., 'flow', 'dependency') */
  name: string;

  /** Default shape for edges of this type */
  defaultShape: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier';

  /** Optional default style for edges */
  defaultStyle?: {
    stroke: string;
    strokeWidth: number;
  };

  /** Optional default data for edges */
  defaultData?: TData;

  /** Optional property schema for edge data validation and template generation */
  edgePropertySchema?: Record<string, EdgePropertySchema>;
}
