import { type CstNode, type IToken } from 'chevrotain';
import type {
  ASTEdge,
  ASTNode,
  CanvasdownAST,
  Direction,
} from '../types/ast.types';
import type {
  CustomPropertySchema,
  CustomPropertyValue,
} from '../types/custom-property.types';
import { CustomPropertyType } from '../types/custom-property.types';
import { CanvasdownParser } from './parser';

// Get the base visitor class from the parser instance
const parserInstance = new CanvasdownParser();
const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructor();

/**
 * Visitor that converts CST (Concrete Syntax Tree) to AST (Abstract Syntax Tree).
 */
export class CanvasdownVisitor extends BaseCstVisitor {
  constructor() {
    super();
    // Validate that all required methods are implemented
    this.validateVisitor();
  }

  /**
   * Root visitor method
   */
  canvasdown(ctx: any): CanvasdownAST {
    const direction = this.visit(ctx.canvasDeclaration) as Direction;
    const schemas: CustomPropertySchema[] = [];
    const nodes: ASTNode[] = [];
    const edges: ASTEdge[] = [];

    // Collect schemas first
    if (ctx.schemaDefinition) {
      for (const schemaDef of ctx.schemaDefinition) {
        const schema = this.visit(schemaDef) as CustomPropertySchema;
        if (schema) {
          schemas.push(schema);
        }
      }
    }

    // Collect nodes
    if (ctx.blockDefinition) {
      for (const blockDef of ctx.blockDefinition) {
        const node = this.visit(blockDef) as ASTNode;
        if (node) {
          nodes.push(node);
        }
      }
    }

    // Collect edges
    if (ctx.edgeDefinition) {
      for (const edgeDef of ctx.edgeDefinition) {
        const edge = this.visit(edgeDef) as ASTEdge;
        if (edge) {
          edges.push(edge);
        }
      }
    }

    return {
      direction,
      schemas,
      nodes,
      edges,
    };
  }

  /**
   * Visit canvas declaration: "canvas LR"
   */
  canvasDeclaration(ctx: any): Direction {
    const directionToken = ctx.Direction[0] as IToken;
    return directionToken.image as Direction;
  }

  /**
   * Visit schema definition: @schema id { type: ..., options: ..., ... }
   */
  schemaDefinition(ctx: any): CustomPropertySchema {
    const id = this.getTokenText(ctx.id[0]);
    const result = this.visit(ctx.properties[0]) as {
      properties: Record<string, unknown>;
      customProperties: CustomPropertyValue[];
    };
    // Schema definitions only have regular properties, not custom properties
    const properties = result.properties;

    // Extract schema fields
    const name = (properties.name as string) || id;
    const typeStr = (properties.type as string) || 'text';
    const type = this.parsePropertyType(typeStr);
    const options = properties.options as string[] | undefined;
    const validation = properties.validation as
      | { min?: number; max?: number; pattern?: string }
      | undefined;
    const defaultValue = properties.defaultValue;

    return {
      id,
      name,
      type,
      ...(options && { options }),
      ...(validation && { validation }),
      ...(defaultValue !== undefined && { defaultValue }),
    };
  }

  /**
   * Visit block definition: @blockType id "label" { properties }
   */
  blockDefinition(ctx: any): ASTNode {
    const blockType = this.getTokenText(ctx.blockType[0]);
    const id = this.getTokenText(ctx.id[0]);
    const labelToken = ctx.label[0] as IToken;
    const label = this.unquoteString(labelToken.image);

    let properties: Record<string, unknown> = {};
    let customProperties: CustomPropertyValue[] = [];

    if (ctx.properties) {
      const result = this.visit(ctx.properties[0]) as {
        properties: Record<string, unknown>;
        customProperties: CustomPropertyValue[];
      };
      properties = result.properties;
      customProperties = result.customProperties;
    }

    return {
      id,
      type: blockType,
      label,
      properties,
      ...(customProperties.length > 0 && { customProperties }),
    };
  }

