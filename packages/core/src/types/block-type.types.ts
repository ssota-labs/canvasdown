/**
 * Property schema definition for validating and constraining block properties.
 * Used for runtime validation and generating template prompts for LLMs.
 */
export interface PropertySchema {
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
 * Block type definition for canvasdown.
 * Defines the structure and default properties for a block type.
 */
export interface BlockTypeDefinition<TProps = Record<string, unknown>> {
  /** Unique name of the block type (e.g., 'shape', 'text') */
  name: string;

  /** Default properties that will be merged with DSL-defined properties */
  defaultProperties: TProps;

  /** Default size for blocks of this type */
  defaultSize: { width: number; height: number };

  /** Optional validation function for properties */
  validate?: (props: TProps) => boolean;

  /** Optional property schema for validation and template generation */
  propertySchema?: Record<string, PropertySchema>;
}
