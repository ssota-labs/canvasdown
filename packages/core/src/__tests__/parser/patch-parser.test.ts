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

    it('should parse @update with UUID as nodeId', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const { cst, errors } = parsePatchDSL(
        `@update ${uuid} { title: "Updated" }`
      );
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse @delete with UUID as nodeId', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const { cst, errors } = parsePatchDSL(`@delete ${uuid}`);
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse @connect with UUID source and target', () => {
      const a = '550e8400-e29b-41d4-a716-446655440000';
      const b = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const { cst, errors } = parsePatchDSL(`@connect ${a} -> ${b}`);
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });

    it('should parse @add with UUID as nodeId', () => {
      const uuid = 'deadbeef-e29b-41d4-a716-446655440000';
      const { cst, errors } = parsePatchDSL(
        `@add [markdown:${uuid}] "New Node"`
      );
      expect(errors).toHaveLength(0);
      expect(cst).toBeDefined();
    });
  });
});
