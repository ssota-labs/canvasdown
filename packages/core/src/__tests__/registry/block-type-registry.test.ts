import { beforeEach, describe, expect, it } from 'vitest';
import { BlockTypeRegistry } from '../../registry/block-type-registry';

describe('BlockTypeRegistry', () => {
  let registry: BlockTypeRegistry;

  beforeEach(() => {
    registry = new BlockTypeRegistry();
  });

  it('should register a block type', () => {
    registry.register({
      name: 'shape',
      defaultProperties: { shapeType: 'rectangle' },
      defaultSize: { width: 200, height: 100 },
    });

    expect(registry.has('shape')).toBe(true);
  });

  it('should get a registered block type', () => {
    const definition = {
      name: 'shape',
      defaultProperties: { shapeType: 'rectangle' },
      defaultSize: { width: 200, height: 100 },
    };

    registry.register(definition);
    const retrieved = registry.get('shape');

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('shape');
  });

  it('should return undefined for unregistered type', () => {
    expect(registry.get('unknown')).toBeUndefined();
    expect(registry.has('unknown')).toBe(false);
  });

  it('should list all registered types', () => {
    registry.register({
      name: 'shape',
      defaultProperties: {},
      defaultSize: { width: 200, height: 100 },
    });

    registry.register({
      name: 'text',
      defaultProperties: {},
      defaultSize: { width: 300, height: 150 },
    });

    const types = registry.list();

    expect(types).toContain('shape');
    expect(types).toContain('text');
    expect(types).toHaveLength(2);
  });

  it('should throw error when registering duplicate type', () => {
    registry.register({
      name: 'shape',
      defaultProperties: {},
      defaultSize: { width: 200, height: 100 },
    });

    expect(() => {
      registry.register({
        name: 'shape',
        defaultProperties: {},
        defaultSize: { width: 200, height: 100 },
      });
    }).toThrow('already registered');
  });

  it('should clear all types', () => {
    registry.register({
      name: 'shape',
      defaultProperties: {},
      defaultSize: { width: 200, height: 100 },
    });

    registry.clear();

    expect(registry.size()).toBe(0);
    expect(registry.has('shape')).toBe(false);
  });
});
