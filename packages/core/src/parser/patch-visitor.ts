import { type CstNode, type IToken } from 'chevrotain';
import type { CustomPropertyValue } from '../types/custom-property.types';
import type {
  AddOperation,
  ConnectOperation,
  DeleteOperation,
  DisconnectOperation,
  MoveOperation,
  PatchOperationUnion,
  ResizeOperation,
  UpdateOperation,
} from '../types/patch.types';
import { PatchParser } from './patch-parser';

// Get the base visitor class from the parser instance
const parserInstance = new PatchParser();
const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructor();

/**
 * Visitor that converts Patch CST (Concrete Syntax Tree) to PatchOperation array.
 */
export class PatchVisitor extends BaseCstVisitor {
  constructor() {
    super();
    // Validate that all required methods are implemented
    this.validateVisitor();
  }

  /**
   * Root visitor method - returns array of patch operations
   */
  patchOperations(ctx: any): PatchOperationUnion[] {
    const operations: PatchOperationUnion[] = [];

    if (ctx.patchOperation) {
      for (const patchOp of ctx.patchOperation) {
        const operation = this.visit(patchOp) as PatchOperationUnion;
        if (operation) {
          operations.push(operation);
        }
      }
    }

    return operations;
  }

  /**
   * Visit a single patch operation
   */
  patchOperation(ctx: any): PatchOperationUnion {
    if (ctx.updateOperation) {
      return this.visit(ctx.updateOperation[0]) as UpdateOperation;
    }
    if (ctx.deleteOperation) {
      return this.visit(ctx.deleteOperation[0]) as DeleteOperation;
    }
    if (ctx.addOperation) {
      return this.visit(ctx.addOperation[0]) as AddOperation;
    }
    if (ctx.connectOperation) {
      return this.visit(ctx.connectOperation[0]) as ConnectOperation;
    }
    if (ctx.disconnectOperation) {
      return this.visit(ctx.disconnectOperation[0]) as DisconnectOperation;
    }
    if (ctx.moveOperation) {
      return this.visit(ctx.moveOperation[0]) as MoveOperation;
    }
    if (ctx.resizeOperation) {
      return this.visit(ctx.resizeOperation[0]) as ResizeOperation;
    }
    throw new Error('Unknown patch operation type');
  }

  /**
   * Visit @update nodeId { properties }
   */
  updateOperation(ctx: any): UpdateOperation {
    const targetId = this.getTokenText(ctx.targetId[0]);
    let properties: Record<string, unknown> | undefined;
    let customProperties: Array<{ key: string; value: unknown }> | undefined;

    if (ctx.properties) {
      const result = this.visit(ctx.properties[0]) as {
        properties: Record<string, unknown>;
        customProperties: CustomPropertyValue[];
      };
      properties = result.properties;
      if (result.customProperties.length > 0) {
        // Convert CustomPropertyValue[] to { key: string; value: unknown }[]
        customProperties = result.customProperties.map(cp => ({
          key: cp.schemaId,
          value: cp.value,
        }));
      }
    }

    return {
      type: 'update',
      targetId,
      ...(properties && Object.keys(properties).length > 0 && { properties }),
      ...(customProperties &&
        customProperties.length > 0 && { customProperties }),
    };
  }

  /**
   * Visit @delete nodeId
   */
  deleteOperation(ctx: any): DeleteOperation {
    const targetId = this.getTokenText(ctx.targetId[0]);
    return {
      type: 'delete',
      targetId,
    };
  }

  /**
   * Visit @add [type:id] "label" { properties }
   */
  addOperation(ctx: any): AddOperation {
    const nodeType = this.getTokenText(ctx.nodeType[0]);
    const nodeId = this.getTokenText(ctx.nodeId[0]);
    const label = this.parseStringLiteral(ctx.label[0]);

    let properties: Record<string, unknown> | undefined;
    let customProperties: Array<{ key: string; value: unknown }> | undefined;

    if (ctx.properties) {
      const result = this.visit(ctx.properties[0]) as {
        properties: Record<string, unknown>;
        customProperties: CustomPropertyValue[];
      };
      properties = result.properties;
      if (result.customProperties.length > 0) {
        // Convert CustomPropertyValue[] to { key: string; value: unknown }[]
        customProperties = result.customProperties.map(cp => ({
          key: cp.schemaId,
          value: cp.value,
        }));
      }
    }

    return {
      type: 'add',
      targetId: nodeId,
      nodeType,
      label,
      ...(properties && Object.keys(properties).length > 0 && { properties }),
      ...(customProperties &&
        customProperties.length > 0 && { customProperties }),
    };
  }

