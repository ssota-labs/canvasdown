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
}
