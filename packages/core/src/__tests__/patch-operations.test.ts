import { beforeEach, describe, expect, it } from 'vitest';
import { CanvasdownCore } from '../core';

describe('Patch Operations - Comprehensive', () => {
  let core: CanvasdownCore;

  beforeEach(() => {
    core = new CanvasdownCore();
    core.registerBlockType({
      name: 'markdown',
      defaultProperties: {
        content: '',
      },
      defaultSize: { width: 300, height: 200 },
    });
    core.registerBlockType({
      name: 'shape',
      defaultProperties: {
        shapeType: 'rectangle',
      },
      defaultSize: { width: 200, height: 100 },
    });
  });

  describe('@update operation', () => {
    it('should parse update with properties', () => {
      const operations = core.parsePatch('@update node1 { title: "Updated" }');
      expect(operations[0]).toBeDefined();
      expect(operations[0]?.type).toBe('update');
      if (operations[0]?.type === 'update') {
        expect(operations[0].properties?.title).toBe('Updated');
      }
    });

    it('should parse update with custom properties', () => {
      const operations = core.parsePatch(
        '@update node1 { $category: "tutorial" }'
      );
      expect(operations[0]).toBeDefined();
      expect(operations[0]?.type).toBe('update');
    });
  });

  describe('@add operation', () => {
    it('should parse add with all fields', () => {
      const operations = core.parsePatch(
        '@add [markdown:newNode] "New Node" { content: "Hello" }'
      );
      expect(operations[0]).toBeDefined();
      expect(operations[0]?.type).toBe('add');
      if (operations[0]?.type === 'add') {
        expect(operations[0].nodeType).toBe('markdown');
        expect(operations[0].targetId).toBe('newNode');
        expect(operations[0].label).toBe('New Node');
        expect(operations[0].properties?.content).toBe('Hello');
      }
    });
  });

  describe('@connect operation', () => {
    it('should parse connect with label', () => {
      const operations = core.parsePatch(
        '@connect node1 -> node2 : "connects"'
      );
      expect(operations[0]).toBeDefined();
      expect(operations[0]?.type).toBe('connect');
      if (operations[0]?.type === 'connect') {
        expect(operations[0].targetId).toBe('node1');
        expect(operations[0].to).toBe('node2');
        expect(operations[0].label).toBe('connects');
      }
    });

    it('should parse connect without label', () => {
      const operations = core.parsePatch('@connect node1 -> node2');
      expect(operations[0]).toBeDefined();
      expect(operations[0]?.type).toBe('connect');
      if (operations[0]?.type === 'connect') {
        expect(operations[0].targetId).toBe('node1');
        expect(operations[0].to).toBe('node2');
      }
    });
  });

  describe('@disconnect operation', () => {
    it('should parse disconnect with target', () => {
      const operations = core.parsePatch('@disconnect node1 -> node2');
      expect(operations[0]).toBeDefined();
      expect(operations[0]?.type).toBe('disconnect');
      if (operations[0]?.type === 'disconnect') {
        expect(operations[0].targetId).toBe('node1');
        expect(operations[0].to).toBe('node2');
      }
    });

    it('should parse disconnect without target (all edges)', () => {
      const operations = core.parsePatch('@disconnect node1');
      expect(operations[0]).toBeDefined();
      expect(operations[0]?.type).toBe('disconnect');
      if (operations[0]?.type === 'disconnect') {
        expect(operations[0].targetId).toBe('node1');
        expect(operations[0].to).toBeUndefined();
      }
    });
  });

  describe('@move operation', () => {
    it('should parse move with position', () => {
      const operations = core.parsePatch('@move node1 { x: 100, y: 200 }');
      expect(operations[0]).toBeDefined();
      expect(operations[0]?.type).toBe('move');
      if (operations[0]?.type === 'move') {
        expect(operations[0].position.x).toBe(100);
        expect(operations[0].position.y).toBe(200);
      }
    });
  });

  describe('@resize operation', () => {
    it('should parse resize with size', () => {
      const operations = core.parsePatch(
        '@resize node1 { width: 400, height: 300 }'
      );
      expect(operations[0]).toBeDefined();
      expect(operations[0]?.type).toBe('resize');
      if (operations[0]?.type === 'resize') {
        expect(operations[0].size.width).toBe(400);
        expect(operations[0].size.height).toBe(300);
      }
    });
  });

  describe('Batch operations', () => {
    it('should parse multiple operations', () => {
      const operations = core.parsePatch(`
        @update node1 { title: "New" }
        @delete node2
        @add [markdown:node3] "Node 3"
        @connect node1 -> node3
      `);
      expect(operations).toHaveLength(4);
      expect(operations[0]?.type).toBe('update');
      expect(operations[1]?.type).toBe('delete');
      expect(operations[2]?.type).toBe('add');
      expect(operations[3]?.type).toBe('connect');
    });
  });

  describe('Validation', () => {
    it('should validate all operations in batch', () => {
      const operations = core.parsePatch(`
        @update node1 { title: "New" }
        @delete node2
        @add [markdown:node3] "Node 3"
      `);
      const result = core.validatePatch(operations, ['node1', 'node2']);
      // node3 doesn't exist yet (will be added), so validation should pass for add
      // But update and delete should validate against existing nodes
      expect(result.valid).toBe(true);
    });

    it('should reject invalid operations', () => {
      const operations = core.parsePatch(
        '@update nonexistent { title: "New" }'
      );
      const result = core.validatePatch(operations, ['node1']);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