  /**
   * Visit edge definition: source -> target : label? edgeType? { edgeData? }
   */
  edgeDefinition(ctx: any): ASTEdge {
    const source = this.getTokenText(ctx.source[0]);
    if (!ctx.target || !ctx.target[0]) {
      throw new Error('Edge target is required');
    }
    const target = this.getTokenText(ctx.target[0]);

    let label: string | undefined;
    let edgeType: string | undefined;
    let edgeData: Record<string, unknown> | undefined;

    // Handle label or edgeType after colon
    if (ctx.label) {
      const labelToken = ctx.label[0] as IToken;
      label = this.unquoteString(labelToken.image);
    } else if (ctx.edgeType) {
      edgeType = this.getTokenText(ctx.edgeType[0]);
    }

    // Handle edge properties
    if (ctx.edgeProperties) {
      edgeData = this.visit(ctx.edgeProperties[0]) as Record<string, unknown>;
    }

    // Extract label-related fields from edgeData
    let startLabel: string | undefined;
    let endLabel: string | undefined;

    if (edgeData) {
      // If label is in edgeData but not in colon syntax, use it
      if (edgeData.label && typeof edgeData.label === 'string' && !label) {
        label = edgeData.label;
      }

      // Extract startLabel and endLabel from edgeData
      if (edgeData.startLabel && typeof edgeData.startLabel === 'string') {
        startLabel = edgeData.startLabel;
        // Remove from edgeData to avoid duplication
        const { startLabel: _startLabel, ...rest } = edgeData;
        edgeData = rest;
      }

      if (edgeData.endLabel && typeof edgeData.endLabel === 'string') {
        endLabel = edgeData.endLabel;
        // Remove from edgeData to avoid duplication
        const { endLabel: _endLabel, ...rest } = edgeData;
        edgeData = rest;
      }

      // Also remove label from edgeData if it was extracted
      if (edgeData.label && typeof edgeData.label === 'string') {
        const { label: _label, ...rest } = edgeData;
        edgeData = rest;
      }
    }

    return {
      source,
      target,
      ...(label && { label }),
      ...(startLabel && { startLabel }),
      ...(endLabel && { endLabel }),
      ...(edgeType && { edgeType }),
      ...(edgeData && Object.keys(edgeData).length > 0 && { edgeData }),
    };
  }

  /**
   * Visit properties block: { key: value, ... }
   * Separates regular properties from custom properties ($ prefix)
   */
  properties(ctx: any): {
    properties: Record<string, unknown>;
    customProperties: CustomPropertyValue[];
  } {
    const props: Record<string, unknown> = {};
    const customProps: CustomPropertyValue[] = [];

    // Process custom properties
    if (ctx.customProperty) {
      for (const customProp of ctx.customProperty) {
        const result = this.visit(customProp) as {
          customKey: string;
          value: unknown;
          typeFunction?: {
            typeName: string;
            value: unknown;
            options?: Record<string, unknown>;
          };
        };

        const customKey = result.customKey;
        let schemaId: string;
        let value: unknown;

        if (result.typeFunction) {
          // Inline type function: $key: typeFunction(value, { options })
          // Generate a schema ID from the type function
          schemaId = `inline_${customKey}_${result.typeFunction.typeName}`;
          value = {
            _typeFunction: result.typeFunction.typeName,
            _value: result.typeFunction.value,
            _options: result.typeFunction.options,
          };
        } else {
          // Reference to schema: $key: "value"
          schemaId = customKey;
          value = result.value;
        }

        customProps.push({
          schemaId,
          value,
        });
      }
    }

    // Process regular properties
    if (ctx.regularProperty) {
      for (const regularProp of ctx.regularProperty) {
        const result = this.visit(regularProp) as {
          key: string;
          value: unknown;
        };
        props[result.key] = result.value;
      }
    }

    return {
      properties: props,
      customProperties: customProps,
    };
  }

  /**
   * Visit edge properties block: { key: value, ... }
   * Edges don't support custom properties, so we only return regular properties
   */
  edgeProperties(ctx: any): Record<string, unknown> {
    const result = this.properties(ctx) as {
      properties: Record<string, unknown>;
      customProperties: CustomPropertyValue[];
    };
    // Edges don't support custom properties, return only regular properties
    return result.properties;
  }

