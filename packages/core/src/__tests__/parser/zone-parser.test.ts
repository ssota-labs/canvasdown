import { describe, expect, it } from 'vitest';
import { parseDSL } from '../../parser/parser';
import { cstToAST } from '../../parser/visitor';

describe('Zone Parser', () => {
  it('should parse simple zone definition', () => {
    const { cst, errors } = parseDSL(`canvas TB
@zone thesis "Core Thesis"
  @shape main_claim "Main Argument" { shapeType: ellipse }
@end
`);

    if (errors.length > 0) {
      console.log('Parse errors:', errors);
    }
    expect(errors).toHaveLength(0);
    expect(cst).toBeDefined();

    const ast = cstToAST(cst);
    expect(ast.nodes).toHaveLength(2); // zone + shape
    expect(ast.nodes.find(n => n.type === 'zone')).toBeDefined();
    expect(ast.nodes.find(n => n.id === 'main_claim')?.parentId).toBe('thesis');
  });

  it('should parse zone without label', () => {
    const { cst, errors } = parseDSL(`
canvas TB

@zone thesis {
  direction: TB
}
  @shape claim1 "Claim 1"
@end
`);

    expect(errors).toHaveLength(0);
    const ast = cstToAST(cst);
    const zone = ast.nodes.find(n => n.id === 'thesis');
    expect(zone).toBeDefined();
    expect(zone?.label).toBe('thesis'); // Defaults to id
  });

  it('should parse nested zones', () => {
    const { cst, errors } = parseDSL(`
canvas TB

@zone outer "Outer Zone" {
  direction: TB
}
  @zone inner "Inner Zone" {
    direction: LR
  }
    @shape child "Child" { shapeType: rectangle }
  @end
@end
`);

    expect(errors).toHaveLength(0);
    const ast = cstToAST(cst);
    expect(ast.nodes).toHaveLength(3); // outer zone + inner zone + shape
    const innerZone = ast.nodes.find(n => n.id === 'inner');
    const child = ast.nodes.find(n => n.id === 'child');
    expect(innerZone?.parentId).toBe('outer');
    expect(child?.parentId).toBe('inner');
  });

  it('should parse zone with multiple children', () => {
    const { cst, errors } = parseDSL(`
canvas TB

@zone claims "Claims" {
  direction: LR
}
  @shape claim1 "Claim 1"
  @shape claim2 "Claim 2"
  @shape claim3 "Claim 3"
@end
`);

    expect(errors).toHaveLength(0);
    const ast = cstToAST(cst);
    expect(ast.nodes).toHaveLength(4); // zone + 3 shapes
    const children = ast.nodes.filter(n => n.parentId === 'claims');
    expect(children).toHaveLength(3);
  });

  it('should parse zone with edges between children', () => {
    const { cst, errors } = parseDSL(`
canvas TB

@zone timeline "Timeline" {
  direction: LR
}
  @shape ch1 "Chapter 1"
  @shape ch2 "Chapter 2"
  ch1 -> ch2 : "leads to"
@end
`);

    expect(errors).toHaveLength(0);
    const ast = cstToAST(cst);
    expect(ast.nodes).toHaveLength(3); // zone + 2 shapes
    expect(ast.edges).toHaveLength(1);
    expect(ast.edges[0].source).toBe('ch1');
    expect(ast.edges[0].target).toBe('ch2');
  });

  it('should handle multiple zones at root level', () => {
    const { cst, errors } = parseDSL(`
canvas TB

@zone zone1 "Zone 1" {
  direction: TB
}
  @shape a1 "A1"
@end

@zone zone2 "Zone 2" {
  direction: LR
}
  @shape b1 "B1"
@end
`);

    expect(errors).toHaveLength(0);
    const ast = cstToAST(cst);
    expect(ast.nodes).toHaveLength(4); // 2 zones + 2 shapes
    const zone1Children = ast.nodes.filter(n => n.parentId === 'zone1');
    const zone2Children = ast.nodes.filter(n => n.parentId === 'zone2');
    expect(zone1Children).toHaveLength(1);
    expect(zone2Children).toHaveLength(1);
  });
});
