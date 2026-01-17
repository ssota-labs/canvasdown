import { beforeEach, describe, expect, it } from 'vitest';
import { GraphBuilder } from '../../builder/graph-builder';
import { BlockTypeRegistry } from '../../registry/block-type-registry';
import { EdgeTypeRegistry } from '../../registry/edge-type-registry';
import type { CanvasdownAST } from '../../types/ast.types';

describe('GraphBuilder', () => {
  let builder: GraphBuilder;
  let blockRegistry: BlockTypeRegistry;
  let edgeRegistry: EdgeTypeRegistry;

  beforeEach(() => {
    blockRegistry = new BlockTypeRegistry();
    edgeRegistry = new EdgeTypeRegistry();

    blockRegistry.register({
      name: 'shape',
      defaultProperties: { shapeType: 'rectangle', color: 'blue' },
      defaultSize: { width: 200, height: 100 },
    });

    blockRegistry.register({
      name: 'text',
      defaultProperties: { content: '' },
      defaultSize: { width: 300, height: 150 },
    });

    edgeRegistry.register({
      name: 'flow',
      defaultShape: 'default',
      defaultStyle: { stroke: '#333', strokeWidth: 2 },
    });

    builder = new GraphBuilder(blockRegistry, edgeRegistry);
  });

  it('should build nodes from AST', () => {
    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'start',
          type: 'shape',
          label: 'Start',
          properties: { shapeType: 'ellipse' },
        },
      ],
      edges: [],
    };

    const { nodes } = builder.build(ast);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.id).toBe('start');
    expect(nodes[0]?.type).toBe('shape');
    expect(nodes[0]?.size).toEqual({ width: 200, height: 100 });
    expect(nodes[0]?.data.shapeType).toBe('ellipse');
    expect(nodes[0]?.data.color).toBe('blue'); // from default
  });

  it('should merge default properties with DSL properties', () => {
    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'start',
          type: 'shape',
          label: 'Start',
          properties: { color: 'green' }, // override default
        },
      ],
      edges: [],
    };

    const { nodes } = builder.build(ast);

    expect(nodes[0]?.data.color).toBe('green');
    expect(nodes[0]?.data.shapeType).toBe('rectangle'); // from default
  });

  it('should build edges from AST', () => {
    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'start',
          type: 'shape',
          label: 'Start',
          properties: {},
        },
        {
          id: 'end',
          type: 'shape',
          label: 'End',
          properties: {},
        },
      ],
      edges: [
        {
          source: 'start',
          target: 'end',
          label: 'begins',
        },
      ],
    };

    const { edges } = builder.build(ast);

    expect(edges).toHaveLength(1);
    expect(edges[0]?.source).toBe('start');
    expect(edges[0]?.target).toBe('end');
    expect(edges[0]?.label).toBe('begins');
  });

  it('should apply edge type defaults', () => {
    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'start',
          type: 'shape',
          label: 'Start',
          properties: {},
        },
        {
          id: 'end',
          type: 'shape',
          label: 'End',
          properties: {},
        },
      ],
      edges: [
        {
          source: 'start',
          target: 'end',
          edgeType: 'flow',
        },
      ],
    };

    const { edges } = builder.build(ast);

    expect(edges[0]?.shape).toBe('default');
    expect(edges[0]?.style).toEqual({ stroke: '#333', strokeWidth: 2 });
  });

  it('should throw error for unknown block type', () => {
    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'start',
          type: 'unknown',
          label: 'Start',
          properties: {},
        },
      ],
      edges: [],
    };

    expect(() => builder.build(ast)).toThrow('Unknown block type');
  });

  it('should throw error for unknown edge type', () => {
    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'start',
          type: 'shape',
          label: 'Start',
          properties: {},
        },
        {
          id: 'end',
          type: 'shape',
          label: 'End',
          properties: {},
        },
      ],
      edges: [
        {
          source: 'start',
          target: 'end',
          edgeType: 'unknown',
        },
      ],
    };

    expect(() => builder.build(ast)).toThrow('Unknown edge type');
  });

  it('should validate block properties if validator provided', () => {
    blockRegistry.register({
      name: 'validated',
      defaultProperties: { value: 0 },
      defaultSize: { width: 100, height: 100 },
      validate: props => (props.value as number) > 0,
    });

    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'start',
          type: 'validated',
          label: 'Start',
          properties: { value: -1 }, // invalid
        },
      ],
      edges: [],
    };

    expect(() => builder.build(ast)).toThrow('Validation failed');
  });
});
