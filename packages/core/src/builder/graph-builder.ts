import type { CanvasdownCoreOptions } from '../core';
import { BlockTypeRegistry } from '../registry/block-type-registry';
import { EdgeTypeRegistry } from '../registry/edge-type-registry';
import type { ASTEdge, ASTNode, CanvasdownAST } from '../types/ast.types';
import type { PropertySchema } from '../types/block-type.types';
import type {
  CustomPropertySchema,
  CustomPropertyValue,
} from '../types/custom-property.types';
import { CustomPropertyType } from '../types/custom-property.types';
import type { MarkerConfig } from '../types/edge-type.types';
import type { GraphEdge, GraphNode } from '../types/graph.types';

/**
 * Builder that converts AST to graph data.
 * Merges default properties from type registries with DSL-defined properties.
 */
export class GraphBuilder {
  constructor(
    private blockRegistry: BlockTypeRegistry,
    private edgeRegistry: EdgeTypeRegistry,
    private options?: CanvasdownCoreOptions
  ) {}

  /**
   * Build graph data from AST
   */
  build(ast: CanvasdownAST): { nodes: GraphNode[]; edges: GraphEdge[] } {
    // Build schema map for validation
    const schemaMap = new Map<string, CustomPropertySchema>();
    for (const schema of ast.schemas) {
      schemaMap.set(schema.id, schema);
    }

    // Process inline schemas from type functions
    const inlineSchemas = this.extractInlineSchemas(ast.nodes);
    for (const schema of inlineSchemas) {
      schemaMap.set(schema.id, schema);
    }

    const nodes = ast.nodes.map(n => this.buildNode(n, schemaMap));
    const edges = ast.edges.map((e, index) => this.buildEdge(e, index));

    // Validate parent-child relationships
    this.validateParentChildRelationships(nodes);

    return { nodes, edges };
  }

  /**
   * Validate that parent nodes exist and are group types
   */
  private validateParentChildRelationships(nodes: GraphNode[]): void {
    const nodeMap = new Map<string, GraphNode>();
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }

