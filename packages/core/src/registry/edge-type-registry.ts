import type { EdgeTypeDefinition } from '../types/edge-type.types';

/**
 * Registry for edge type definitions.
 * Allows dynamic registration and lookup of edge types.
 */
export class EdgeTypeRegistry {
  private types = new Map<string, EdgeTypeDefinition>();

  /**
   * Register an edge type definition
   */
  register<T extends Record<string, unknown>>(
    definition: EdgeTypeDefinition<T>
  ): void {
    if (this.types.has(definition.name)) {
      throw new Error(`Edge type '${definition.name}' is already registered`);
    }
    this.types.set(definition.name, definition as EdgeTypeDefinition);
  }

  /**
   * Get an edge type definition by name
   */
  get(name: string): EdgeTypeDefinition | undefined {
    return this.types.get(name);
  }

  /**
   * Check if an edge type is registered
   */
  has(name: string): boolean {
    return this.types.has(name);
  }

  /**
   * List all registered edge type names
   */
  list(): string[] {
    return Array.from(this.types.keys());
  }

  /**
   * Clear all registered types
   */
  clear(): void {
    this.types.clear();
  }

  /**
   * Get count of registered types
   */
  size(): number {
    return this.types.size;
  }
}
