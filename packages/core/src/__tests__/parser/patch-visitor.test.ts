import { describe, expect, it } from 'vitest';
import { cstToPatchOperations, parsePatchDSL } from '../../../src/parser/index';

describe('PatchVisitor', () => {
  describe('cstToPatchOperations', () => {
    it('should convert @update CST to UpdateOperation', () => {
      const { cst } = parsePatchDSL('@update node1 { title: "New Title" }');
      const operations = cstToPatchOperations(cst);
      expect(operations).toHaveLength(1);
      expect(operations[0]).toMatchObject({
        type: 'update',
        targetId: 'node1',
        properties: { title: 'New Title' },
      });
    });

    it('should convert @delete CST to DeleteOperation', () => {
      const { cst } = parsePatchDSL('@delete node1');
      const operations = cstToPatchOperations(cst);
      expect(operations).toHaveLength(1);
      expect(operations[0]).toMatchObject({
        type: 'delete',
        targetId: 'node1',
      });
    });

    it('should convert @add CST to AddOperation', () => {
      const { cst } = parsePatchDSL('@add [markdown:newNode] "New Node"');
      const operations = cstToPatchOperations(cst);
      expect(operations).toHaveLength(1);
      expect(operations[0]).toMatchObject({
        type: 'add',
        targetId: 'newNode',
        nodeType: 'markdown',
        label: 'New Node',
      });
    });

    it('should convert @connect CST to ConnectOperation', () => {
      const { cst } = parsePatchDSL('@connect node1 -> node2 : "label"');
      const operations = cstToPatchOperations(cst);
      expect(operations).toHaveLength(1);
      expect(operations[0]).toMatchObject({
        type: 'connect',
        targetId: 'node1',
        to: 'node2',
        label: 'label',
      });
    });

    it('should convert @disconnect CST to DisconnectOperation', () => {
      const { cst } = parsePatchDSL('@disconnect node1 -> node2');
      const operations = cstToPatchOperations(cst);
      expect(operations).toHaveLength(1);
      expect(operations[0]).toMatchObject({
        type: 'disconnect',
        targetId: 'node1',
        to: 'node2',
      });
    });

    it('should convert @move CST to MoveOperation', () => {
      const { cst } = parsePatchDSL('@move node1 { x: 100, y: 200 }');
      const operations = cstToPatchOperations(cst);
      expect(operations).toHaveLength(1);
      expect(operations[0]).toMatchObject({
        type: 'move',
        targetId: 'node1',
        position: { x: 100, y: 200 },
      });
    });

    it('should convert @resize CST to ResizeOperation', () => {
      const { cst } = parsePatchDSL(
        '@resize node1 { width: 300, height: 200 }'
      );
      const operations = cstToPatchOperations(cst);
      expect(operations).toHaveLength(1);
      expect(operations[0]).toMatchObject({
        type: 'resize',
        targetId: 'node1',
        size: { width: 300, height: 200 },
      });
    });

    it('should convert multiple operations', () => {
      const { cst } = parsePatchDSL(`
        @update node1 { title: "New" }
        @delete node2
      `);
      const operations = cstToPatchOperations(cst);
      expect(operations).toHaveLength(2);
      expect(operations[0].type).toBe('update');
      expect(operations[1].type).toBe('delete');
    });
  });
});
