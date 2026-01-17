import { beforeEach, describe, expect, it } from 'vitest';
import { CanvasdownCore } from '../core';

describe('Edge Labels (startLabel, endLabel)', () => {
  let core: CanvasdownCore;

  beforeEach(() => {
    core = new CanvasdownCore();
    core.registerBlockType({
      name: 'shape',
      defaultProperties: {},
      defaultSize: { width: 200, height: 100 },
    });
    core.registerEdgeType({
      name: 'default',
      defaultShape: 'default',
    });
  });

  it('should parse edge with center label', () => {
    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end : "center label"
`;

    const result = core.parse(dsl);
    expect(result.edges[0]?.label).toBe('center label');
  });

  it('should parse edge with startLabel and endLabel', () => {
    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end {
  label: "center",
  startLabel: "→",
  endLabel: "✓"
}
`;

    // Note: parse() method doesn't return startLabel/endLabel separately,
    // they're only available in parseAndLayout result
    const result = core.parseAndLayout(dsl);
    expect(result.edges[0]?.label).toBe('center');
    expect(result.edges[0]?.startLabel).toBe('→');
    expect(result.edges[0]?.endLabel).toBe('✓');
  });

  it('should preserve edge labels in graph output', () => {
    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end {
  label: "test",
  startLabel: "→",
  endLabel: "✓"
}
`;

    const result = core.parseAndLayout(dsl);
    expect(result.edges[0]?.label).toBe('test');
    expect(result.edges[0]?.startLabel).toBe('→');
    expect(result.edges[0]?.endLabel).toBe('✓');
  });
});
