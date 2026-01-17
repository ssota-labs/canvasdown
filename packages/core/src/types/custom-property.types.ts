/**
 * Custom Property types for canvasdown.
 * Supports schema definitions and values for user-defined properties.
 */

/**
 * Supported custom property types
 */
export enum CustomPropertyType {
  TEXT = 'text',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  COLOR = 'color',
  URL = 'url',
}

/**
 * Custom property schema definition.
 * Defines the structure and constraints for a custom property.
 */
export interface CustomPropertySchema {
  /** Unique identifier for the schema */
  id: string;

  /** Display name for the property */
  name: string;

  /** Data type of the property */
  type: CustomPropertyType;

  /** Options for select/multiselect types */
  options?: string[];

  /** Validation constraints */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };

  /** Default value for the property */
  defaultValue?: unknown;
}

/**
 * Custom property value.
 * References a schema and contains the actual value.
 */
export interface CustomPropertyValue {
  /** Schema ID that this value references */
  schemaId: string;

  /** The actual value */
  value: unknown;
}
