import { beforeEach, describe, expect, it } from 'vitest';
import { CanvasdownCore } from '../../core';

describe('CanvasdownCore - Patch', () => {
  let core: CanvasdownCore;

  beforeEach(() => {
    core = new CanvasdownCore();
    // Register test block types
    core.registerBlockType({
      name: 'markdown',
      defaultProperties: {
        content: '',
      },
      defaultSize: { width: 300, height: 200 },
    });
  });

  describe('parsePatch', () => {
    it('should parse patch DSL and return operations', () => {
      const operations = core.parsePatch('@update node1 { title: "New" }');
      expect(operations).toHaveLength(1);
      expect(operations[0]).toBeDefined();
      expect(operations[0]!.type).toBe('update');
    });

    it('should throw error for invalid patch DSL', () => {
      expect(() => {
        core.parsePatch('@invalid node1');
      }).toThrow();
    });

    it('should parse patch DSL with UUID nodeIds', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const operations = core.parsePatch(`@update ${uuid} { title: "New" }`);
      expect(operations).toHaveLength(1);
      expect(operations[0]!.type).toBe('update');
      expect((operations[0] as { targetId: string }).targetId).toBe(uuid);
    });
  });

  describe('validatePatch', () => {
    it('should validate update operation with existing node', () => {
      const operations = core.parsePatch('@update node1 { title: "New" }');
      const result = core.validatePatch(operations, ['node1']);
      expect(result.valid).toBe(true);
    });

    it('should reject update operation with non-existent node', () => {
      const operations = core.parsePatch('@update node1 { title: "New" }');
      const result = core.validatePatch(operations, ['node2']);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate add operation with registered block type', () => {
      const operations = core.parsePatch('@add [markdown:newNode] "New Node"');
      const result = core.validatePatch(operations, []);
      expect(result.valid).toBe(true);
    });

    it('should reject add operation with unregistered block type', () => {
      const operations = core.parsePatch('@add [unknown:newNode] "New Node"');
      const result = core.validatePatch(operations, []);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate connect operation with existing nodes', () => {
      const operations = core.parsePatch('@connect node1 -> node2');
      const result = core.validatePatch(operations, ['node1', 'node2']);
      expect(result.valid).toBe(true);
    });

    it('should reject connect operation with non-existent source', () => {
      const operations = core.parsePatch('@connect node1 -> node2');
      const result = core.validatePatch(operations, ['node2']);
      expect(result.valid).toBe(false);
    });

    it('should validate resize operation with positive size', () => {
      const operations = core.parsePatch(
        '@resize node1 { width: 300, height: 200 }'
      );
      const result = core.validatePatch(operations, ['node1']);
      expect(result.valid).toBe(true);
    });

    it('should reject resize operation with negative size', () => {
      const operations = core.parsePatch(
        '@resize node1 { width: -100, height: 200 }'
      );
      const result = core.validatePatch(operations, ['node1']);
      expect(result.valid).toBe(false);
    });

    it('should validate update operation with UUID nodeId', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const operations = core.parsePatch(`@update ${uuid} { title: "New" }`);
      const result = core.validatePatch(operations, [uuid]);
      expect(result.valid).toBe(true);
    });
  });
});
