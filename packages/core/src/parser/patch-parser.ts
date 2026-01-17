import { CstParser, type CstNode } from 'chevrotain';
import {
  allTokens,
  Arrow,
  AtSign,
  BooleanLiteral,
  Colon,
  Comma,
  createLexer,
  DollarSign,
  Identifier,
  LBrace,
  LBracket,
  LParen,
  NumberLiteral,
  PatchAdd,
  PatchConnect,
  PatchDelete,
  PatchDisconnect,
  PatchMove,
  PatchResize,
  PatchUpdate,
  RBrace,
  RBracket,
  RParen,
  StringLiteral,
} from './lexer';

/**
 * Parser for Patch DSL.
 * Converts token stream into a Concrete Syntax Tree (CST) for patch operations.
 */
export class PatchParser extends CstParser {
  constructor() {
    super(allTokens, {
      recoveryEnabled: true,
      maxLookahead: 3,
    });

    // Perform all the grammar rules
    this.performSelfAnalysis();
  }

  /**
   * Root rule: one or more patch operations
   */
  patchOperations = this.RULE('patchOperations', () => {
    this.MANY(() => {
      this.SUBRULE(this.patchOperation);
    });
  });

  /**
   * A single patch operation
   */
  patchOperation = this.RULE('patchOperation', () => {
    this.CONSUME(AtSign);
    this.OR([
      { ALT: () => this.SUBRULE(this.updateOperation) },
      { ALT: () => this.SUBRULE(this.deleteOperation) },
      { ALT: () => this.SUBRULE(this.addOperation) },
      { ALT: () => this.SUBRULE(this.connectOperation) },
      { ALT: () => this.SUBRULE(this.disconnectOperation) },
      { ALT: () => this.SUBRULE(this.moveOperation) },
      { ALT: () => this.SUBRULE(this.resizeOperation) },
    ]);
  });

  /**
   * @update nodeId { properties }
   */
  updateOperation = this.RULE('updateOperation', () => {
    this.CONSUME(PatchUpdate);
    this.CONSUME(Identifier, { LABEL: 'targetId' });
    this.OPTION(() => {
      this.SUBRULE(this.properties);
    });
  });

  /**
   * @delete nodeId
   */
  deleteOperation = this.RULE('deleteOperation', () => {
    this.CONSUME(PatchDelete);
    this.CONSUME(Identifier, { LABEL: 'targetId' });
  });

  /**
   * @add [type:id] "label" { properties }
   */
  addOperation = this.RULE('addOperation', () => {
    this.CONSUME(PatchAdd);
    this.CONSUME(LBracket);
    this.CONSUME(Identifier, { LABEL: 'nodeType' });
    this.CONSUME(Colon);
    this.CONSUME2(Identifier, { LABEL: 'nodeId' });
    this.CONSUME(RBracket);
    this.CONSUME(StringLiteral, { LABEL: 'label' });
    this.OPTION(() => {
      this.SUBRULE(this.properties);
    });
  });

  /**
   * @connect sourceId -> targetId : "label"?
   */
  connectOperation = this.RULE('connectOperation', () => {
    this.CONSUME(PatchConnect);
    this.CONSUME(Identifier, { LABEL: 'sourceId' });
    this.CONSUME(Arrow);
    this.CONSUME2(Identifier, { LABEL: 'targetId' });
    this.OPTION1(() => {
      this.CONSUME(Colon);
      this.CONSUME(StringLiteral, { LABEL: 'label' });
    });
    this.OPTION2(() => {
      this.SUBRULE(this.edgeProperties);
    });
  });

  /**
   * @disconnect sourceId -> targetId?
   */
  disconnectOperation = this.RULE('disconnectOperation', () => {
    this.CONSUME(PatchDisconnect);
    this.CONSUME(Identifier, { LABEL: 'sourceId' });
    this.OPTION(() => {
      this.CONSUME(Arrow);
      this.CONSUME2(Identifier, { LABEL: 'targetId' });
    });
  });

  /**
   * @move nodeId { x: number, y: number }
   */
  moveOperation = this.RULE('moveOperation', () => {
    this.CONSUME(PatchMove);
    this.CONSUME(Identifier, { LABEL: 'targetId' });
    this.SUBRULE(this.positionProperties);
  });

  /**
   * @resize nodeId { width: number, height: number }
   */
  resizeOperation = this.RULE('resizeOperation', () => {
    this.CONSUME(PatchResize);
    this.CONSUME(Identifier, { LABEL: 'targetId' });
    this.SUBRULE(this.sizeProperties);
  });