  /**
   * Visit @connect sourceId -> targetId : "label"?
   */
  connectOperation(ctx: any): ConnectOperation {
    const sourceId = this.getTokenText(ctx.sourceId[0]);
    const targetId = this.getTokenText(ctx.targetId[0]);
    let label: string | undefined;
    let edgeData: Record<string, unknown> | undefined;

    if (ctx.label) {
      label = this.parseStringLiteral(ctx.label[0]);
    }

    if (ctx.edgeProperties) {
      edgeData = this.visit(ctx.edgeProperties[0]) as Record<string, unknown>;
    }

    return {
      type: 'connect',
      targetId: sourceId,
      to: targetId,
      ...(label && { label }),
      ...(edgeData && Object.keys(edgeData).length > 0 && { edgeData }),
    };
  }

  /**
   * Visit @disconnect sourceId -> targetId?
   */
  disconnectOperation(ctx: any): DisconnectOperation {
    const sourceId = this.getTokenText(ctx.sourceId[0]);
    let targetId: string | undefined;

    if (ctx.targetId) {
      targetId = this.getTokenText(ctx.targetId[0]);
    }

    return {
      type: 'disconnect',
      targetId: sourceId,
      ...(targetId && { to: targetId }),
    };
  }

  /**
   * Visit @move nodeId { x: number, y: number }
   */
  moveOperation(ctx: any): MoveOperation {
    const targetId = this.getTokenText(ctx.targetId[0]);
    const props = this.visit(ctx.positionProperties[0]) as Record<
      string,
      unknown
    >;
    const x = props.x as number;
    const y = props.y as number;

    if (typeof x !== 'number' || typeof y !== 'number') {
      throw new Error('@move requires x and y to be numbers');
    }

    return {
      type: 'move',
      targetId,
      position: { x, y },
    };
  }

  /**
   * Visit @resize nodeId { width: number, height: number }
   */
  resizeOperation(ctx: any): ResizeOperation {
    const targetId = this.getTokenText(ctx.targetId[0]);
    const props = this.visit(ctx.sizeProperties[0]) as Record<string, unknown>;
    const width = props.width as number;
    const height = props.height as number;

    if (typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('@resize requires width and height to be numbers');
    }

    return {
      type: 'resize',
      targetId,
      size: { width, height },
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
   * Visit position properties: { x: number, y: number }
   */
  positionProperties(ctx: any): Record<string, unknown> {
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
   * Visit size properties: { width: number, height: number }
   */
  sizeProperties(ctx: any): Record<string, unknown> {
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
      ...(options && Object.keys(options).length > 0 && { options }),
    };
  }

  /**
   * Visit options object: { key: value, ... }
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
      return this.parseStringLiteral(ctx.StringLiteral[0]);
    }
    if (ctx.NumberLiteral) {
      return this.parseNumberLiteral(ctx.NumberLiteral[0]);
    }
    if (ctx.BooleanLiteral) {
      return this.parseBooleanLiteral(ctx.BooleanLiteral[0]);
    }
    if (ctx.Identifier) {
      return this.getTokenText(ctx.Identifier[0]);
    }
    return undefined;
  }

  /**
   * Visit array literal: [ value, value, ... ]
   */
  arrayLiteral(ctx: any): unknown[] {
    const values: unknown[] = [];

    if (ctx.arrayValue) {
      for (const arrayVal of ctx.arrayValue) {
        const value = this.visit(arrayVal);
        values.push(value);
      }
    }

    return values;
  }

  /**
   * Visit array value: string | number | boolean | identifier
   */
  arrayValue(ctx: any): unknown {
    if (ctx.StringLiteral) {
      return this.parseStringLiteral(ctx.StringLiteral[0]);
    }
    if (ctx.NumberLiteral) {
      return this.parseNumberLiteral(ctx.NumberLiteral[0]);
    }
    if (ctx.BooleanLiteral) {
      return this.parseBooleanLiteral(ctx.BooleanLiteral[0]);
    }
    if (ctx.Identifier) {
      return this.getTokenText(ctx.Identifier[0]);
    }
    return undefined;
  }

  /**
   * Helper: Get token text
   */
  private getTokenText(token: IToken): string {
    return token.image;
  }

  /**
   * Helper: Parse string literal (remove quotes)
   */
  private parseStringLiteral(token: IToken): string {
    const image = token.image;
    // Remove surrounding quotes
    return image.slice(1, -1);
  }

  /**
   * Helper: Parse number literal
   */
  private parseNumberLiteral(token: IToken): number {
    return parseFloat(token.image);
  }

  /**
   * Helper: Parse boolean literal
   */
  private parseBooleanLiteral(token: IToken): boolean {
    return token.image === 'true';
  }
}

/**
 * Convert Patch CST to PatchOperation array
 */
export function cstToPatchOperations(cst: CstNode): PatchOperationUnion[] {
  const visitor = new PatchVisitor();
  return visitor.visit(cst) as PatchOperationUnion[];
}
