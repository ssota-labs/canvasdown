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

  it('should tokenize UUID as Identifier', () => {
    const lexer = createLexer();
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const result = lexer.tokenize(`@update ${uuid} { title: "x" }`);

    expect(result.errors).toHaveLength(0);
    const ids = result.tokens.filter(t => t.tokenType.name === 'Identifier');
    expect(ids).toHaveLength(2); // uuid + "title" in properties
    expect(ids[0]?.image).toBe(uuid);
  });

  it('should still tokenize plain numbers as NumberLiteral', () => {
    const lexer = createLexer();
    const result = lexer.tokenize('@move node1 { x: 123, y: 456 }');

    expect(result.errors).toHaveLength(0);
    const nums = result.tokens.filter(
      t => t.tokenType.name === 'NumberLiteral'
    );
    expect(nums.map(n => n.image)).toEqual(['123', '456']);
  });

  it('should tokenize hyphenated identifiers (e.g. zone id thesis-ddd)', () => {
    const lexer = createLexer();
    const dsl = `@zone thesis-ddd "Core Thesis" {
  direction: TB,
  color: blue
}
  @shape main_thesis "Video's Main Argument" {
    shapeType: ellipse,
    color: blue
  }
@end`;
    const result = lexer.tokenize(dsl);
    expect(result.errors).toHaveLength(0);
    const ids = result.tokens.filter(t => t.tokenType.name === 'Identifier');
    const idImages = ids.map(t => t.image);
    expect(idImages).toContain('thesis-ddd');
    expect(idImages).toContain('main_thesis');
  });

  it('should not break Arrow (->) when using hyphenated ids', () => {
    const lexer = createLexer();
    const result = lexer.tokenize('node-a -> node-b');
    expect(result.errors).toHaveLength(0);
    expect(result.tokens.map(t => t.image)).toEqual(['node-a', '->', 'node-b']);
  });
});
