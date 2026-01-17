import { describe, expect, it } from 'vitest';
import { parsePatchDSL } from '../../../src/parser/patch-parser';

describe('PatchParser', () => {
  describe('parsePatchDSL', () => {
    it('should parse @update operation', () => {
      const { cst, errors } = parsePatchDSL(
        '@update node1 { title: "New Title" }'
      );
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse @delete operation', () => {
      const { cst, errors } = parsePatchDSL('@delete node1');
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse @add operation', () => {
      const { cst, errors } = parsePatchDSL(
        '@add [markdown:newNode] "New Node" { description: "Test" }'
      );
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse @connect operation', () => {
      const { cst, errors } = parsePatchDSL(
        '@connect node1 -> node2 : "label"'
      );
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse @disconnect operation', () => {
      const { cst, errors } = parsePatchDSL('@disconnect node1 -> node2');
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse @move operation', () => {
      const { cst, errors } = parsePatchDSL('@move node1 { x: 100, y: 200 }');
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse @resize operation', () => {
      const { cst, errors } = parsePatchDSL(
        '@resize node1 { width: 300, height: 200 }'
      );
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse multiple operations', () => {
      const { cst, errors } = parsePatchDSL(`
        @update node1 { title: "New" }
        @delete node2
        @add [markdown:node3] "Node 3"
      `);
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should report errors for invalid syntax', () => {
      const { errors } = parsePatchDSL('@invalid node1');
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
