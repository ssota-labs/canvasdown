import { beforeEach, describe, expect, it } from 'vitest';
import { CanvasdownCore } from '../core';

describe('Edge Markers (markerEnd, markerStart)', () => {
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

  it('should parse edge with markerEnd', () => {
    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end {
  markerEnd: "arrowclosed"
}
`;

    const result = core.parseAndLayout(dsl);
    expect(result.edges[0]?.markerEnd).toBe('arrowclosed');
  });

  it('should parse edge with markerStart', () => {
    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end {
  markerStart: "arrow"
}
`;

    const result = core.parseAndLayout(dsl);
    expect(result.edges[0]?.markerStart).toBe('arrow');
  });

  it('should parse edge with both markers', () => {
    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end {
  markerStart: "arrow",
  markerEnd: "arrowclosed"
}
`;

    const result = core.parseAndLayout(dsl);
    expect(result.edges[0]?.markerStart).toBe('arrow');
    expect(result.edges[0]?.markerEnd).toBe('arrowclosed');
  });

  it('should use default marker from edge type', () => {
    core.registerEdgeType({
      name: 'arrow',
      defaultShape: 'default',
      defaultData: {
        markerEnd: 'arrowclosed',
      },
    });

    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end : arrow
`;

    const result = core.parseAndLayout(dsl);
    expect(result.edges[0]?.markerEnd).toBe('arrowclosed');
  });

  it('should override default marker from edge type with DSL marker', () => {
    core.registerEdgeType({
      name: 'arrow',
      defaultShape: 'default',
      defaultData: {
        markerEnd: 'arrowclosed',
      },
    });

    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end : arrow {
  markerEnd: "arrow"
}
`;

    const result = core.parseAndLayout(dsl);
    expect(result.edges[0]?.markerEnd).toBe('arrow');
  });

  it('should combine edge type default marker with DSL markerStart', () => {
    core.registerEdgeType({
      name: 'arrow',
      defaultShape: 'default',
      defaultData: {
        markerEnd: 'arrowclosed',
      },
    });

    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end : arrow {
  markerStart: "arrow"
}
`;

    const result = core.parseAndLayout(dsl);
    expect(result.edges[0]?.markerStart).toBe('arrow');
    expect(result.edges[0]?.markerEnd).toBe('arrowclosed');
  });

  it('should preserve markers in graph output', () => {
    const dsl = `
canvas LR

@shape start "Start"
@shape end "End"

start -> end {
  markerStart: "arrow",
  markerEnd: "arrowclosed"
}
`;

    const result = core.parseAndLayout(dsl);
    const edge = result.edges[0];
    expect(edge?.markerStart).toBe('arrow');
    expect(edge?.markerEnd).toBe('arrowclosed');
  });
});