  /**
   * Properties block: { key: value, ... }
   */
  properties = this.RULE('properties', () => {
    this.CONSUME(LBrace);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.OR([
          { ALT: () => this.SUBRULE(this.customProperty) },
          { ALT: () => this.SUBRULE(this.regularProperty) },
        ]);
      },
    });
    this.CONSUME(RBrace);
  });

  /**
   * Edge properties block: { key: value, ... }
   */
  edgeProperties = this.RULE('edgeProperties', () => {
    this.CONSUME(LBrace);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.SUBRULE(this.regularProperty);
      },
    });
    this.CONSUME(RBrace);
  });

  /**
   * Position properties: { x: number, y: number }
   */
  positionProperties = this.RULE('positionProperties', () => {
    this.CONSUME(LBrace);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.SUBRULE(this.regularProperty);
      },
    });
    this.CONSUME(RBrace);
  });

  /**
   * Size properties: { width: number, height: number }
   */
  sizeProperties = this.RULE('sizeProperties', () => {
    this.CONSUME(LBrace);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.SUBRULE(this.regularProperty);
      },
    });
    this.CONSUME(RBrace);
  });

  /**
   * Custom property: $key : value | $key : typeFunction(...)
   */
  customProperty = this.RULE('customProperty', () => {
    this.CONSUME(DollarSign);
    this.CONSUME(Identifier, { LABEL: 'customPropertyKey' });
    this.CONSUME(Colon);
    this.OR([
      {
        ALT: () => this.SUBRULE(this.typeFunction, { LABEL: 'typeFunction' }),
      },
      {
        ALT: () => this.SUBRULE(this.value, { LABEL: 'customPropertyValue' }),
      },
    ]);
  });

  /**
   * Regular property: key : value
   */
  regularProperty = this.RULE('regularProperty', () => {
    this.CONSUME(Identifier, { LABEL: 'key' });
    this.CONSUME(Colon);
    this.SUBRULE(this.value, { LABEL: 'regularPropertyValue' });
  });

  /**
   * Value: string | number | boolean | identifier | array
   */
  value = this.RULE('value', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.arrayLiteral) },
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME(BooleanLiteral) },
      { ALT: () => this.CONSUME(Identifier) },
    ]);
  });

  /**
   * Array literal: [ value, value, ... ]
   */
  arrayLiteral = this.RULE('arrayLiteral', () => {
    this.CONSUME(LBracket);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.SUBRULE(this.arrayValue);
      },
    });
    this.CONSUME(RBracket);
  });

  /**
   * Array value: string | number | boolean | identifier
   */
  arrayValue = this.RULE('arrayValue', () => {
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME(BooleanLiteral) },
      { ALT: () => this.CONSUME(Identifier) },
    ]);
  });

  /**
   * Type function: typeName(value, { options? })
   */
  typeFunction = this.RULE('typeFunction', () => {
    this.CONSUME(Identifier, { LABEL: 'typeName' });
    this.CONSUME(LParen);
    this.SUBRULE(this.value, { LABEL: 'functionValue' });
    this.OPTION(() => {
      this.CONSUME(Comma);
      this.SUBRULE(this.optionsObject, { LABEL: 'options' });
    });
    this.CONSUME(RParen);
  });

  /**
   * Options object: { key: value, ... }
   */
  optionsObject = this.RULE('optionsObject', () => {
    this.CONSUME(LBrace);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.SUBRULE(this.regularProperty);
      },
    });
    this.CONSUME(RBrace);
  });
}

/**
 * Parse Patch DSL text and return CST
 */
export function parsePatchDSL(patchDsl: string): {
  cst: CstNode;
  errors: Array<{ message: string; line?: number; column?: number }>;
} {
  const lexer = createLexer();
  const parser = new PatchParser();

  const lexResult = lexer.tokenize(patchDsl);

  if (lexResult.errors.length > 0) {
    return {
      cst: {} as CstNode,
      errors: lexResult.errors.map(err => ({
        message: err.message,
        line: err.line,
        column: err.column,
      })),
    };
  }

  parser.input = lexResult.tokens;
  const cst = parser.patchOperations();

  const parseErrors = parser.errors.map(err => ({
    message: err.message,
    line: err.token?.startLine,
    column: err.token?.startColumn,
  }));

  return {
    cst,
    errors: parseErrors,
  };
}