    for (const node of nodes) {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (!parent) {
          throw new Error(
            `Node '${node.id}' references non-existent parent '${node.parentId}'`
          );
        }

        // Check if parent is a group type
        const parentTypeDef = this.blockRegistry.get(parent.type);
        if (!parentTypeDef || !parentTypeDef.isGroup) {
          throw new Error(
            `Node '${node.id}' has parent '${node.parentId}' which is not a group type (type: '${parent.type}')`
          );
        }
      }
    }
  }

  /**
   * Build a graph node from an AST node
   */
  private buildNode(
    astNode: ASTNode,
    schemaMap: Map<string, CustomPropertySchema>
  ): GraphNode {
    const typeDef = this.blockRegistry.get(astNode.type);

    if (!typeDef) {
      const availableTypes = this.blockRegistry.list();
      throw new Error(
        `Unknown block type: '${astNode.type}'. ` +
          `Available types: ${
            availableTypes.length > 0 ? availableTypes.join(', ') : 'none'
          }`
      );
    }

    // Merge default properties with DSL properties (DSL overrides defaults)
    const mergedProperties = this.mergeProperties(
      typeDef.defaultProperties,
      astNode.properties
    );

    // Validate against propertySchema if provided
    if (typeDef.propertySchema) {
      this.validatePropertySchema(
        typeDef.propertySchema,
        mergedProperties,
        astNode.id,
        astNode.type
      );
    }

    // Validate if validator is provided
    if (typeDef.validate && !typeDef.validate(mergedProperties)) {
      throw new Error(
        `Validation failed for block '${astNode.id}' of type '${astNode.type}'`
      );
    }

    // Process custom properties
    const customProperties: CustomPropertyValue[] = [];
    if (astNode.customProperties) {
      for (const customProp of astNode.customProperties) {
        // Check if value is a type function result and extract actual value
        let actualValue = customProp.value;
        if (
          actualValue &&
          typeof actualValue === 'object' &&
          '_typeFunction' in actualValue
        ) {
          const typeFunc = actualValue as {
            _typeFunction: string;
            _value: unknown;
            _options?: Record<string, unknown>;
          };
          actualValue = typeFunc._value;
        }

        // Validate schema exists
        const schema = schemaMap.get(customProp.schemaId);
        if (!schema) {
          throw new Error(
            `Unknown custom property schema: '${customProp.schemaId}' for block '${astNode.id}'`
          );
        }

        // Validate value against schema
        this.validateCustomPropertyValue(schema, actualValue);

        customProperties.push({
          schemaId: customProp.schemaId,
          value: actualValue,
        });
      }
    }

    // Build final data object
    const data: Record<string, unknown> = {
      ...mergedProperties,
      ...(customProperties.length > 0 && { customProperties }),
    };

    const graphNode: GraphNode = {
      id: astNode.id,
      type: astNode.type,
      position: { x: 0, y: 0 }, // Will be calculated by layout engine
      size: typeDef.defaultSize,
      data,
    };

    // Preserve parentId if present
    if (astNode.parentId) {
      graphNode.parentId = astNode.parentId;
      // Apply default extent if not explicitly set in DSL properties
      // DSL properties take precedence over defaultExtent option
      if (!data.extent && this.options?.defaultExtent !== undefined) {
        data.extent = this.options.defaultExtent;
      }
    }

    return graphNode;
  }

  /**
   * Build a graph edge from an AST edge
   */
  private buildEdge(astEdge: ASTEdge, index: number): GraphEdge {
    const edgeId = `edge-${astEdge.source}-${astEdge.target}-${index}`;

    let shape: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier' =
      'default';
    let style: { stroke: string; strokeWidth: number } | undefined;
    let defaultData: Record<string, unknown> = {};
    let markerEnd: string | MarkerConfig | undefined;
    let markerStart: string | MarkerConfig | undefined;

    // If edge type is specified, get defaults from registry
    if (astEdge.edgeType) {
      const typeDef = this.edgeRegistry.get(astEdge.edgeType);

      if (!typeDef) {
        const availableTypes = this.edgeRegistry.list();
        throw new Error(
          `Unknown edge type: '${astEdge.edgeType}'. ` +
            `Available types: ${
              availableTypes.length > 0 ? availableTypes.join(', ') : 'none'
            }`
        );
      }

      shape = typeDef.defaultShape;
      style = typeDef.defaultStyle;
      defaultData = { ...(typeDef.defaultData || {}) };

      // Extract markers from defaultData if present
      if (defaultData.markerEnd !== undefined) {
        markerEnd = defaultData.markerEnd as string | MarkerConfig;
        const { markerEnd: _markerEnd, ...rest } = defaultData;
        defaultData = rest;
      }
      if (defaultData.markerStart !== undefined) {
        markerStart = defaultData.markerStart as string | MarkerConfig;
        const { markerStart: _markerStart, ...rest } = defaultData;
        defaultData = rest;
      }
    }

    // DSL에서 지정한 마커가 있으면 우선 (병합)
    if (astEdge.markerEnd !== undefined) {
      markerEnd = astEdge.markerEnd;
    }
    if (astEdge.markerStart !== undefined) {
      markerStart = astEdge.markerStart;
    }

    // Merge default edge data with DSL edge data
    const mergedData = this.mergeProperties(
      defaultData,
      astEdge.edgeData || {}
    );

    // Extract markers from mergedData if present (DSL에서 지정한 경우)
    if (mergedData.markerEnd !== undefined) {
      markerEnd = mergedData.markerEnd as string | MarkerConfig;
      const { markerEnd: _markerEnd, ...rest } = mergedData;
      Object.assign(mergedData, rest);
    }
    if (mergedData.markerStart !== undefined) {
      markerStart = mergedData.markerStart as string | MarkerConfig;
      const { markerStart: _markerStart, ...rest } = mergedData;
      Object.assign(mergedData, rest);
    }

    return {
      id: edgeId,
      source: astEdge.source,
      target: astEdge.target,
      ...(astEdge.label && { label: astEdge.label }),
      ...(astEdge.startLabel && { startLabel: astEdge.startLabel }),
      ...(astEdge.endLabel && { endLabel: astEdge.endLabel }),
      ...(markerEnd && { markerEnd }),
      ...(markerStart && { markerStart }),
      shape,
      ...(style && { style }),
      data: mergedData,
    };
  }

  /**
   * Merge two property objects, with second object taking precedence
   */
  private mergeProperties(
    defaults: Record<string, unknown>,
    overrides: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      ...defaults,
      ...overrides,
    };
  }

  /**
   * Extract inline schemas from type functions in nodes
   */
  private extractInlineSchemas(astNodes: ASTNode[]): CustomPropertySchema[] {
    const schemas: CustomPropertySchema[] = [];
    const seenSchemas = new Set<string>();

    for (const node of astNodes) {
      if (node.customProperties) {
        for (const customProp of node.customProperties) {
          // Check if value is a type function result
          if (
            customProp.value &&
            typeof customProp.value === 'object' &&
            '_typeFunction' in customProp.value
          ) {
            const typeFunc = customProp.value as {
              _typeFunction: string;
              _value: unknown;
              _options?: Record<string, unknown>;
            };

            const schemaId = customProp.schemaId;
            if (!seenSchemas.has(schemaId)) {
              seenSchemas.add(schemaId);

              // Extract property name from schemaId (format: inline_<name>_<type>)
              const match = schemaId.match(/^inline_(.+)_(.+)$/);
              const name: string = match?.[1] ?? schemaId;
              const typeName = typeFunc._typeFunction;

              const validationObj: {
                min?: number;
                max?: number;
                pattern?: string;
              } = {};
              if (typeFunc._options?.min !== undefined) {
                validationObj.min = typeFunc._options.min as number;
              }
              if (typeFunc._options?.max !== undefined) {
                validationObj.max = typeFunc._options.max as number;
              }
              if (typeFunc._options?.pattern) {
                validationObj.pattern = typeFunc._options.pattern as string;
              }
              const validation =
                Object.keys(validationObj).length > 0
                  ? validationObj
                  : undefined;

              const schema: CustomPropertySchema = {
                id: schemaId,
                name,
                type: this.parsePropertyType(typeName),
                ...(typeFunc._options?.options
                  ? { options: typeFunc._options.options as string[] }
                  : {}),
                ...(validation ? { validation } : {}),
              };

              schemas.push(schema);
            }
          }
        }
      }
    }

    return schemas;
  }

  /**
   * Validate custom property value against schema
   */
  private validateCustomPropertyValue(
    schema: CustomPropertySchema,
    value: unknown
  ): void {
    // Type validation
    switch (schema.type) {
      case CustomPropertyType.NUMBER:
        if (typeof value !== 'number') {
          throw new Error(
            `Custom property '${schema.id}' expects number, got ${typeof value}`
          );
        }
        if (schema.validation) {
          if (
            schema.validation.min !== undefined &&
            value < schema.validation.min
          ) {
            throw new Error(
              `Custom property '${schema.id}' value ${value} is below minimum ${schema.validation.min}`
            );
          }
          if (
            schema.validation.max !== undefined &&
            value > schema.validation.max
          ) {
            throw new Error(
              `Custom property '${schema.id}' value ${value} is above maximum ${schema.validation.max}`
            );
          }
        }
        break;

      case CustomPropertyType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new Error(
            `Custom property '${
              schema.id
            }' expects boolean, got ${typeof value}`
          );
        }
        break;

      case CustomPropertyType.SELECT:
        if (schema.options && !schema.options.includes(value as string)) {
          throw new Error(
            `Custom property '${
              schema.id
            }' value '${value}' is not in options: ${schema.options.join(', ')}`
          );
        }
        break;

      case CustomPropertyType.URL:
        if (schema.validation?.pattern) {
          const pattern = new RegExp(schema.validation.pattern);
          if (!pattern.test(value as string)) {
            throw new Error(
              `Custom property '${schema.id}' value does not match URL pattern`
            );
          }
        }
        break;
    }
  }

  /**
   * Parse property type string to enum
   */
  private parsePropertyType(typeStr: string): CustomPropertyType {
    const normalized = typeStr.toLowerCase();
    switch (normalized) {
      case 'text':
        return CustomPropertyType.TEXT;
      case 'select':
        return CustomPropertyType.SELECT;
      case 'multiselect':
        return CustomPropertyType.MULTISELECT;
      case 'number':
        return CustomPropertyType.NUMBER;
      case 'boolean':
        return CustomPropertyType.BOOLEAN;
      case 'date':
        return CustomPropertyType.DATE;
      case 'color':
        return CustomPropertyType.COLOR;
      case 'url':
        return CustomPropertyType.URL;
      default:
        return CustomPropertyType.TEXT;
    }
  }

  /**
   * Validate properties against propertySchema
   */
  private validatePropertySchema(
    propertySchema: Record<string, PropertySchema>,
    properties: Record<string, unknown>,
    blockId: string,
    blockType: string
  ): void {
    for (const [propName, schema] of Object.entries(propertySchema)) {
      const value = properties[propName];

      // Skip validation if property is not set (optional properties)
      if (value === undefined) {
        continue;
      }

      switch (schema.type) {
        case 'enum':
          if (schema.enum && !schema.enum.includes(value as string)) {
            throw new Error(
              `Property '${propName}' of block '${blockId}' (type '${blockType}') ` +
                `has invalid value '${value}'. ` +
                `Allowed values: ${schema.enum.join(', ')}`
            );
          }
          break;

        case 'number':
          if (typeof value !== 'number') {
            throw new Error(
              `Property '${propName}' of block '${blockId}' (type '${blockType}') ` +
                `must be a number, got ${typeof value}`
            );
          }
          if (schema.min !== undefined && value < schema.min) {
            throw new Error(
              `Property '${propName}' of block '${blockId}' (type '${blockType}') ` +
                `value ${value} is less than minimum ${schema.min}`
            );
          }
          if (schema.max !== undefined && value > schema.max) {
            throw new Error(
              `Property '${propName}' of block '${blockId}' (type '${blockType}') ` +
                `value ${value} is greater than maximum ${schema.max}`
            );
          }
          break;

        case 'string':
          if (typeof value !== 'string') {
            throw new Error(
              `Property '${propName}' of block '${blockId}' (type '${blockType}') ` +
                `must be a string, got ${typeof value}`
            );
          }
          if (schema.pattern) {
            const pattern = new RegExp(schema.pattern);
            if (!pattern.test(value)) {
              throw new Error(
                `Property '${propName}' of block '${blockId}' (type '${blockType}') ` +
                  `value does not match pattern: ${schema.pattern}`
              );
            }
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            throw new Error(
              `Property '${propName}' of block '${blockId}' (type '${blockType}') ` +
                `must be a boolean, got ${typeof value}`
            );
          }
          break;
      }
    }
  }
}
