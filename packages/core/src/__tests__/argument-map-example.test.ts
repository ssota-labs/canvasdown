import { describe, expect, it } from 'vitest';
import { CanvasdownCore } from '../core';

describe('Argument Map Template Example', () => {
  it('should parse and layout Argument Map template with zones', () => {
    const core = new CanvasdownCore();

    // Register block types
    core.registerBlockType({
      name: 'shape',
      defaultProperties: {
        shapeType: 'rectangle',
        color: 'blue',
        borderStyle: 'solid',
      },
      defaultSize: { width: 154, height: 70 },
    });

    core.registerBlockType({
      name: 'markdown',
      defaultProperties: {
        content: '',
      },
      defaultSize: { width: 300, height: 200 },
    });

    core.registerBlockType({
      name: 'zone',
      isGroup: true,
      defaultProperties: {
        direction: 'TB',
        color: 'gray',
        padding: 20,
      },
      defaultSize: { width: 400, height: 300 },
    });

    core.registerEdgeType({
      name: 'default',
      defaultShape: 'default',
      defaultStyle: {
        stroke: '#b1b1b7',
        strokeWidth: 2,
      },
    });

    // Argument Map DSL from proposal
    const dsl = `
canvas TB

@zone thesis "Core Thesis" {
  direction: TB,
  color: blue
}
  @shape main_thesis "Video's Main Argument" {
    shapeType: ellipse,
    color: blue
  }
@end

@zone claims "Supporting Claims" {
  direction: LR,
  color: green
}
  @shape claim1 "Claim 1" {
    shapeType: rectangle,
    color: green
  }
  @shape claim2 "Claim 2" {
    shapeType: rectangle,
    color: green
  }
  @shape claim3 "Claim 3" {
    shapeType: rectangle,
    color: green
  }
@end

@zone evidence "Evidence" {
  direction: TB,
  color: gray
}
  @shape ev1 "Evidence 1" {
    shapeType: rectangle,
    borderStyle: dashed,
    color: gray
  }
  @shape ev2 "Evidence 2" {
    shapeType: rectangle,
    borderStyle: dashed,
    color: gray
  }
@end

@zone counterpoints "Counterpoints" {
  direction: LR,
  color: red
}
  @shape counter1 "Limitation 1" {
    shapeType: diamond,
    color: red
  }
@end

main_thesis -> claim1 : "supports"
main_thesis -> claim2 : "supports"
claim1 -> ev1 : "based on"
counter1 -> main_thesis : "contradicts"
`;

    const result = core.parseAndLayout(dsl);

    // Verify structure
    expect(result.nodes).toBeDefined();
    expect(result.edges).toBeDefined();

    // Check zones exist
    const thesisZone = result.nodes.find(n => n.id === 'thesis');
    const claimsZone = result.nodes.find(n => n.id === 'claims');
    const evidenceZone = result.nodes.find(n => n.id === 'evidence');
    const counterpointsZone = result.nodes.find(n => n.id === 'counterpoints');

    expect(thesisZone).toBeDefined();
    expect(claimsZone).toBeDefined();
    expect(evidenceZone).toBeDefined();
    expect(counterpointsZone).toBeDefined();

    // Check children have correct parentId
    const mainThesis = result.nodes.find(n => n.id === 'main_thesis');
    const claim1 = result.nodes.find(n => n.id === 'claim1');
    const ev1 = result.nodes.find(n => n.id === 'ev1');
    const counter1 = result.nodes.find(n => n.id === 'counter1');

    expect(mainThesis?.parentId).toBe('thesis');
    expect(claim1?.parentId).toBe('claims');
    expect(ev1?.parentId).toBe('evidence');
    expect(counter1?.parentId).toBe('counterpoints');

    // Check edges exist
    expect(result.edges.length).toBeGreaterThan(0);
    const supportsEdge = result.edges.find(
      e => e.source === 'main_thesis' && e.target === 'claim1'
    );
    expect(supportsEdge).toBeDefined();
    expect(supportsEdge?.label).toBe('supports');

    // Verify zone properties
    expect(thesisZone?.data.direction).toBe('TB');
    expect(thesisZone?.data.color).toBe('blue');
    expect(claimsZone?.data.direction).toBe('LR');
    expect(claimsZone?.data.color).toBe('green');

    // Verify zone sizes are calculated (should be larger than default)
    expect(thesisZone?.size.width).toBeGreaterThanOrEqual(400);
    expect(thesisZone?.size.height).toBeGreaterThanOrEqual(300);
  });

  it('should handle zone-level layout directions correctly', () => {
    const core = new CanvasdownCore();

    core.registerBlockType({
      name: 'shape',
      defaultProperties: {},
      defaultSize: { width: 100, height: 50 },
    });

    core.registerBlockType({
      name: 'zone',
      isGroup: true,
      defaultProperties: {
        direction: 'TB',
        padding: 20,
      },
      defaultSize: { width: 400, height: 300 },
    });

    const dsl = `
canvas TB

@zone lr_zone "LR Zone" {
  direction: LR
}
  @shape a "A"
  @shape b "B"
  a -> b
@end

@zone tb_zone "TB Zone" {
  direction: TB
}
  @shape c "C"
  @shape d "D"
  c -> d
@end
`;

    const result = core.parseAndLayout(dsl);

    const lrZone = result.nodes.find(n => n.id === 'lr_zone');
    const tbZone = result.nodes.find(n => n.id === 'tb_zone');
    const a = result.nodes.find(n => n.id === 'a');
    const b = result.nodes.find(n => n.id === 'b');
    const c = result.nodes.find(n => n.id === 'c');
    const d = result.nodes.find(n => n.id === 'd');

    expect(lrZone).toBeDefined();
    expect(tbZone).toBeDefined();

    // In LR zone, b should be to the right of a
    // Note: children positions are relative to parent zone
    if (a && b && lrZone) {
      expect(b.position.x).toBeGreaterThan(a.position.x);
      // Both should be within zone bounds (relative positions)
      expect(a.position.x).toBeGreaterThanOrEqual(0);
      expect(b.position.x + b.size.width).toBeLessThanOrEqual(
        lrZone.size.width
      );
    }

    // In TB zone, d should be below c
    // Note: children positions are relative to parent zone
    if (c && d && tbZone) {
      expect(d.position.y).toBeGreaterThan(c.position.y);
      // Both should be within zone bounds (relative positions)
      expect(c.position.y).toBeGreaterThanOrEqual(0);
      expect(d.position.y + d.size.height).toBeLessThanOrEqual(
        tbZone.size.height
      );
    }
  });
});
