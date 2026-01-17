import type { BlockTypeDefinition } from '../types/block-type.types';

/**
 * Registry for block type definitions.
 * Allows dynamic registration and lookup of block types.
 */
export class BlockTypeRegistry {
  private types = new Map<string, BlockTypeDefinition>();

  /**
   * Register a block type definition
   */
  register<T extends Record<string, unknown>>(
    definition: BlockTypeDefinition<T>
  ): void {
    if (this.types.has(definition.name)) {
      throw new Error(`Block type '${definition.name}' is already registered`);
    }
    this.types.set(definition.name, definition as BlockTypeDefinition);
  }

  /**
   * Get a block type definition by name
   */
  get(name: string): BlockTypeDefinition | undefined {
    return this.types.get(name);
  }

  /**
   * Check if a block type is registered
   */
  has(name: string): boolean {
    return this.types.has(name);
  }

  /**
   * List all registered block type names
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
