import { CstParser, type CstNode } from 'chevrotain';
import {
  allTokens,
  Arrow,
  AtSign,
  BooleanLiteral,
  Canvas,
  Colon,
  Comma,
  createLexer,
  Direction,
  DollarSign,
  Identifier,
  LBrace,
  LBracket,
  LParen,
  NumberLiteral,
  RBrace,
  RBracket,
  RParen,
  Schema,
  StringLiteral,
} from './lexer';

/**
 * Parser for Canvasdown DSL.
 * Converts token stream into a Concrete Syntax Tree (CST).
 */
export class CanvasdownParser extends CstParser {
  constructor() {
    super(allTokens, {
      recoveryEnabled: true,
      maxLookahead: 3,
    });

    // Perform all the grammar rules
    this.performSelfAnalysis();
  }

  /**
   * Root rule: canvas declaration followed by schema/block/edge definitions
   */
  canvasdown = this.RULE('canvasdown', () => {
    this.SUBRULE(this.canvasDeclaration);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.schemaDefinition) },
        { ALT: () => this.SUBRULE(this.blockDefinition) },
        { ALT: () => this.SUBRULE(this.edgeDefinition) },
      ]);
    });
  });

  /**
   * Canvas declaration: "canvas" followed by direction
   */
  canvasDeclaration = this.RULE('canvasDeclaration', () => {
    this.CONSUME(Canvas);
    this.CONSUME(Direction);
  });

  /**
   * Schema definition: @schema id { type: ..., options: ..., ... }
   */
  schemaDefinition = this.RULE('schemaDefinition', () => {
    this.CONSUME(AtSign);
    this.CONSUME(Schema);
    this.CONSUME(Identifier, { LABEL: 'id' });
    this.SUBRULE(this.properties);
  });

  /**
   * Block definition: @blockType id "label" { properties }
   */
  blockDefinition = this.RULE('blockDefinition', () => {
    this.CONSUME(AtSign);
    this.CONSUME(Identifier, { LABEL: 'blockType' });
    this.CONSUME2(Identifier, { LABEL: 'id' });
    this.CONSUME(StringLiteral, { LABEL: 'label' });
    this.OPTION(() => {
      this.SUBRULE(this.properties);
    });
  });

  /**
   * Edge definition: source -> target : label? edgeType? { edgeData? }
   */
  edgeDefinition = this.RULE('edgeDefinition', () => {
    this.CONSUME(Identifier, { LABEL: 'source' });
    this.CONSUME(Arrow);
    this.CONSUME2(Identifier, { LABEL: 'target' });
    this.OPTION1(() => {
      this.CONSUME(Colon);
      this.OR([
        {
          ALT: () => this.CONSUME(StringLiteral, { LABEL: 'label' }),
        },
        {
          ALT: () => this.CONSUME3(Identifier, { LABEL: 'edgeType' }),
        },
      ]);
    });
    this.OPTION2(() => {
      this.SUBRULE(this.edgeProperties);
    });
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
   * Note: Edges only support regular properties, not custom properties
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
   * Note: Arrays don't contain nested arrays or objects
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
   * Examples: select("value", { options: [...] }), number(3, { min: 1, max: 5 })
   * Note: typeName is an Identifier, validated in visitor
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
   * Note: Options objects only contain regular properties, not custom properties
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
 * Parse DSL text and return CST
 */
export function parseDSL(dsl: string): {
  cst: CstNode;
  errors: Array<{ message: string; line?: number; column?: number }>;
} {
  const lexer = createLexer();
  const parser = new CanvasdownParser();

  const lexResult = lexer.tokenize(dsl);

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
  const cst = parser.canvasdown();

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
