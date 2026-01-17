import { describe, expect, it } from 'vitest';
import { createLexer } from '../../parser/lexer';

describe('Lexer', () => {
  it('should tokenize canvas declaration', () => {
    const lexer = createLexer();
    const result = lexer.tokenize('canvas LR');

    expect(result.errors).toHaveLength(0);
    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0]?.image).toBe('canvas');
    expect(result.tokens[1]?.image).toBe('LR');
  });

  it('should tokenize block definition', () => {
    const lexer = createLexer();
    const result = lexer.tokenize('@shape start "Start"');

    expect(result.errors).toHaveLength(0);
    expect(result.tokens.length).toBeGreaterThan(0);
    expect(result.tokens[0]?.image).toBe('@');
    expect(result.tokens[1]?.image).toBe('shape');
    expect(result.tokens[2]?.image).toBe('start');
    expect(result.tokens[3]?.image).toBe('"Start"');
  });

  it('should tokenize edge definition', () => {
    const lexer = createLexer();
    const result = lexer.tokenize('start -> end');

    expect(result.errors).toHaveLength(0);
    expect(result.tokens.length).toBeGreaterThan(0);
    expect(result.tokens[0]?.image).toBe('start');
    expect(result.tokens[1]?.image).toBe('->');
    expect(result.tokens[2]?.image).toBe('end');
  });

  it('should skip whitespace', () => {
    const lexer = createLexer();
    const result = lexer.tokenize('canvas   LR');

    expect(result.errors).toHaveLength(0);
    expect(result.tokens).toHaveLength(2);
  });
});
