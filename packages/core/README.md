# @ssota-labs/canvasdown

**The framework-independent core of Canvasdown** — Parse DSL text, register custom types, and generate graph data with automatic layout.

[![npm version](https://img.shields.io/npm/v/@ssota-labs/canvasdown)](https://www.npmjs.com/package/@ssota-labs/canvasdown)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## Overview

`@ssota-labs/canvasdown` is the foundation of Canvasdown. It provides:

- **DSL Parser** — Chevrotain-based parser for Canvasdown DSL
- **Type Registry** — Dynamic block and edge type registration
- **Graph Builder** — Convert AST to graph data structures
- **Auto Layout** — dagre-based automatic node positioning
- **Patch Support** — Incremental updates via Patch DSL

This package is **framework-independent** — no React, no DOM, just pure TypeScript. Use it with any rendering framework or build your own adapter.

## Installation

```bash
npm install @ssota-labs/canvasdown
```

## Quick Start

```typescript
import { CanvasdownCore } from '@ssota-labs/canvasdown';

// 1. Create core instance with optional configuration
const core = new CanvasdownCore({
  defaultExtent: 'parent', // Optional: constrain zone children to parent bounds
  // Set to undefined to allow free movement of children
});

// 2. Register block types
core.registerBlockType({
  name: 'shape',
  defaultProperties: { shapeType: 'rectangle', color: 'blue' },
  defaultSize: { width: 200, height: 100 },
});

core.registerBlockType({
  name: 'text',
  defaultProperties: { content: '' },
  defaultSize: { width: 300, height: 150 },
});

// Register zone type (group node)
core.registerBlockType({
  name: 'zone',
  isGroup: true, // Mark as group node
  defaultProperties: {
    direction: 'TB', // Default direction for children
    color: 'gray',
    padding: 20,
  },
  defaultSize: { width: 400, height: 300 },
});

// 3. Parse and layout DSL
const dsl = `
canvas LR

@shape start "Start" { shapeType: ellipse, color: green }
@text process "Process Data"
@shape end "End" { shapeType: ellipse, color: red }

start -> process : "begins"
process -> end : "completes"
`;

// Or with zones
const dslWithZones = `
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
  @shape claim1 "Claim 1" { shapeType: rectangle, color: green }
  @shape claim2 "Claim 2" { shapeType: rectangle, color: green }
@end

main_thesis -> claim1 : "supports"
claim1 -> claim2
`;

const result = core.parseAndLayout(dsl);

// result.nodes - Array of positioned graph nodes (including zones and children)
// result.edges - Array of graph edges
// result.metadata - Layout metadata (direction, engine, etc.)
```

## Core Concepts

### Block Type Registration

Register custom block types with default properties and sizes:

```typescript
core.registerBlockType({
  name: 'kanban-card',
  defaultProperties: {
    status: 'todo',
    assignee: null,
    priority: 'medium',
  },
  defaultSize: { width: 300, height: 200 },
  validate: props => {
    // Optional validation function
    return props.status in ['todo', 'in-progress', 'done'];
  },
  propertySchema: {
    // Optional: Define property constraints for validation and LLM templates
    status: {
      type: 'enum',
      enum: ['todo', 'in-progress', 'done'],
      description: 'Task status',
    },
    priority: {
      type: 'enum',
      enum: ['low', 'medium', 'high'],
    },
  },
});

// Register zone type (group node)
core.registerBlockType({
  name: 'zone',
  isGroup: true, // Mark as group node - children will have parentId
  defaultProperties: {
    direction: 'TB', // Layout direction for children (LR, RL, TB, BT)
    color: 'gray',
    padding: 20, // Padding around children
  },
  defaultSize: { width: 400, height: 300 },
});
```

**Zone/Group Notes:**

- Set `isGroup: true` to mark a block type as a zone/group
- Zones can contain child blocks using `@zone ... @end` syntax
- Each zone can have its own `direction` property for child layout
- Children automatically get `parentId` set to the zone's ID
- Use `defaultExtent` option in `CanvasdownCore` constructor to control child positioning constraints

### Edge Type Registration

Register custom edge types with default styles:

```typescript
core.registerEdgeType({
  name: 'flow',
  defaultShape: 'default',
  defaultStyle: { stroke: '#333', strokeWidth: 2 },
  defaultData: { animated: false },
});
```

### Custom Properties

Define custom properties using `@schema` or inline:

```typescript
// Using @schema
const dsl = `
@schema kanban-card {
  status: string
  assignee: string | null
  priority: "low" | "medium" | "high"
}

@kanban-card task1 "Implement Login" {
  status: "in-progress"
  assignee: "alice"
  priority: "high"
}
`;

// Inline properties (no schema needed)
const dsl2 = `
@shape node1 "Node" {
  customProp: "value"
  nested: { key: "value" }
}
`;
```

### Zone/Group Syntax

Create hierarchical structures with zones:

```typescript
const dsl = `
canvas TB

@zone zone1 "Zone 1" {
  direction: LR,  // Children layout direction
  color: blue,
  padding: 20
}
  @shape child1 "Child 1" { color: green }
  @shape child2 "Child 2" { color: green }
  @shape child3 "Child 3" { color: green }
@end

@zone zone2 "Zone 2" {
  direction: TB,
  color: red
}
  @shape child4 "Child 4" { color: orange }
  @shape child5 "Child 5" { color: orange }
@end

// Edges can connect nodes inside and outside zones
child1 -> child2
child2 -> child4
child4 -> child5
`;

const result = core.parseAndLayout(dsl);
// result.nodes includes:
// - zone1 and zone2 (with isGroup: true)
// - child1, child2, child3 (with parentId: "zone1")
// - child4, child5 (with parentId: "zone2")
```

**Zone Features:**

- **Nested Structure**: Zones can contain any blocks, including other zones
- **Independent Direction**: Each zone can have its own `direction` (LR, RL, TB, BT)
- **Automatic Layout**: Children are automatically positioned within their parent zone
- **Child Constraints**: Use `defaultExtent: 'parent'` option to constrain children within zone boundaries

### Patch DSL

Update diagrams incrementally without regenerating the entire diagram:

```typescript
// Initial diagram
const initialDsl = `
canvas LR
@shape a "Node A"
@shape b "Node B"
a -> b
`;

const result = core.parseAndLayout(initialDsl);

// Apply patch
const patchDsl = `
@add [shape:c] "Node C" { color: purple }
@connect b -> c
@update a { color: red }
@delete b
`;

const patchedResult = core.parseAndLayout(patchDsl, {
  baseGraph: result, // Use previous result as base
});
```

## API Reference

### `CanvasdownCore`

Main class for parsing and layout.

#### Constructor

```typescript
const core = new CanvasdownCore(options?: CanvasdownCoreOptions);
```

**Options:**

```typescript
interface CanvasdownCoreOptions {
  defaultExtent?: 'parent' | [[number, number], [number, number]] | null;
}
```

- `defaultExtent`: Controls default positioning constraint for zone children
  - `'parent'`: Constrain children within parent zone boundaries (default for React Flow group nodes)
  - `undefined` or `null`: Allow free movement of children
  - Custom extent: `[[minX, minY], [maxX, maxY]]` for custom boundaries

#### Methods

##### `registerBlockType(definition: BlockTypeDefinition)`

Register a new block type.

```typescript
core.registerBlockType({
  name: 'my-block',
  defaultProperties: {
    /* ... */
  },
  defaultSize: { width: 200, height: 100 },
  validate: props => boolean,
  propertySchema: Record<string, PropertySchema>,
});
```

##### `getBlockTypeSchema(name: string)`

Get property schema for a block type. Useful for generating LLM template prompts.

```typescript
const schema = core.getBlockTypeSchema('shape');
// Returns: { shapeType: { type: 'enum', enum: [...] }, ... }
```

##### `registerEdgeType(definition: EdgeTypeDefinition)`

Register a new edge type.

```typescript
core.registerEdgeType({
  name: 'my-edge',
  defaultShape: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier',
  defaultStyle?: { stroke: string; strokeWidth: number },
  defaultData?: Record<string, unknown>,
});
```

##### `parseAndLayout(dsl: string, options?: ParseOptions)`

Parse DSL text and apply automatic layout.

```typescript
const result = core.parseAndLayout(dsl, {
  baseGraph: GraphOutput, // For patch mode
  direction: 'LR' | 'RL' | 'TB' | 'BT',
});
```

**Note**: For zone children, positions are calculated relative to their parent zone. React Flow adapters automatically handle `parentId` and `extent` properties.

Returns:

```typescript
{
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    direction: string;
    layoutEngine: 'dagre';
  };
}
```

##### `parse(dsl: string)`

Parse DSL text only (no layout).

```typescript
const ast = core.parse(dsl);
```

##### `layout(graph: GraphOutput, direction?: Direction)`

Apply layout to an existing graph.

```typescript
const laidOut = core.layout(graph, 'LR');
```

## Type Definitions

### `CanvasdownCoreOptions`

```typescript
interface CanvasdownCoreOptions {
  defaultExtent?: 'parent' | [[number, number], [number, number]] | null;
}
```

Controls default behavior for zone children positioning.

### `BlockTypeDefinition`

```typescript
interface BlockTypeDefinition<TProps = Record<string, unknown>> {
  name: string;
  defaultProperties: TProps;
  defaultSize: { width: number; height: number };
  isGroup?: boolean; // Set to true for zone/group nodes
  validate?: (props: TProps) => boolean;
  propertySchema?: Record<string, PropertySchema>;
}
```

**`isGroup` Property:**

- Set `isGroup: true` to mark a block type as a zone/group
- Group nodes can contain child nodes (via `@zone ... @end` syntax)
- Children automatically get `parentId` set to the group's ID
- React Flow adapters will render these as group nodes

### `PropertySchema`

Define property constraints for validation and LLM template generation.

```typescript
interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'enum';
  enum?: string[]; // Required when type is 'enum'
  min?: number; // For number type
  max?: number; // For number type
  pattern?: string; // Regex pattern for string type
  description?: string; // Description for template prompts
}
```

### `EdgeTypeDefinition`

```typescript
interface EdgeTypeDefinition<TData = Record<string, unknown>> {
  name: string;
  defaultShape: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier';
  defaultStyle?: { stroke: string; strokeWidth: number };
  defaultData?: TData;
}
```

### `GraphNode`

```typescript
interface GraphNode<TNodeData = Record<string, unknown>> {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  parentId?: string; // Set for children of zones/groups
  data: TNodeData & {
    extent?: 'parent' | [[number, number], [number, number]] | null;
  };
}
```

**`parentId` Property:**

- Automatically set for children of zones/groups
- Position is relative to parent zone when `parentId` is present
- React Flow adapters use this to render group nodes

**`data.extent` Property:**

- Controls whether child nodes are constrained within parent boundaries
- Set via `defaultExtent` option in `CanvasdownCore` constructor
- Can be overridden per-node in DSL using `extent` property

### `GraphEdge`

```typescript
interface GraphEdge<TEdgeData = Record<string, unknown>> {
  id: string;
  source: string;
  target: string;
  label?: string;
  shape?: string;
  style?: { stroke: string; strokeWidth: number };
  data: TEdgeData;
}
```

## Architecture

```
core/
├── parser/          # Chevrotain-based DSL parser
│   ├── lexer.ts     # Tokenizer
│   ├── parser.ts    # Grammar parser
│   ├── visitor.ts   # AST visitor
│   └── patch-parser.ts  # Patch DSL parser
├── registry/        # Type registration
│   ├── block-type-registry.ts
│   └── edge-type-registry.ts
├── builder/         # AST → Graph conversion
│   └── graph-builder.ts
└── layout/          # Auto layout
    └── dagre-layout.ts
```

## Framework Independence

This package has **zero framework dependencies**. It's pure TypeScript and can be used with:

- React (via `@ssota-labs/canvasdown-reactflow`)
- Vue (build your own adapter)
- Svelte (build your own adapter)
- Vanilla JavaScript
- Node.js
- Any other framework or runtime

The output is simple graph data structures (`{ nodes, edges }`) that any rendering system can consume.

## Examples

### Basic Flowchart

```typescript
const dsl = `
canvas LR

@shape start "Start" { shapeType: ellipse, color: green }
@shape process "Process" { color: blue }
@shape decision "Decision?" { shapeType: diamond, color: yellow }
@shape end "End" { shapeType: ellipse, color: red }

start -> process
process -> decision
decision -> end : "Yes"
decision -> process : "No"
`;

const result = core.parseAndLayout(dsl);
```

### With Zones (Groups)

```typescript
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
  @shape claim1 "Claim 1" { shapeType: rectangle, color: green }
  @shape claim2 "Claim 2" { shapeType: rectangle, color: green }
  @shape claim3 "Claim 3" { shapeType: rectangle, color: green }
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

main_thesis -> claim1 : "supports"
main_thesis -> claim2 : "supports"
claim1 -> ev1 : "based on"
claim2 -> ev2 : "based on"
`;

const result = core.parseAndLayout(dsl);
// Zones and children are automatically laid out with multi-pass layout
```

### With Custom Properties

```typescript
const dsl = `
@schema task {
  status: "todo" | "in-progress" | "done"
  assignee: string | null
  dueDate: string
}

@task task1 "Implement Feature" {
  status: "in-progress"
  assignee: "alice"
  dueDate: "2025-01-20"
}

@task task2 "Write Tests" {
  status: "todo"
  assignee: null
  dueDate: "2025-01-25"
}

task1 -> task2
`;
```

### Edge Labels and Properties

```typescript
const dsl = `
canvas TB

@shape a "Node A"
@shape b "Node B"

a -> b : "main flow" {
  sourceLabel: "from"
  targetLabel: "to"
  animated: true
  style: { stroke: "#ff0000", strokeWidth: 3 }
}
`;
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Test with coverage
pnpm test:coverage

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Related Packages

- [`@ssota-labs/canvasdown-reactflow`](../adapter/react-flow/README.md) — React Flow adapter and hooks
- [Main Canvasdown README](../../README.md) — Full documentation

## License

MIT
