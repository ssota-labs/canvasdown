import { CanvasdownCore } from '@ssota-labs/canvasdown';
import type {
  AddOperation,
  ConnectOperation,
  DeleteOperation,
  DisconnectOperation,
  MoveOperation,
  ResizeOperation,
  UpdateOperation,
} from '@ssota-labs/canvasdown';
import type { Edge, Node } from '@xyflow/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { applyPatch, type ApplyPatchOptions } from '../../patch/patch-applier';

describe('applyPatch', () => {
  let core: CanvasdownCore;
  let options: ApplyPatchOptions;

  beforeEach(() => {
    core = new CanvasdownCore();
    core.registerBlockType({
      name: 'shape',
      defaultProperties: {
        shapeType: 'rectangle',
        color: 'blue',
      },
      defaultSize: { width: 200, height: 100 },
    });
    core.registerBlockType({
      name: 'markdown',
      defaultProperties: {
        content: '',
      },
      defaultSize: { width: 300, height: 200 },
    });

    options = {
      preservePositions: true,
      core,
      direction: 'LR',
    };
  });

  const createNode = (
    id: string,
    data: Record<string, unknown> = {}
  ): Node => ({
    id,
    type: 'shape',
    position: { x: 0, y: 0 },
    width: 200,
    height: 100,
    data: { title: id, ...data },
  });

  const createEdge = (id: string, source: string, target: string): Edge => ({
    id,
    source,
    target,
    type: 'default',
  });

  describe('@update operation', () => {
    it('should update node properties', () => {
      const nodes = [createNode('node1')];
      const edges: Edge[] = [];

      const operation: UpdateOperation = {
        type: 'update',
        targetId: 'node1',
        properties: { title: 'Updated Title', color: 'red' },
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.nodes[0]?.data.title).toBe('Updated Title');
      expect(result.nodes[0]?.data.color).toBe('red');
    });

    it('should throw error if node not found', () => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      const operation: UpdateOperation = {
        type: 'update',
        targetId: 'nonexistent',
        properties: { title: 'Test' },
      };

      expect(() => applyPatch([operation], nodes, edges, options)).toThrow();
    });

    it('should update custom properties', () => {
      const nodes = [createNode('node1')];
      const edges: Edge[] = [];

      const operation: UpdateOperation = {
        type: 'update',
        targetId: 'node1',
        customProperties: [{ key: 'category', value: 'tutorial' }],
      };

      const result = applyPatch([operation], nodes, edges, options);

      const customProps = result.nodes[0]?.data.customProperties as Array<{
        schemaId: string;
        value: unknown;
      }>;
      expect(customProps).toBeDefined();
      expect(customProps[0]?.schemaId).toBe('category');
      expect(customProps[0]?.value).toBe('tutorial');
    });
  });

  describe('@add operation', () => {
    it('should add a new node', () => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      const operation: AddOperation = {
        type: 'add',
        targetId: 'newNode',
        nodeType: 'shape',
        label: 'New Node',
        properties: { color: 'green' },
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]?.id).toBe('newNode');
      expect(result.nodes[0]?.type).toBe('shape');
      expect(result.nodes[0]?.data.title).toBe('New Node');
      expect(result.nodes[0]?.data.color).toBe('green');
    });

    it('should throw error if node already exists', () => {
      const nodes = [createNode('node1')];
      const edges: Edge[] = [];

      const operation: AddOperation = {
        type: 'add',
        targetId: 'node1',
        nodeType: 'shape',
        label: 'Duplicate',
      };

      expect(() => applyPatch([operation], nodes, edges, options)).toThrow();
    });
  });

  describe('@delete operation', () => {
    it('should delete a node', () => {
      const nodes = [createNode('node1'), createNode('node2')];
      const edges: Edge[] = [];

      const operation: DeleteOperation = {
        type: 'delete',
        targetId: 'node1',
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]?.id).toBe('node2');
    });

    it('should delete connected edges when deleting node', () => {
      const nodes = [createNode('node1'), createNode('node2')];
      const edges = [
        createEdge('edge1', 'node1', 'node2'),
        createEdge('edge2', 'node2', 'node1'),
      ];

      const operation: DeleteOperation = {
        type: 'delete',
        targetId: 'node1',
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);
    });
  });

  describe('@connect operation', () => {
    it('should create a new edge', () => {
      const nodes = [createNode('node1'), createNode('node2')];
      const edges: Edge[] = [];

      const operation: ConnectOperation = {
        type: 'connect',
        targetId: 'node1',
        to: 'node2',
        label: 'connects',
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]?.source).toBe('node1');
      expect(result.edges[0]?.target).toBe('node2');
      expect(result.edges[0]?.label).toBe('connects');
      expect(result.edges[0]?.sourceHandle).toBe('right');
      expect(result.edges[0]?.targetHandle).toBe('left');
    });

    it('should update existing edge if already connected', () => {
      const nodes = [createNode('node1'), createNode('node2')];
      const edges = [createEdge('edge1', 'node1', 'node2')];

      const operation: ConnectOperation = {
        type: 'connect',
        targetId: 'node1',
        to: 'node2',
        label: 'updated label',
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]?.label).toBe('updated label');
    });

    it('should use correct handles for different directions', () => {
      const nodes = [createNode('node1'), createNode('node2')];
      const edges: Edge[] = [];

      const operation: ConnectOperation = {
        type: 'connect',
        targetId: 'node1',
        to: 'node2',
      };

      const tbOptions = { ...options, direction: 'TB' as const };
      const result = applyPatch([operation], nodes, edges, tbOptions);

      expect(result.edges[0]?.sourceHandle).toBe('bottom');
      expect(result.edges[0]?.targetHandle).toBe('top');
    });
  });

  describe('@disconnect operation', () => {
    it('should remove specific edge', () => {
      const nodes = [
        createNode('node1'),
        createNode('node2'),
        createNode('node3'),
      ];
      const edges = [
        createEdge('edge1', 'node1', 'node2'),
        createEdge('edge2', 'node1', 'node3'),
      ];

      const operation: DisconnectOperation = {
        type: 'disconnect',
        targetId: 'node1',
        to: 'node2',
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]?.id).toBe('edge2');
    });

    it('should remove all edges from source if to is not specified', () => {
      const nodes = [
        createNode('node1'),
        createNode('node2'),
        createNode('node3'),
      ];
      const edges = [
        createEdge('edge1', 'node1', 'node2'),
        createEdge('edge2', 'node1', 'node3'),
        createEdge('edge3', 'node2', 'node3'),
      ];

      const operation: DisconnectOperation = {
        type: 'disconnect',
        targetId: 'node1',
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]?.id).toBe('edge3');
    });
  });

  describe('@move operation', () => {
    it('should update node position', () => {
      const nodes = [createNode('node1')];
      const edges: Edge[] = [];

      const operation: MoveOperation = {
        type: 'move',
        targetId: 'node1',
        position: { x: 100, y: 200 },
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.nodes[0]?.position).toEqual({ x: 100, y: 200 });
    });

    it('should throw error if node not found', () => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      const operation: MoveOperation = {
        type: 'move',
        targetId: 'nonexistent',
        position: { x: 0, y: 0 },
      };

      expect(() => applyPatch([operation], nodes, edges, options)).toThrow();
    });
  });

  describe('@resize operation', () => {
    it('should update node size', () => {
      const nodes = [createNode('node1')];
      const edges: Edge[] = [];

      const operation: ResizeOperation = {
        type: 'resize',
        targetId: 'node1',
        size: { width: 300, height: 250 },
      };

      const result = applyPatch([operation], nodes, edges, options);

      expect(result.nodes[0]?.width).toBe(300);
      expect(result.nodes[0]?.height).toBe(250);
    });

    it('should throw error if node not found', () => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      const operation: ResizeOperation = {
        type: 'resize',
        targetId: 'nonexistent',
        size: { width: 100, height: 100 },
      };

      expect(() => applyPatch([operation], nodes, edges, options)).toThrow();
    });
  });

  describe('multiple operations', () => {
    it('should apply multiple operations in sequence', () => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      const operations = [
        {
          type: 'add' as const,
          targetId: 'node1',
          nodeType: 'shape',
          label: 'Node 1',
        } as AddOperation,
        {
          type: 'add' as const,
          targetId: 'node2',
          nodeType: 'shape',
          label: 'Node 2',
        } as AddOperation,
        {
          type: 'connect' as const,
          targetId: 'node1',
          to: 'node2',
          label: 'connects',
        } as ConnectOperation,
        {
          type: 'update' as const,
          targetId: 'node1',
          properties: { color: 'red' },
        } as UpdateOperation,
      ];

      const result = applyPatch(operations, nodes, edges, options);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.nodes[0]?.data.color).toBe('red');
    });
  });
});
