import { beforeEach, describe, expect, it } from 'vitest';
import { EdgeTypeRegistry } from '../../registry/edge-type-registry';

describe('EdgeTypeRegistry', () => {
  let registry: EdgeTypeRegistry;

  beforeEach(() => {
    registry = new EdgeTypeRegistry();
  });

  it('should register an edge type', () => {
    registry.register({
      name: 'flow',
      defaultShape: 'default',
    });

    expect(registry.has('flow')).toBe(true);
  });

  it('should get a registered edge type', () => {
    const definition = {
      name: 'flow',
      defaultShape: 'default' as const,
      defaultStyle: { stroke: '#333', strokeWidth: 2 },
    };

    registry.register(definition);
    const retrieved = registry.get('flow');

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('flow');
    expect(retrieved?.defaultStyle).toEqual(definition.defaultStyle);
  });

  it('should return undefined for unregistered type', () => {
    expect(registry.get('unknown')).toBeUndefined();
    expect(registry.has('unknown')).toBe(false);
  });

  it('should list all registered types', () => {
    registry.register({
      name: 'flow',
      defaultShape: 'default',
    });

    registry.register({
      name: 'dependency',
      defaultShape: 'straight',
    });

    const types = registry.list();

    expect(types).toContain('flow');
    expect(types).toContain('dependency');
    expect(types).toHaveLength(2);
  });

  it('should throw error when registering duplicate type', () => {
    registry.register({
      name: 'flow',
      defaultShape: 'default',
    });

    expect(() => {
      registry.register({
        name: 'flow',
        defaultShape: 'default',
      });
    }).toThrow('already registered');
  });

  it('should clear all types', () => {
    registry.register({
      name: 'flow',
      defaultShape: 'default',
    });

    registry.clear();

    expect(registry.size()).toBe(0);
    expect(registry.has('flow')).toBe(false);
  });
});