  /**
   * Visit custom property: $key : value | $key : typeFunction(...)
   */
  customProperty(ctx: any): {
    customKey: string;
    value: unknown;
    typeFunction?: {
      typeName: string;
      value: unknown;
      options?: Record<string, unknown>;
    };
  } {
    const customKey = this.getTokenText(ctx.customPropertyKey[0]);

    // Check if it's a type function
    if (ctx.typeFunction) {
      const typeFunc = this.visit(ctx.typeFunction[0]) as {
        typeName: string;
        value: unknown;
        options?: Record<string, unknown>;
      };
      return {
        customKey,
        value: typeFunc.value,
        typeFunction: typeFunc,
      };
    } else {
      // Regular custom property value
      const value = this.visit(ctx.customPropertyValue[0]);
      return {
        customKey,
        value,
      };
    }
  }

  /**
   * Visit regular property: key : value
   */
  regularProperty(ctx: any): { key: string; value: unknown } {
    const key = this.getTokenText(ctx.key[0]);
    const value = this.visit(ctx.regularPropertyValue[0]);
    return { key, value };
  }

  /**
   * Visit type function: typeName(value, { options? })
   */
  typeFunction(ctx: any): {
    typeName: string;
    value: unknown;
    options?: Record<string, unknown>;
  } {
    const typeName = this.getTokenText(ctx.typeName[0]);
    const value = this.visit(ctx.functionValue[0]);
    let options: Record<string, unknown> | undefined;

    if (ctx.options) {
      options = this.visit(ctx.options[0]) as Record<string, unknown>;
    }

    return {
      typeName,
      value,
      ...(options && { options }),
    };
  }

  /**
   * Visit options object: { key: value, ... }
   * Note: Options objects only contain regular properties
   */
  optionsObject(ctx: any): Record<string, unknown> {
    const props: Record<string, unknown> = {};

    if (ctx.regularProperty) {
      for (const regularProp of ctx.regularProperty) {
        const result = this.visit(regularProp) as {
          key: string;
          value: unknown;
        };
        props[result.key] = result.value;
      }
    }

    return props;
  }

  /**
   * Visit value: string | number | boolean | identifier | array
   */
  value(ctx: any): unknown {
    if (ctx.arrayLiteral) {
      return this.visit(ctx.arrayLiteral[0]);
    }

    if (ctx.StringLiteral) {
      const token = ctx.StringLiteral[0] as IToken;
      return this.unquoteString(token.image);
    }

    if (ctx.NumberLiteral) {
      const token = ctx.NumberLiteral[0] as IToken;
      const num = Number.parseFloat(token.image);
      return Number.isInteger(num) ? Math.floor(num) : num;
    }

    if (ctx.BooleanLiteral) {
      const token = ctx.BooleanLiteral[0] as IToken;
      return token.image === 'true';
    }

    if (ctx.Identifier) {
      return this.getTokenText(ctx.Identifier[0]);
    }

    throw new Error('Unknown value type');
  }

  /**
   * Visit array literal: [ value, value, ... ]
   */
  arrayLiteral(ctx: any): unknown[] {
    const values: unknown[] = [];

    if (ctx.arrayValue) {
      for (const arrayValue of ctx.arrayValue) {
        values.push(this.visit(arrayValue));
      }
    }

    return values;
  }

  /**
   * Visit array value: string | number | boolean | identifier
   */
  arrayValue(ctx: any): unknown {
    if (ctx.StringLiteral) {
      const token = ctx.StringLiteral[0] as IToken;
      return this.unquoteString(token.image);
    }

    if (ctx.NumberLiteral) {
      const token = ctx.NumberLiteral[0] as IToken;
      const num = Number.parseFloat(token.image);
      return Number.isInteger(num) ? Math.floor(num) : num;
    }

    if (ctx.BooleanLiteral) {
      const token = ctx.BooleanLiteral[0] as IToken;
      return token.image === 'true';
    }

    if (ctx.Identifier) {
      return this.getTokenText(ctx.Identifier[0]);
    }

    throw new Error('Unknown array value type');
  }

  /**
   * Helper: Get text from token
   */
  private getTokenText(token: IToken): string {
    return token.image;
  }

  /**
   * Helper: Remove quotes from string literal
   */
  private unquoteString(str: string): string {
    if (str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1);
    }
    return str;
  }

  /**
   * Helper: Parse property type string to enum
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
}

/**
 * Convert CST to AST
 */
export function cstToAST(cst: CstNode): CanvasdownAST {
  const visitor = new CanvasdownVisitor();
  return visitor.visit(cst) as CanvasdownAST;
}
