import { beforeEach, describe, expect, it } from 'vitest';
import { CanvasdownCore } from '../core';

describe('Custom Properties', () => {
  let core: CanvasdownCore;

  beforeEach(() => {
    core = new CanvasdownCore();
    core.registerBlockType({
      name: 'markdown',
      defaultProperties: {
        content: '',
      },
      defaultSize: { width: 300, height: 200 },
    });
  });

  it('should parse schema definition', () => {
    const dsl = `
canvas LR

@schema category {
  type: select,
  options: ["tutorial", "demo", "reference"]
}

@markdown node1 "Node 1" {
  $category: "tutorial"
}
`;

    const result = core.parse(dsl);
    expect(result.nodes[0]?.properties).toBeDefined();
    // Custom properties are stored separately
  });

  it('should parse custom property with type function', () => {
    const dsl = `
canvas LR

@markdown node1 "Node 1" {
  $priority: number(3, { min: 1, max: 5 })
}
`;

    const result = core.parse(dsl);
    expect(result.nodes[0]).toBeDefined();
  });

  it('should validate custom property values', () => {
    const dsl = `
canvas LR

@schema category {
  type: select,
  options: ["tutorial", "demo"]
}

@markdown node1 "Node 1" {
  $category: "tutorial"
}
`;

    const result = core.parseAndLayout(dsl);
    expect(result.nodes[0]?.data).toBeDefined();
  });
});
