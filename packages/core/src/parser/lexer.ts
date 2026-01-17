import { createToken, Lexer } from 'chevrotain';

/**
 * Token definitions for the Canvasdown DSL lexer.
 * Tokens are ordered by specificity (more specific patterns first).
 */

// Keywords
export const Canvas = createToken({
  name: 'Canvas',
  pattern: /canvas/,
});

export const Schema = createToken({
  name: 'Schema',
  pattern: /schema/,
});

// Patch command keywords (must come before Identifier)
export const PatchUpdate = createToken({
  name: 'PatchUpdate',
  pattern: /update/,
});

export const PatchDelete = createToken({
  name: 'PatchDelete',
  pattern: /delete/,
});

export const PatchAdd = createToken({
  name: 'PatchAdd',
  pattern: /add/,
});

export const PatchConnect = createToken({
  name: 'PatchConnect',
  pattern: /connect/,
});

export const PatchDisconnect = createToken({
  name: 'PatchDisconnect',
  pattern: /disconnect/,
});

export const PatchMove = createToken({
  name: 'PatchMove',
  pattern: /move/,
});

export const PatchResize = createToken({
  name: 'PatchResize',
  pattern: /resize/,
});

// Direction values
export const Direction = createToken({
  name: 'Direction',
  pattern: /LR|RL|TB|BT/,
});

// Operators and punctuation
export const AtSign = createToken({
  name: 'AtSign',
  pattern: /@/,
});

export const Arrow = createToken({
  name: 'Arrow',
  pattern: /->/,
});

export const DollarSign = createToken({
  name: 'DollarSign',
  pattern: /\$/,
});

export const Colon = createToken({
  name: 'Colon',
  pattern: /:/,
});

export const LBrace = createToken({
  name: 'LBrace',
  pattern: /\{/,
});

export const RBrace = createToken({
  name: 'RBrace',
  pattern: /\}/,
});

export const LParen = createToken({
  name: 'LParen',
  pattern: /\(/,
});

export const RParen = createToken({
  name: 'RParen',
  pattern: /\)/,
});

export const LBracket = createToken({
  name: 'LBracket',
  pattern: /\[/,
});

export const RBracket = createToken({
  name: 'RBracket',
  pattern: /\]/,
});

export const Comma = createToken({
  name: 'Comma',
  pattern: /,/,
});

// Literals
export const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"[^"]*"/,
});

export const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /-?\d+\.?\d*/,
});

export const BooleanLiteral = createToken({
  name: 'BooleanLiteral',
  pattern: /true|false/,
});

// Identifiers (must come after keywords)
export const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});

// Whitespace (skipped)
export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// Newline (skipped but can be used for line tracking)
export const Newline = createToken({
  name: 'Newline',
  pattern: /\r?\n/,
  group: Lexer.SKIPPED,
});

// All tokens in order of specificity
export const allTokens = [
  WhiteSpace,
  Newline,
  Canvas,
  Schema,
  // Patch keywords (must come before Identifier to match first)
  PatchUpdate,
  PatchDelete,
  PatchAdd,
  PatchConnect,
  PatchDisconnect,
  PatchMove,
  PatchResize,
  Direction,
  AtSign,
  DollarSign,
  Arrow,
  Colon,
  LBrace,
  RBrace,
  LParen,
  RParen,
  LBracket,
  RBracket,
  Comma,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  Identifier,
];

/**
 * Creates and returns a configured lexer instance
 */
export function createLexer(): Lexer {
  return new Lexer(allTokens, {
    // Enable line/column tracking for better error messages
    positionTracking: 'full',
  });
}
