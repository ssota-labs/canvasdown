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

  it('should validate block properties against propertySchema enum', () => {
    blockRegistry.register({
      name: 'shape-enum',
      defaultProperties: { shapeType: 'rectangle', color: 'blue' },
      defaultSize: { width: 100, height: 100 },
      propertySchema: {
        shapeType: {
          type: 'enum',
          enum: ['rectangle', 'ellipse', 'triangle'],
        },
        color: {
          type: 'enum',
          enum: ['red', 'blue', 'green'],
        },
      },
    });

    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'start',
          type: 'shape-enum',
          label: 'Start',
          properties: { shapeType: 'invalid', color: 'blue' }, // invalid shapeType
        },
      ],
      edges: [],
    };

    expect(() => builder.build(ast)).toThrow(
      "Property 'shapeType' of block 'start' (type 'shape-enum') has invalid value 'invalid'"
    );
  });

  it('should validate block properties against propertySchema number range', () => {
    blockRegistry.register({
      name: 'number-block',
      defaultProperties: { value: 5 },
      defaultSize: { width: 100, height: 100 },
      propertySchema: {
        value: {
          type: 'number',
          min: 1,
          max: 10,
        },
      },
    });

    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'node1',
          type: 'number-block',
          label: 'Node 1',
          properties: { value: 15 }, // exceeds max
        },
      ],
      edges: [],
    };

    expect(() => builder.build(ast)).toThrow(
      "Property 'value' of block 'node1' (type 'number-block') value 15 is greater than maximum 10"
    );
  });

  it('should validate block properties against propertySchema string pattern', () => {
    blockRegistry.register({
      name: 'url-block',
      defaultProperties: { url: '' },
      defaultSize: { width: 100, height: 100 },
      propertySchema: {
        url: {
          type: 'string',
          pattern: '^https?://',
        },
      },
    });

    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'node1',
          type: 'url-block',
          label: 'Node 1',
          properties: { url: 'invalid-url' }, // doesn't match pattern
        },
      ],
      edges: [],
    };

    expect(() => builder.build(ast)).toThrow(
      "Property 'url' of block 'node1' (type 'url-block') value does not match pattern"
    );
  });

  it('should validate block properties against propertySchema boolean', () => {
    blockRegistry.register({
      name: 'bool-block',
      defaultProperties: { enabled: true },
      defaultSize: { width: 100, height: 100 },
      propertySchema: {
        enabled: {
          type: 'boolean',
        },
      },
    });

    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'node1',
          type: 'bool-block',
          label: 'Node 1',
          properties: { enabled: 'not-a-boolean' }, // invalid type
        },
      ],
      edges: [],
    };

    expect(() => builder.build(ast)).toThrow(
      "Property 'enabled' of block 'node1' (type 'bool-block') must be a boolean"
    );
  });

  it('should pass validation when properties match propertySchema', () => {
    blockRegistry.register({
      name: 'shape-valid',
      defaultProperties: { shapeType: 'rectangle', color: 'blue' },
      defaultSize: { width: 100, height: 100 },
      propertySchema: {
        shapeType: {
          type: 'enum',
          enum: ['rectangle', 'ellipse', 'triangle'],
        },
        color: {
          type: 'enum',
          enum: ['red', 'blue', 'green'],
        },
      },
    });

    const ast: CanvasdownAST = {
      direction: 'LR',
      schemas: [],
      nodes: [
        {
          id: 'start',
          type: 'shape-valid',
          label: 'Start',
          properties: { shapeType: 'ellipse', color: 'red' }, // valid values
        },
      ],
      edges: [],
    };

    expect(() => builder.build(ast)).not.toThrow();
  });
});
