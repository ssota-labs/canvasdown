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
}
